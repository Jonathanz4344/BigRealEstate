from typing import List, Optional

from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.models.campaign import Campaign
from app.models.campaign_messages import CampaignMessage


def _base_query(db: Session):
    return db.query(CampaignMessage).options(
        joinedload(CampaignMessage.campaign).joinedload(Campaign.user),
        joinedload(CampaignMessage.campaign).selectinload(Campaign.leads),
        joinedload(CampaignMessage.lead),
    )


def get_campaign_message(db: Session, message_id: int) -> Optional[CampaignMessage]:
    """
    Fetch a single campaign message.
    """
    return (
        _base_query(db)
        .filter(CampaignMessage.message_id == message_id)
        .first()
    )


def get_campaign_messages(db: Session, skip: int = 0, limit: int = 100) -> List[CampaignMessage]:
    """
    Fetch multiple campaign messages.
    """
    return (
        _base_query(db)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_campaign_messages_for_campaign(
    db: Session,
    campaign_id: int,
    skip: int = 0,
    limit: int = 100,
    contact_methods: Optional[List[schemas.ContactMethod]] = None,
) -> List[CampaignMessage]:
    """
    Fetch messages for a given campaign.
    """
    query = _base_query(db).filter(CampaignMessage.campaign_id == campaign_id)

    if contact_methods:
        contact_method_values = [
            contact_method.value
            if hasattr(contact_method, "value")
            else contact_method
            for contact_method in contact_methods
        ]
        query = query.filter(CampaignMessage.contact_method.in_(contact_method_values))

    return query.offset(skip).limit(limit).all()


def create_campaign_message(db: Session, message_in: schemas.CampaignMessageCreate) -> CampaignMessage:
    """
    Create and persist a campaign message.
    """
    db_message = CampaignMessage(**message_in.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def update_campaign_message(
    db: Session, message_id: int, message_in: schemas.CampaignMessageUpdate
) -> Optional[CampaignMessage]:
    """
    Update a campaign message.
    """
    db_message = db.query(CampaignMessage).filter(CampaignMessage.message_id == message_id).first()
    if not db_message:
        return None

    for field, value in message_in.dict(exclude_unset=True).items():
        setattr(db_message, field, value)

    db.commit()
    db.refresh(db_message)
    return db_message


def delete_campaign_message(db: Session, message_id: int) -> bool:
    """
    Delete a campaign message.
    """
    db_message = db.query(CampaignMessage).filter(CampaignMessage.message_id == message_id).first()
    if not db_message:
        return False

    db.delete(db_message)
    db.commit()
    return True
