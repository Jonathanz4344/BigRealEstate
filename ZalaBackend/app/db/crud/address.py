from sqlalchemy.orm import Session
from app.models.address import Address
from app.schemas.address import AddressCreate

def create_address(db: Session, address_in: AddressCreate) -> Address:
    db_address = Address(**address_in.dict())
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

def get_addresses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Address).offset(skip).limit(limit).all()

def get_address(db: Session, address_id: int):
    return db.query(Address).filter(Address.address_id == address_id).first()

def update_address(db: Session, address_id: int, address_in: AddressCreate):
    db_address = db.query(Address).filter(Address.address_id == address_id).first()
    if not db_address:
        return None
    for field, value in address_in.dict().items():
        setattr(db_address, field, value)
    db.commit()
    db.refresh(db_address)
    return db_address

def delete_address(db: Session, address_id: int):
    db_address = db.query(Address).filter(Address.address_id == address_id).first()
    if not db_address:
        return None
    db.delete(db_address)
    db.commit()
    return db_address