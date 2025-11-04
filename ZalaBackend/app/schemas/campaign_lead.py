from pydantic import BaseModel, computed_field
from typing import Optional, List

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

    @computed_field
    @property
    def contact_methods(self) -> List[str]:
        """
        Generates array with used contact methods
        """
        methods = []
        if self.phone_contacted:
            methods.append("phone")
        if self.sms_contacted:
            methods.append("sms")
        if self.email_contacted:
            methods.append("email")
        return methods

    class Config:
        from_attributes = True


