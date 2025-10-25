from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from typing import Optional, List

from fastapi import HTTPException, status

from app.models.property import Property
from app.models.address import Address
from app.schemas.property import PropertyCreate, PropertyUpdate


def create_property(db: Session, property_in: PropertyCreate, address_id: int) -> Property:
    # Validate provided address_id exists
    db_address = db.query(Address).filter(Address.address_id == address_id).first()
    if not db_address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    db_property = Property(
        property_name=property_in.property_name,
        mls_number=property_in.mls_number,
        notes=property_in.notes,
        # lead_id=property_in.lead_id,
        address_id=address_id
    )
    db.add(db_property)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e.orig))

    db.refresh(db_property)
    return db_property


def get_properties(db: Session, address_id: int, skip: int = 0, limit: int = 100) -> List[Property]:
    """Return properties for an address, eager-loading address and units to avoid N+1."""
    return (
        db.query(Property)
        .options(joinedload(Property.address), joinedload(Property.units))
        .filter(Property.address_id == address_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_property(db: Session, address_id: int, property_id: int) -> Optional[Property]:
    """Get single property scoped to address, eager-loading address and units."""
    return (
        db.query(Property)
        .options(joinedload(Property.address), joinedload(Property.units))
        .filter(Property.property_id == property_id, Property.address_id == address_id)
        .first()
    )


def update_property(db: Session, address_id: int, property_id: int, property_in: PropertyUpdate):
    db_property = db.query(Property).filter(Property.property_id == property_id, Property.address_id == address_id).first()
    if not db_property:
        return None

    # Address association is managed by the path; do not change address_id here

    if property_in.property_name is not None:
        db_property.property_name = property_in.property_name
    if property_in.mls_number is not None:
        db_property.mls_number = property_in.mls_number
    if property_in.notes is not None:
        db_property.notes = property_in.notes
    if hasattr(property_in, "lead_id") and property_in.lead_id is not None:
        db_property.lead_id = property_in.lead_id

    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e.orig))

    db.refresh(db_property)
    return db_property


def delete_property(db: Session, address_id: int, property_id: int):
    """Delete a property only if it belongs to the given address."""
    db_property = db.query(Property).filter(Property.property_id == property_id, Property.address_id == address_id).first()
    if not db_property:
        return None
    db.delete(db_property)
    db.commit()
    return db_property
