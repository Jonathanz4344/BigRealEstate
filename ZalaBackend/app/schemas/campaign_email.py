from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

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


class CampaignEmailSendRequest(BaseModel):
    """
    Payload for sending a single email template to multiple leads within the same campaign.
    """

    campaign_id: int
    lead_id: List[int] = Field(..., min_length=1, description="Array of lead IDs to receive the campaign email.")
    message_subject: str
    message_body: str


class CampaignEmailUpdate(BaseModel):
    """
    Schema for updating a campaign message.
    """

    lead_id: Optional[int] = None
    # contact_method: Optional[ContactMethod] = None
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
