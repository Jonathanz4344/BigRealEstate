from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import user as user_crud
from app.db.crud import google_credentials as google_credentials_crud
from app.schemas import UserPublic, Login, GoogleLogin
from app.utils.google_oauth import (
    GoogleTokenVerificationError,
    GoogleOAuthExchangeError,
    exchange_code_for_tokens,
    verify_google_id_token,
)

router = APIRouter(
    prefix="/login",
    tags=["Login"],
)


@router.post("/", response_model=UserPublic)
def login(login_data: Login, db: Session = Depends(get_db)):
    """
    login route
    """
    user = user_crud.authenticate_user(
        db,
        username=login_data.username,
        password=login_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    return user


@router.post("/google", response_model=UserPublic)
def login_with_google(login_data: GoogleLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user using a Google ID token.
    """
    oauth_tokens = None
    try:
        if login_data.code:
            oauth_tokens = exchange_code_for_tokens(login_data.code)
            id_token_value = oauth_tokens.get("id_token")
            google_profile = verify_google_id_token(id_token_value)
        else:
            google_profile = verify_google_id_token(login_data.id_token or "")
    except (GoogleTokenVerificationError, GoogleOAuthExchangeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    target_user = None
    google_email = (google_profile.get("email") or "").lower()

    if login_data.target_user_id is not None:
        target_user = user_crud.get_user_by_id(db, login_data.target_user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found for Google linking.",
            )

        target_email = ""
        if target_user.authentication and target_user.authentication.provider_email:
            target_email = target_user.authentication.provider_email.lower()
        elif target_user.contact and target_user.contact.email:
            target_email = target_user.contact.email.lower()

        if not google_email or not target_email or google_email != target_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please sign into Google with the same email as your Zala account to connect it.",
            )

    user = user_crud.upsert_google_user(db, google_profile)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process Google sign-in.",
        )

    if target_user and user.user_id != target_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account is already linked to another user.",
        )

    if oauth_tokens:
        expires_in = int(oauth_tokens.get("expires_in") or 0)
        access_token = oauth_tokens.get("access_token")
        refresh_token = oauth_tokens.get("refresh_token")
        scope = oauth_tokens.get("scope") or login_data.scope

        if access_token and expires_in:
            google_credentials_crud.upsert_tokens(
                db,
                user.user_id,
                access_token=access_token,
                expires_in=expires_in,
                scope=scope,
                refresh_token=refresh_token,
            )

    return user
