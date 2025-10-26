from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import user as user_crud
from app.schemas import UserPublic, Login

router = APIRouter(
    prefix="/login",
    tags=["Authentication"],
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
