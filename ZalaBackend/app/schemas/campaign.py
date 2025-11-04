from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.user import UserPublic


class CampaignBase(BaseModel):
    """
    Shared fields for Campaign schema variants.
    """

    campaign_name: str
    user_id: Optional[int] = None


class CampaignCreate(CampaignBase):
    """
    Schema for creating a campaign.
    """
    lead_ids: List[int] = Field(default_factory=list)


class CampaignUpdate(BaseModel):
    """
    Schema for updating a campaign.
    """

    campaign_name: Optional[str] = None
    user_id: Optional[int] = None
    lead_ids: Optional[List[int]] = None


class CampaignPublic(CampaignBase):
    """
    Schema returned from Campaign endpoints.
    """

    campaign_id: int
    user: Optional[UserPublic] = None
    leads: List["CampaignLeadPublic"] = []

    class Config:
        from_attributes = True

