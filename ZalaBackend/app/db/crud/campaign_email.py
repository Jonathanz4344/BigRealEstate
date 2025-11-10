from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.db.crud import campaign as campaign_crud
from app.models.campaign import Campaign
from app.models.campaign_email import CampaignEmail
from app.models.campaign_lead import CampaignLead


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


def send_campaign_email(db: Session, message_in: schemas.CampaignEmailSendRequest) -> Campaign:
    """
    Send a campaign email to multiple leads and return the hydrated campaign.
    """
    lead_ids = list(dict.fromkeys(message_in.lead_id or []))
    if not lead_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="lead_id must include at least one lead id.",
        )

    campaign = campaign_crud.get_campaign(db, message_in.campaign_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    linked_ids = {
        link.lead_id
        for link in db.query(CampaignLead)
        .filter(CampaignLead.campaign_id == message_in.campaign_id, CampaignLead.lead_id.in_(lead_ids))
        .all()
    }
    missing_links = sorted(set(lead_ids) - linked_ids)
    if missing_links:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lead IDs not linked to this campaign: {missing_links}",
        )

    new_messages = []
    for lead_id in lead_ids:
        db_message = CampaignEmail(
            campaign_id=message_in.campaign_id,
            lead_id=lead_id,
            message_subject=message_in.message_subject,
            message_body=message_in.message_body,
        )
        db.add(db_message)
        new_messages.append(db_message)

    if new_messages:
        (
            db.query(CampaignLead)
            .filter(
                CampaignLead.campaign_id == message_in.campaign_id,
                CampaignLead.lead_id.in_(lead_ids),
            )
            .update({CampaignLead.email_contacted: True}, synchronize_session=False)
        )

    db.commit()
    for message in new_messages:
        db.refresh(message)

    return campaign_crud.get_campaign(db, message_in.campaign_id)


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
