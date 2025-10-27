from pydantic import BaseModel

from app.schemas.user import UserPublic
from app.schemas.property import PropertyPublic

class CampaignCreate(BaseModel):
    """
    Schema for create a campaign
    """
    campaign_name: str
    # user and property must be linked

class CampaignPublic(BaseModel):
    """
    Schema for get a campaign
    """

    campaign_id: int
    campaign_name: str
    user_id: int
    property_id: int

    user: UserPublic
    property: PropertyPublic
