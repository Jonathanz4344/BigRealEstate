from typing import Optional, List

from pydantic import BaseModel, Field

from app.schemas.address import AddressPublic
from app.schemas.contact import ContactPublic
from app.schemas.summaries import UserSummary
from app.schemas.property import PropertyPublic

class LeadBase(BaseModel):
    """
    Base Schema for a Lead.
    """
    person_type: Optional[str] = None
    business: Optional[str] = None
    website: Optional[str] = None
    license_num: Optional[str] = None
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    """
    Schema for Create a Lead.
    """
    # contact: ContactBase
    # address: Optional[AddressBase] = None
    # Linking a user to a lead should be done via the link endpoint
    # POST /leads/{lead_id}/users/{user_id} and not via the create body.


class LeadUpdate(BaseModel):
    """
    Schema for Updating a Lead
    """
    # contact: Optional[ContactBase] = None
    # address: Optional[AddressUpdate] = None
    person_type: Optional[str] = None
    business: Optional[str] = None
    website: Optional[str] = None
    license_num: Optional[str] = None
    notes: Optional[str] = None


class LeadPublic(LeadBase):
    """
    Schema for Get a Lead
    """
    lead_id: int

    # expose ids for related resources to keep response small and avoid circular imports
    created_by: Optional[int] = None
    contact_id: Optional[int] = None
    address_id: Optional[int] = None

    # nested created_by user summary and full contact/property details
    created_by_user: Optional[UserSummary] = None
    contact: Optional[ContactPublic] = None
    address: Optional[AddressPublic] = None
    properties: List[PropertyPublic] = []
    campaigns: List["CampaignLeadPublic"] = []

    class Config:
        from_attributes = True

