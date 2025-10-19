from typing import Optional, List

from pydantic import BaseModel

from ZalaBackend.app.schemas.address import AddressPublic, AddressBase
from ZalaBackend.app.schemas.contact import ContactPublic, ContactBase
from ZalaBackend.app.schemas.property import PropertyPublic
from ZalaBackend.app.schemas.user import UserPublic


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
    contact: ContactBase
    address: Optional[AddressBase] = None
    created_by_user_id: Optional[int] = None


class LeadPublic(LeadBase):
    """
    Schema for Get a Lead
    """
    lead_id: int

    created_by_user: Optional[UserPublic] = None
    contact: ContactPublic
    address: Optional[AddressPublic] = None
    properties: List[PropertyPublic] = []

    class Config:
        orm_mode = True


