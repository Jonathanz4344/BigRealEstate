from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import user as user_crud
from app.schemas import UserPublic, Login, GoogleLogin
from app.utils.google_oauth import (
    GoogleTokenVerificationError,
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
    try:
        google_profile = verify_google_id_token(login_data.id_token)
    except GoogleTokenVerificationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    user = user_crud.upsert_google_user(db, google_profile)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process Google sign-in.",
        )

    return user
