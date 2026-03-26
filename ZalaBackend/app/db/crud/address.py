import logging
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from fastapi import HTTPException, status

from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate
from app.utils.geocode import geocode_location

logger = logging.getLogger(__name__)


def _auto_geocode(address_obj: Address) -> None:
    """If lat/long are missing, attempt to geocode from the address fields."""
    has_lat = address_obj.lat is not None and address_obj.lat != 0
    has_long = address_obj.long is not None and address_obj.long != 0
    if has_lat and has_long:
        return

    parts = [
        address_obj.street_1,
        address_obj.city,
        address_obj.state,
        address_obj.zipcode,
    ]
    query = ", ".join(str(p) for p in parts if p)
    if not query:
        return

    try:
        result = geocode_location(query)
        if result:
            address_obj.lat = Decimal(str(result["latitude"]))
            address_obj.long = Decimal(str(result["longitude"]))
    except Exception as exc:
        logger.warning("Auto-geocode failed for '%s': %s", query, exc)


def create_address(db: Session, address_in: AddressCreate) -> Address:
    db_address = Address(**address_in.dict())

    # Auto-geocode when lat/long not supplied
    _auto_geocode(db_address)

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

    # Re-geocode if address fields changed but lat/long are still missing
    _auto_geocode(db_address)

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