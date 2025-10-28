from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.contact import Contact
from app import schemas


"""GET FUNCTIONS"""


def get_contact_by_id(db: Session, contact_id: int) -> Optional[Contact]:
    """
    Get a single contact by ID
    SQL: SELECT * FROM contacts WHERE contact_id = {contact_id}
    """
    return db.query(Contact).filter(Contact.contact_id == contact_id).first()


def get_contacts(db: Session, skip: int = 0, limit: int = 100) -> List[Contact]:
    """
    Get a list of contacts with pagination
    SQL: SELECT * FROM contacts OFFSET {skip} LIMIT {limit}
    """
    return db.query(Contact).offset(skip).limit(limit).all()


"""CREATE FUNCTION"""

def create_contact(db: Session, contact_in: schemas.ContactCreate) -> Contact:
    """
    Create a new contact
    SQL: INSERT INTO contacts (first_name, last_name, email, phone) VALUES (...)
    """

    # Check for duplicate email
    if contact_in.email:
        existing = db.query(Contact).filter(Contact.email == contact_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contact with this email already exists."
            )

    # Check for duplicate phone
    if contact_in.phone:
        existing = db.query(Contact).filter(Contact.phone == contact_in.phone).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contact with this phone already exists."
            )

    db_contact = Contact(
        first_name=contact_in.first_name,
        last_name=contact_in.last_name,
        email=contact_in.email,
        phone=contact_in.phone,
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


"""UPDATE FUNCTION"""


def update_contact(db: Session, contact_id: int, contact_in: schemas.ContactUpdate) -> Optional[Contact]:
    """
    Update an existing contact by ID
    SQL: UPDATE contacts SET first_name = ..., last_name = ..., email = ..., phone = ... WHERE contact_id = {contact_id}
    """
    db_contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not db_contact:
        return None

    # Check for duplicate email (if updating email)
    if contact_in.email and contact_in.email != db_contact.email:
        existing = db.query(Contact).filter(Contact.email == contact_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another contact with this email already exists."
            )

    # Check for duplicate phone (if updating phone)
    if contact_in.phone and contact_in.phone != db_contact.phone:
        existing = db.query(Contact).filter(Contact.phone == contact_in.phone).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another contact with this phone already exists."
            )

    db_contact.first_name = contact_in.first_name
    db_contact.last_name = contact_in.last_name
    db_contact.email = contact_in.email
    db_contact.phone = contact_in.phone

    db.commit()
    db.refresh(db_contact)
    return db_contact


"""DELETE FUNCTION"""


def delete_contact(db: Session, contact_id: int) -> bool:
    """
    Delete a contact by ID
    SQL: DELETE FROM contacts WHERE contact_id = {contact_id}
    """
    db_contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not db_contact:
        return False

    db.delete(db_contact)
    db.commit()
    return True