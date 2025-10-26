from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy.exc import IntegrityError

from fastapi import HTTPException, status

from app.models.unit import Unit
from app.models.property import Property
from app.schemas.unit import UnitCreate, UnitUpdate


def create_unit(db: Session, unit_in: UnitCreate, property_id: int) -> Unit:
    """Create a unit for a specific property (property_id is authoritative).

    Validates that the property exists and returns a friendly HTTP error
    if the FK would fail.
    """
    # Ensure the parent property exists
    prop = db.query(Property).filter(Property.property_id == property_id).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    db_unit = Unit(
        property_id=property_id,
        apt_num=unit_in.apt_num,
        bedrooms=unit_in.bedrooms,
        bath=unit_in.bath,
        sqft=unit_in.sqft,
        notes=unit_in.notes,
    )
    db.add(db_unit)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e.orig))
    db.refresh(db_unit)
    return db_unit


def get_units(db: Session, property_id: int, skip: int = 0, limit: int = 100) -> List[Unit]:
    """List units for a given property.

    If the property doesn't exist return empty list (route may choose to 404 instead).
    """
    return db.query(Unit).filter(Unit.property_id == property_id).offset(skip).limit(limit).all()


def get_unit(db: Session, property_id: int, unit_id: int) -> Optional[Unit]:
    """Get a single unit by id scoped to a property."""
    return db.query(Unit).filter(Unit.unit_id == unit_id, Unit.property_id == property_id).first()


def update_unit(db: Session, property_id: int, unit_id: int, unit_in: UnitUpdate) -> Optional[Unit]:
    db_unit = db.query(Unit).filter(Unit.unit_id == unit_id, Unit.property_id == property_id).first()
    if not db_unit:
        return None

    update_data = unit_in.dict(exclude_unset=True)
    # prevent changing the property association via update
    if "property_id" in update_data:
        update_data.pop("property_id")

    for key, value in update_data.items():
        setattr(db_unit, key, value)

    db.commit()
    db.refresh(db_unit)
    return db_unit


def delete_unit(db: Session, property_id: int, unit_id: int) -> Optional[Unit]:
    db_unit = db.query(Unit).filter(Unit.unit_id == unit_id, Unit.property_id == property_id).first()
    if not db_unit:
        return None
    db.delete(db_unit)
    db.commit()
    return db_unit
