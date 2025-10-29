from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app import schemas
from app.models.campaign import Campaign


def get_campaign(db: Session, campaign_id: int) -> Optional[Campaign]:
    """
    Fetch a single campaign with its related user and property.
    """
    return (
        db.query(Campaign)
        .options(
            joinedload(Campaign.user),
            joinedload(Campaign.property),
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
            joinedload(Campaign.property),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_campaign(db: Session, campaign_in: schemas.CampaignCreate) -> Campaign:
    """
    Create and persist a new campaign.
    """
    db_campaign = Campaign(**campaign_in.dict())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign


def update_campaign(db: Session, campaign_id: int, campaign_in: schemas.CampaignUpdate) -> Optional[Campaign]:
    """
    Update mutable fields on a campaign.
    """
    db_campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
    if not db_campaign:
        return None

    for field, value in campaign_in.dict(exclude_unset=True).items():
        setattr(db_campaign, field, value)

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
