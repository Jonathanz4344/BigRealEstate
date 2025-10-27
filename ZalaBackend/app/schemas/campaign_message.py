from pydantic import BaseModel
from enum import Enum

from app.schemas.user import UserPublic
from app.schemas.property import PropertyPublic

class ContactMethod(Enum):
    PHONE = "phone"
    SMS = "sms"
    EMAIL = "email"


class CampaignMessageBase(BaseModel):
    """
    Schema for create a campaign
    """
    # campaign and lead must be linked
    campaign_id: int
    lead_id: int
    contact_method: ContactMethod
    message_subject: str
    message_body: str

class CampaignMessageCreate(CampaignMessageBase):
    """
    Schema for create a campaign
    """
    pass

class CampaignMessagePublic(CampaignMessageBase):
    """
    Schema for create a campaign
    """
    campaign: CampaignPublic
    lead: LeadPublic
