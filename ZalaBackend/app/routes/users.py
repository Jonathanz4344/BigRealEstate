from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ZalaBackend.app.db.session import get_db
from ZalaBackend.app.db.crud import user as user_crud
from ZalaBackend.app import schemas

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/", response_model=schemas.UserPublic, status_code=status.HTTP_201_CREATED)
def create_new_user(
        user_in: schemas.UserCreate,
        db: Session = Depends(get_db)
):
    """
    Create a new user
    """
    user_by_username = user_crud.get_user_by_username(db, username=user_in.username)
    if user_by_username:    # check if exists already (username)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists.",
        )

    user_by_email = user_crud.get_user_by_email(db, email=user_in.contact.email)
    if user_by_email:       # check if exists already (email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    new_user = user_crud.create_user(db=db, user=user_in)   # create user
    return new_user


@router.get("/", response_model=List[schemas.UserPublic])
def read_users(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """
    Retrieve a list of users.
    """
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=schemas.UserPublicWithLeadsAndProperties)
def get_user_by_id(
        user_id: int,
        db: Session = Depends(get_db)
):
    """
    Retrieve a single user by their ID, including their leads and properties.
    """
    db_user = user_crud.get_user_by_id(db, user_id=user_id)
    if db_user is None:     # no user
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return db_user
