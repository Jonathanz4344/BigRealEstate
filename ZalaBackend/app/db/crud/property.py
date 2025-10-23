from sqlalchemy.orm import Session
from app.models.property import Property
from app.models.address import Address
from app.schemas.property import PropertyCreate

def create_property(db: Session, property_in: PropertyCreate) -> Property:
    # Create Address first (nested create)
    db_address = Address(**property_in.address.dict())
    db.add(db_address)
    db.commit()
    db.refresh(db_address)

    db_property = Property(
        property_name=property_in.property_name,
        mls_number=property_in.mls_number,
        notes=property_in.notes,
        # lead_id=property_in.lead_id,
        address_id=db_address.address_id
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

def get_properties(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Property).offset(skip).limit(limit).all()

def get_property(db: Session, property_id: int):
    return db.query(Property).filter(Property.property_id == property_id).first()

def update_property(db: Session, property_id: int, property_in: PropertyCreate):
    db_property = db.query(Property).filter(Property.property_id == property_id).first()
    if not db_property:
        return None

    # Update nested address
    if db_property.address:
        for field, value in property_in.address.dict().items():
            setattr(db_property.address, field, value)

    db_property.property_name = property_in.property_name
    db_property.mls_number = property_in.mls_number
    db_property.notes = property_in.notes
    db_property.lead_id = property_in.lead_id

    db.commit()
    db.refresh(db_property)
    return db_property

def delete_property(db: Session, property_id: int):
    db_property = db.query(Property).filter(Property.property_id == property_id).first()
    if not db_property:
        return None
    db.delete(db_property)
    db.commit()
    return db_property