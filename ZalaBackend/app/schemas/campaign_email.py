from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel

from app.schemas.campaign import CampaignPublic
from app.schemas.lead import LeadPublic


class ContactMethod(str, Enum):
    PHONE = "phone"
    SMS = "sms"
    EMAIL = "email"


class CampaignEmailBase(BaseModel):
    """
    Shared fields for CampaignEmail schema variants.
    """

    campaign_id: int
    lead_id: Optional[int] = None
    message_subject: str
    message_body: str


class CampaignEmailCreate(CampaignEmailBase):
    """
    Schema for creating a campaign message.
    """
    pass


class CampaignEmailUpdate(BaseModel):
    """
    Schema for updating a campaign message.
    """

    lead_id: Optional[int] = None
    contact_method: Optional[ContactMethod] = None
    message_subject: Optional[str] = None
    message_body: Optional[str] = None


class CampaignEmailPublic(CampaignEmailBase):
    """
    Schema returned from Campaign Message endpoints.
    """

    message_id: int
    timestamp: datetime
    campaign: Optional[CampaignPublic] = None
    lead: Optional[LeadPublic] = None

    class Config:
        from_attributes = True
