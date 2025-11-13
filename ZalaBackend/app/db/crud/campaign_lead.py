from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.models.campaign import Campaign
from app.models.campaign_lead import CampaignLead

from app.models import Lead


def link_lead_to_campaign(db: Session, campaign_id: int, lead_id: int) -> CampaignLead:
    """
    Create a new association between a campaign and a lead.
    Returns the existing link if it already exists.
    """
    db_link = get_campaign_lead(db, campaign_id=campaign_id, lead_id=lead_id)
    if db_link:
        return db_link

    db_campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
    if not db_campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    db_link = CampaignLead(
        campaign_id=campaign_id,
        lead_id=lead_id
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def get_campaign_lead(db: Session, campaign_id: int, lead_id: int) -> Optional[CampaignLead]:
    """
    Fetch campaign lead.
    """
    return (
        db.query(CampaignLead)
        .options(
            joinedload(CampaignLead.campaign).joinedload(Campaign.user),
            joinedload(CampaignLead.lead)
        )
        .filter(CampaignLead.campaign_id == campaign_id, CampaignLead.lead_id == lead_id)
        .first()
    )


def update_campaign_lead_status(db: Session, campaign_id: int, lead_id: int, status_in: schemas.CampaignLeadUpdate) -> Optional[CampaignLead]:
    """
    Update the contact status for a lead in a campaign.
    """
    db_link = get_campaign_lead(db, campaign_id, lead_id)
    if not db_link:
        return None

    update_data = status_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_link, key, value)

    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def delete_lead_from_campaign(db: Session, campaign_id: int, lead_id: int) -> bool:
    """
    Delete link between campaign and lead
    """
    db_link = get_campaign_lead(db, campaign_id=campaign_id, lead_id=lead_id)

    if not db_link:
        return False

    db.delete(db_link)
    db.commit()
    return True

# def get_campaign_contact_methods(
#         db: Session,
#         campaign_id: int,
#         lead_id: int
# ) -> {}:
#     contact_methods = []
#
#     query = _base_query(db).filter(CampaignLead.campaign_id == campaign_id, CampaignLead.lead_id == lead_id,
#                                    CampaignMessage.contact_method == "phone")
#     if query.first():
#         contact_methods.append("phone")
#
#     query = _base_query(db).filter(CampaignMessage.campaign_id == campaign_id, CampaignMessage.lead_id == lead_id,
#                                    CampaignMessage.contact_method == "sms")
#     if query.first():
#         contact_methods.append("sms")
#     query = _base_query(db).filter(CampaignMessage.campaign_id == campaign_id, CampaignMessage.lead_id == lead_id,
#                                    CampaignMessage.contact_method == "email")
#     if query.first():
#         contact_methods.append("email")
#
#     return contact_methods
