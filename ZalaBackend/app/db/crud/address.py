from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from fastapi import HTTPException, status

from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


def create_address(db: Session, address_in: AddressCreate) -> Address:
    db_address = Address(**address_in.dict())
    db.add(db_address)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e.orig))
    db.refresh(db_address)
    return db_address


def get_addresses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Address).offset(skip).limit(limit).all()


def get_address(db: Session, address_id: int):
    return db.query(Address).filter(Address.address_id == address_id).first()


def update_address(db: Session, address_id: int, address_in: AddressUpdate):
    db_address = db.query(Address).filter(Address.address_id == address_id).first()
    if not db_address:
        return None
    update_data = address_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_address, field, value)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e.orig))
    db.refresh(db_address)
    return db_address


def delete_address(db: Session, address_id: int):
    # ensure address isn't referenced by a property - property CRUD will enforce FK constraints 
    db_address = db.query(Address).filter(Address.address_id == address_id).first()
    if not db_address:
        return None
    db.delete(db_address)
    db.commit()
    return db_address