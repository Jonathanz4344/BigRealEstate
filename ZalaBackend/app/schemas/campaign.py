from typing import Optional

from pydantic import BaseModel

from app.schemas.user import UserPublic
from app.schemas.property import PropertyPublic


class CampaignBase(BaseModel):
    """
    Shared fields for Campaign schema variants.
    """

    campaign_name: str
    user_id: int
    property_id: Optional[int] = None


class CampaignCreate(CampaignBase):
    """
    Schema for creating a campaign.
    """
    pass


class CampaignUpdate(BaseModel):
    """
    Schema for updating a campaign.
    """

    campaign_name: Optional[str] = None
    user_id: Optional[int] = None
    property_id: Optional[int] = None


class CampaignPublic(CampaignBase):
    """
    Schema returned from Campaign endpoints.
    """

    campaign_id: int
    user: Optional[UserPublic] = None
    property: Optional[PropertyPublic] = None

    class Config:
        from_attributes = True
