from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from app import schemas
from app.models.campaign import Campaign
from app.models.lead import Lead

from app.models import CampaignLead


def get_campaign(db: Session, campaign_id: int) -> Optional[Campaign]:
    """
    Fetch a single campaign with its related user and leads.
    """
    return (
        db.query(Campaign)
        .options(
            joinedload(Campaign.user),
            selectinload(Campaign.leads).joinedload(CampaignLead.lead)
        )
        .filter(Campaign.campaign_id == campaign_id)
        .first()
    )


def get_campaigns(db: Session, skip: int = 0, limit: int = 100) -> List[Campaign]:
    """
    List campaigns with pagination support.
    """
    return (
        db.query(Campaign)
        .options(
            joinedload(Campaign.user),
            selectinload(Campaign.leads).joinedload(CampaignLead.lead)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_campaign(db: Session, campaign_in: schemas.CampaignCreate) -> Campaign:
    """
    Create and persist a new campaign.
    """

    payload = campaign_in.model_dump()
    lead_ids = list(dict.fromkeys(payload.pop("lead_ids", [])))

    db_campaign = Campaign(**payload)

    if lead_ids:
        leads = db.query(Lead).filter(Lead.lead_id.in_(lead_ids)).all()
        found_ids = {lead.lead_id for lead in leads}
        missing = sorted(set(lead_ids) - found_ids)
        if missing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lead IDs not found: {missing}",
            )

        for lead in leads:
            association = CampaignLead(
                lead=lead
            )
            db_campaign.leads.append(association)

    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign


def update_campaign(db: Session, campaign_id: int, campaign_in: schemas.CampaignUpdate) -> Optional[Campaign]:
    """
    Update mutable fields on a campaign.
    """

    db_campaign = (
        db.query(Campaign)
        .options(selectinload(Campaign.leads))
        .filter(Campaign.campaign_id == campaign_id)
        .first()
    )
    if not db_campaign:
        return None

    update_data = campaign_in.model_dump(exclude_unset=True)
    lead_ids = update_data.pop("lead_ids", None)

    for field, value in update_data.items():
        setattr(db_campaign, field, value)

    if lead_ids is not None:
        db_campaign.leads.clear()   # clear cascade old leads (delete from campaign_leads)

        deduped_ids = list(dict.fromkeys(lead_ids))
        if deduped_ids:
            leads = db.query(Lead).filter(Lead.lead_id.in_(deduped_ids)).all()
            found_ids = {lead.lead_id for lead in leads}
            missing = sorted(set(deduped_ids) - found_ids)
            if missing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Lead IDs not found: {missing}",
                )

            for lead in leads:
                association = CampaignLead(lead=lead)
                db_campaign.leads.append(association)

    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign


def delete_campaign(db: Session, campaign_id: int) -> bool:
    """
    Delete a campaign and cascade its messages.
    """
    db_campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
    if not db_campaign:
        return False

    db.delete(db_campaign)
    db.commit()
    return True
