from typing import List, Optional

from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.models.campaign import Campaign
from app.models.campaign_email import CampaignEmail


def _base_query(db: Session):
    return db.query(CampaignEmail).options(
        joinedload(CampaignEmail.campaign).joinedload(Campaign.user),
        joinedload(CampaignEmail.campaign).selectinload(Campaign.leads),
        joinedload(CampaignEmail.lead),
    )


def get_campaign_email(db: Session, message_id: int) -> Optional[CampaignEmail]:
    """
    Fetch a single campaign message.
    """
    return (
        _base_query(db)
        .filter(CampaignEmail.message_id == message_id)
        .first()
    )


def get_campaign_emails(db: Session, skip: int = 0, limit: int = 100) -> List[CampaignEmail]:
    """
    Fetch multiple campaign messages.
    """
    return (
        _base_query(db)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_campaign_emails_for_campaign(
        db: Session,
        campaign_id: int,
        skip: int = 0,
        limit: int = 100,
        # contact_methods: Optional[List[schemas.ContactMethod]] = None,
) -> List[CampaignEmail]:
    """
    Fetch messages for a given campaign.
    """
    query = _base_query(db).filter(CampaignEmail.campaign_id == campaign_id)

    # if contact_methods:
    #     contact_method_values = [
    #         contact_method.value
    #         if hasattr(contact_method, "value")
    #         else contact_method
    #         for contact_method in contact_methods
    #     ]
    #     query = query.filter(CampaignEmail.contact_method.in_(contact_method_values))

    return query.offset(skip).limit(limit).all()


def get_campaign_emails_by_lead(
        db: Session,
        campaign_id: int,
        lead_id: int,
        skip: int = 0,
        limit: int = 100,
) -> List[CampaignEmail]:
    """
    Fetch emails for a given campaign and lead.
    """
    query = _base_query(db).filter(CampaignEmail.campaign_id == campaign_id, CampaignEmail.lead_id == lead_id)

    return query.offset(skip).limit(limit).all()


def create_campaign_email(db: Session, message_in: schemas.CampaignEmailCreate) -> CampaignEmail:
    """
    Create and persist a campaign message.
    """
    db_message = CampaignEmail(**message_in.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def update_campaign_email(
        db: Session, message_id: int, message_in: schemas.CampaignEmailUpdate
) -> Optional[CampaignEmail]:
    """
    Update a campaign message.
    """
    db_message = db.query(CampaignEmail).filter(CampaignEmail.message_id == message_id).first()
    if not db_message:
        return None

    for field, value in message_in.dict(exclude_unset=True).items():
        setattr(db_message, field, value)

    db.commit()
    db.refresh(db_message)
    return db_message


def delete_campaign_email(db: Session, message_id: int) -> bool:
    """
    Delete a campaign message.
    """
    db_message = db.query(CampaignEmail).filter(CampaignEmail.message_id == message_id).first()
    if not db_message:
        return False

    db.delete(db_message)
    db.commit()
    return True
