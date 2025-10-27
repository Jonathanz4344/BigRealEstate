from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.db.crud import campaign as campaign_crud
from app.db.session import get_db


router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("/", response_model=schemas.CampaignPublic, status_code=status.HTTP_201_CREATED)
def create_campaign(campaign_in: schemas.CampaignCreate, db: Session = Depends(get_db)):
    """
    Create a new campaign.
    """
    return campaign_crud.create_campaign(db, campaign_in)


@router.get("/", response_model=List[schemas.CampaignPublic])
def list_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List campaigns with optional pagination.
    """
    return campaign_crud.get_campaigns(db, skip=skip, limit=limit)


@router.get("/{campaign_id}", response_model=schemas.CampaignPublic)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single campaign by ID.
    """
    campaign = campaign_crud.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


@router.put("/{campaign_id}", response_model=schemas.CampaignPublic)
def update_campaign(
    campaign_id: int, campaign_in: schemas.CampaignUpdate, db: Session = Depends(get_db)
):
    """
    Update a campaign by ID.
    """
    campaign = campaign_crud.update_campaign(db, campaign_id, campaign_in)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return campaign


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """
    Delete a campaign by ID.
    """
    if not campaign_crud.delete_campaign(db, campaign_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return None
