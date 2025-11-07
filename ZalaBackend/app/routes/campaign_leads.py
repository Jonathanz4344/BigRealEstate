from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import (
    campaign as campaign_crud,
    campaign_lead as campaign_lead_crud,
    lead as lead_crud,
)
from app.db.session import get_db

router = APIRouter(prefix="/campaign-leads", tags=["CampaignLeads"])

@router.post("/{campaign_id}/leads/{lead_id}", response_model=schemas.CampaignLeadPublic, status_code=status.HTTP_201_CREATED, summary="Link a lead to a campaign")
def create_campaign_lead(campaign_id: int, lead_id: int, db: Session = Depends(get_db)):
    """
    Add a lead to a campaign
    If the link already exists, returns the existing link.
    """
    try:
        db_campaign_lead = campaign_lead_crud.link_lead_to_campaign(
            db, campaign_id=campaign_id, lead_id=lead_id
        )
        return db_campaign_lead
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/campaign/{campaign_id}/lead/{lead_id}",
    summary="Get Campaign and Lead By Ids",
    response_model=schemas.CampaignLeadDetailedPublic,
)
def get_campaign_lead(campaign_id: int, lead_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a campaign lead link and hydrate it with full campaign and lead details.
    """
    campaign_lead = campaign_lead_crud.get_campaign_lead(db, campaign_id, lead_id)
    if not campaign_lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CampaignLead not found")

    campaign = campaign_crud.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    lead = lead_crud.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    return schemas.CampaignLeadDetailedPublic(
        phone_contacted=campaign_lead.phone_contacted,
        sms_contacted=campaign_lead.sms_contacted,
        email_contacted=campaign_lead.email_contacted,
        campaign=campaign,
        lead=lead,
    )


@router.put("/{campaign_id}/leads/{lead_id}", response_model=schemas.CampaignLeadPublic, summary="Update contact status for a lead in a campaign")
def update_campaign_lead_status(campaign_id: int, lead_id: int, status_in: schemas.CampaignLeadUpdate, db: Session = Depends(get_db)):
    """
    Update the contact status (phone, sms, email) for a lead in a campaign
    """
    db_campaign_lead = campaign_lead_crud.update_campaign_lead_status(
        db,
        campaign_id=campaign_id,
        lead_id=lead_id,
        status_in=status_in
    )

    if not db_campaign_lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found in this campaign"
        )

    return db_campaign_lead


@router.delete("/{campaign_id}/leads/{lead_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Unlink a lead from a campaign")
def delete_lead_from_campaign_route(campaign_id: int, lead_id: int, db: Session = Depends(get_db)):
    """
    Unlink lead from campaign
    """
    success = campaign_lead_crud.unlink_lead_from_campaign(
        db, campaign_id=campaign_id, lead_id=lead_id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found in this campaign"
        )

    return None
