from pydantic import BaseModel
from typing import Optional

from .summaries import CampaignSummary, LeadSummary

class CampaignLeadBase(BaseModel):
    """
    Base schema for CampaignLead
    """
    phone_contacted: bool = False
    sms_contacted: bool = False
    email_contacted: bool = False


class CampaignLeadCreate(BaseModel):
    """
    Schema for create a CampaignLead
    """
    campaign_id: int
    lead_id: int


class CampaignLeadUpdate(BaseModel):
    """
    Schema for update a CampaignLead
    """
    phone_contacted: Optional[bool] = None
    sms_contacted: Optional[bool] = None
    email_contacted: Optional[bool] = None


class CampaignLeadPublic(CampaignLeadBase):
    """
    Schema for get a CampaignLead
    """
    campaign: CampaignSummary
    lead: LeadSummary

    class Config:
        # Use from_attributes for Pydantic V2
        from_attributes = True


