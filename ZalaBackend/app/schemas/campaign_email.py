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


class CampaignEmailStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    FAILED = "failed"


class CampaignEmailBase(BaseModel):
    """
    Shared fields for CampaignEmail schema variants.
    """

    campaign_id: int
    lead_id: Optional[int] = None
    message_subject: str
    message_body: str
    from_name: Optional[str] = None


class CampaignEmailCreate(CampaignEmailBase):
    """
    Schema for creating a campaign message.
    """

    to_email: Optional[str] = None
    gmail_message_id: Optional[str] = None
    gmail_thread_id: Optional[str] = None
    send_status: CampaignEmailStatus = CampaignEmailStatus.DRAFT
    error_detail: Optional[str] = None


class CampaignEmailSendRequest(BaseModel):
    """
    Payload for sending a single email template to multiple leads within the same campaign.
    """

    campaign_id: int
    lead_id: List[int] = Field(..., min_length=1, description="Array of lead IDs to receive the campaign email.")
    message_subject: str
    message_body: str
    from_name: Optional[str] = Field(default=None, max_length=128)


class CampaignEmailUpdate(BaseModel):
    """
    Schema for updating a campaign message.
    """

    lead_id: Optional[int] = None
    # contact_method: Optional[ContactMethod] = None
    message_subject: Optional[str] = None
    message_body: Optional[str] = None
    from_name: Optional[str] = None
    to_email: Optional[str] = None
    gmail_message_id: Optional[str] = None
    gmail_thread_id: Optional[str] = None
    send_status: Optional[CampaignEmailStatus] = None
    error_detail: Optional[str] = None


class CampaignEmailPublic(CampaignEmailBase):
    """
    Schema returned from Campaign Message endpoints.
    """

    message_id: int
    timestamp: datetime
    to_email: Optional[str] = None
    gmail_message_id: Optional[str] = None
    gmail_thread_id: Optional[str] = None
    send_status: CampaignEmailStatus = CampaignEmailStatus.DRAFT
    error_detail: Optional[str] = None
    campaign: Optional[CampaignPublic] = None
    lead: Optional[LeadPublic] = None

    class Config:
        from_attributes = True


class CampaignEmailSendResult(BaseModel):
    lead_id: int
    to_email: Optional[str] = None
    status: CampaignEmailStatus
    error_detail: Optional[str] = None
    message_id: Optional[int] = None


class CampaignEmailSendResponse(BaseModel):
    campaign: CampaignPublic
    results: List[CampaignEmailSendResult]
