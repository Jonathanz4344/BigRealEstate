from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.crud import contact as contact_crud
from app import schemas

router = APIRouter(
    prefix="/contacts",
    tags=["Contacts"],
)


@router.post("/", response_model=schemas.ContactPublic, status_code=status.HTTP_201_CREATED)
def create_new_contact(contact_in: schemas.ContactCreate, db: Session = Depends(get_db)):
    """
    Create a new contact
    """
    return contact_crud.create_contact(db=db, contact_in=contact_in)


@router.get("/", response_model=List[schemas.ContactPublic])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get a list of contacts
    """
    return contact_crud.get_contacts(db, skip=skip, limit=limit)


@router.get("/{contact_id}", response_model=schemas.ContactPublic)
def get_contact_by_id(contact_id: int, db: Session = Depends(get_db)):
    """
    Get a contact by ID
    """
    db_contact = contact_crud.get_contact_by_id(db, contact_id=contact_id)
    if not db_contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return db_contact


@router.put("/{contact_id}", response_model=schemas.ContactPublic)
def update_contact(contact_id: int, contact_in: schemas.ContactUpdate = Body(...), db: Session = Depends(get_db)):
    """
    Update a contact by ID
    """
    db_contact = contact_crud.update_contact(db, contact_id=contact_id, contact_in=contact_in)
    if not db_contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return db_contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """
    Delete a contact by ID
    """
    success = contact_crud.delete_contact(db, contact_id=contact_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return None