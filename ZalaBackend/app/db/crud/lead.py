from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional

from app.models.lead import Lead
from app.models.property import Property
from app.models.user import User
from app.models.contact import Contact
from app import schemas
from fastapi import HTTPException, status


def get_lead_by_id(db: Session, lead_id: int) -> Optional[Lead]:
    # use selectinload for the collection relationship to avoid complex outer-join
    # eager-load nested relationships: properties (with address, units, users), created_by_user, contact and address
    return (
        db.query(Lead)
        .options(
            selectinload(Lead.properties).joinedload(Property.address),
            selectinload(Lead.properties).selectinload(Property.units),
            selectinload(Lead.properties).joinedload(Property.users),
            joinedload(Lead.created_by_user),
            joinedload(Lead.contact),
            joinedload(Lead.address),
        )
        .filter(Lead.lead_id == lead_id)
        .first()
    )


def get_leads(db: Session, skip: int = 0, limit: int = 100) -> List[Lead]:
    return (
        db.query(Lead)
        .options(
            selectinload(Lead.properties).joinedload(Property.address),
            selectinload(Lead.properties).selectinload(Property.units),
            selectinload(Lead.properties).joinedload(Property.users),
            joinedload(Lead.created_by_user),
            joinedload(Lead.contact),
            joinedload(Lead.address),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_lead(db: Session, lead_in: schemas.LeadCreate) -> Lead:
    db_lead = Lead(
        person_type=lead_in.person_type,
        business=lead_in.business,
        website=lead_in.website,
        license_num=lead_in.license_num,
        notes=lead_in.notes,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def update_lead(db: Session, lead_id: int, lead_in: schemas.LeadUpdate) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None

    update_data = lead_in.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_lead, k, v)

    db.commit()
    db.refresh(db_lead)
    return db_lead


def delete_lead(db: Session, lead_id: int) -> bool:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return False
    # unlink properties first
    for prop in db_lead.properties:
        prop.lead_id = None
        db.add(prop)
    db.delete(db_lead)
    db.commit()
    return True


def link_property_to_lead(db: Session, lead_id: int, property_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    prop = db.query(Property).filter(Property.property_id == property_id).first()
    if not prop:
        return None
    prop.lead_id = lead_id
    db.add(prop)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def unlink_property_from_lead(db: Session, lead_id: int, property_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    prop = db.query(Property).filter(Property.property_id == property_id).first()
    if not prop:
        return None
    if prop.lead_id != lead_id:
        return db_lead
    prop.lead_id = None
    db.add(prop)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def link_user_to_lead(db: Session, lead_id: int, user_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    # load the user's contact relationship as well so we can copy contact_id if present
    user = db.query(User).options(joinedload(User.contact)).filter(User.user_id == user_id).first()
    if not user:
        return None
    # set created_by and also copy the user's contact_id into the lead if available
    db_lead.created_by = user.user_id
    # try the contact_id column first; if it's None, fall back to the loaded contact relationship
    contact_id = getattr(user, "contact_id", None)
    if not contact_id and getattr(user, "contact", None):
        contact_id = getattr(user.contact, "contact_id", None)
    if contact_id:
        db_lead.contact_id = contact_id
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def unlink_user_from_lead(db: Session, lead_id: int, user_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    if db_lead.created_by != user_id:
        return db_lead
    # clear created_by and also clear contact_id which was populated when the user was linked
    db_lead.created_by = None
    db_lead.contact_id = None
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def link_contact_to_lead(db: Session, lead_id: int, contact_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not contact:
        return None
    # ensure the contact is not already linked to a different lead (contact_id is unique on leads)
    existing = db.query(Lead).filter(Lead.contact_id == contact_id).first()
    if existing and existing.lead_id != lead_id:
        return None
    db_lead.contact_id = contact_id
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def unlink_contact_from_lead(db: Session, lead_id: int, contact_id: int) -> Optional[Lead]:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    if db_lead.contact_id != contact_id:
        return db_lead
    db_lead.contact_id = None
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead
