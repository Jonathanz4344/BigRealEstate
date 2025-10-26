from sqlalchemy.orm import Session

from ZalaBackend.app import models
from ZalaBackend.app import schemas

"""GET FUNCTIONS"""


def get_lead_by_id(db: Session, lead_id: int):
    """
    Get a single user by their ID
    SELECT * FROM users WHERE lead_id = {lead_id}
    """
    return db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()


def get_leads(db: Session, skip: int = 0, limit: int = 100):
    """
    Get a list of ALL leads with limits   TODO Add user_id filter
    SELECT * FROM leads OFFSET {skip} LIMIT {limit};
    """
    return db.query(models.Lead).offset(skip).limit(limit).all()


"""CREATE FUNCTIONS"""


def create_lead(db: Session, lead: schemas.LeadCreate):
    """
    Create a new user and all associated records.
    This function handles:
    1. Create new Contact - INSERT INTO contacts
    2. Create new Address if exists - INSERT INTO addresses
    3. Create new Lead record - INSERT INTO leads

    """
    db_contact = models.Contact(**lead.contact.dict())
    db.add(db_contact)

    db_address = None
    if lead.address:
        db_address = models.Address(**lead.address.dict())

    if db_address:
        db.add(db_address)

    db.flush()

    db_lead = models.Lead(
        contact_id=db_contact.contact_id,  # foreign key link to contact
        address_id=db_address.address_id if db_address else None,
        created_by=lead.created_by_user_id,
        person_type=lead.person_type,
        business=lead.business,
        website=lead.website,
        license_num=lead.license_num,
        notes=lead.notes
    )
    db.add(db_lead)
    db.commit()     # db_address, db_contact, db_lead
    db.refresh(db_lead)

    return db_lead


def update_lead(db: Session, lead_id: int, lead: schemas.LeadUpdate):
    db_lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not db_lead:
        return None

    update_data = lead.dict(exclude_unset=True)

    if "contact" in update_data:
        contact_data = update_data.pop("contact")
        if db_lead.contact:
            for key, value in contact_data.items():
                setattr(db_lead.contact, key, value)

    if "address" in update_data:
        address_data = update_data.pop("address")
        if db_lead.address:
            for key, value in address_data.items():
                setattr(db_lead.address, key, value)

    for key, value in update_data.items():
        setattr(db_lead, key, value)

    db.commit()
    db.refresh(db_lead)
    return db_lead


def delete_lead(db: Session, lead_id: int):
    db_lead = db.query(models.Lead).filter(models.Lead.lead_id == lead_id).first()
    if not db_lead:
        return None
    db.delete(db_lead)
    db.commit()
    return db_lead
