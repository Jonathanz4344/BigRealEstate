from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import user as user_crud
from app.db.crud import contact as contact_crud
from app import schemas
from typing import List
from app import schemas as _schemas

router = APIRouter(
    prefix="/users",
)


@router.post("/",tags=["Users"], response_model=schemas.UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
        user_in: schemas.UserCreate,
        db: Session = Depends(get_db)
):
    """
    Create a new user
    """
    user_by_username = user_crud.get_user_by_username(db, username=user_in.username)
    if user_by_username:  # check if exists already (username)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists.",
        )
    # If client passed contact_id, ensure that contact exists
    if getattr(user_in, "contact_id", None):
        db_contact = contact_crud.get_contact_by_id(db, contact_id=user_in.contact_id)
        if not db_contact:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid contact_id")

    new_user = user_crud.create_user(db=db, user=user_in)  # create user without creating a Contact
    if new_user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create user (invalid contact_id?)")
    return new_user


@router.get("/",tags=["Users"], response_model=List[schemas.UserPublic])
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


@router.get("/{user_id}", tags=["Users"], response_model=schemas.UserPublic)
def read_user_by_id(
        user_id: int,
        db: Session = Depends(get_db)
):
    """
    Retrieve a single user by their ID, including their leads and properties.
    """
    db_user = user_crud.get_user_by_id(db, user_id=user_id)
    if db_user is None:  # no user
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return db_user


@router.put("/{user_id}",tags=["Users"], response_model=schemas.UserPublic)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = user_crud.update_user(db=db, user_id=user_id, user=user)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/{user_id}", tags=["Users"],status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete a User by ID
    """
    success = user_crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return None

@router.get("/{user_id}/contact", response_model=_schemas.ContactPublic, summary="Read Contact for User By Id", tags=["User Contact Link"])
def read_user_contact(user_id: int, db: Session = Depends(get_db)):
    """Get the contact record associated with a user."""
    contact = user_crud.get_contact_for_user(db, user_id=user_id)
    if contact is None:
        # Distinguish between missing user and missing contact
        db_user = user_crud.get_user_by_id(db, user_id=user_id)
        if db_user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found for user")
    return contact

@router.post("/{user_id}/contacts/{contact_id}", response_model=schemas.UserPublic, summary="Link Contact", tags=["User Contact Link"])
def link_contact(user_id: int, contact_id: int, db: Session = Depends(get_db)):
    """Link an existing Contact to a User (attach contact_id to user)."""
    db_user = user_crud.link_contact_to_user(db=db, user_id=user_id, contact_id=contact_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User or Contact not found, or contact already linked")
    return db_user


@router.delete("/{user_id}/contacts/{contact_id}", response_model=schemas.UserPublic, summary="Unlink Contact", tags=["User Contact Link"])
def unlink_contact(user_id: int, contact_id: int, db: Session = Depends(get_db)):
    """Unlink (but do not delete) a Contact from a User."""
    db_user = user_crud.unlink_contact_from_user(db=db, user_id=user_id, contact_id=contact_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/{user_id}/properties", response_model=List[schemas.PropertyPublic], summary="Read Properties Linked To User By Id", tags=["User Properties Link"])
def read_user_properties(user_id: int, db: Session = Depends(get_db)):
    """Return the list of properties assigned to a user (agent)."""
    db_user = user_crud.get_user_by_id(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    properties = user_crud.get_properties_for_user(db, user_id=user_id)
    # return empty list if none
    return properties or []

@router.post("/{user_id}/properties/{property_id}", response_model=schemas.UserPublicWithProperties, summary="Link Property", tags=["User Properties Link"])
def add_property(user_id: int, property_id: int, db: Session = Depends(get_db)):
    """Assign a Property to a User (agent)."""
    db_user = user_crud.add_property_to_user(db=db, user_id=user_id, property_id=property_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User or Property not found")
    # convert properties relationship to list of property IDs to match response schema
    try:
        db_user.properties = user_crud.get_property_ids_for_user(db, user_id)
    except Exception:
        # fallback: return user without properties modification
        pass
    return db_user


@router.delete("/{user_id}/properties/{property_id}", response_model=schemas.UserPublicWithProperties, summary="Unlink Property", tags=["User Properties Link"])
def remove_property(user_id: int, property_id: int, db: Session = Depends(get_db)):
    """Unassign a Property from a User."""
    db_user = user_crud.remove_property_from_user(db=db, user_id=user_id, property_id=property_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User or Property not found")
    # convert properties relationship to list of property IDs to match response schema
    try:
        db_user.properties = user_crud.get_property_ids_for_user(db, user_id)
    except Exception:
        pass
    return db_user
