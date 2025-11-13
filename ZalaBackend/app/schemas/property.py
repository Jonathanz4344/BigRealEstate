from typing import Optional, List

from pydantic import BaseModel, Field

from app.schemas.unit import UnitPublic
from app.schemas.address import AddressPublic
from app.schemas.summaries import UserSummary


class PropertyBase(BaseModel):
    """
    Base Schema for Property
    """
    property_name: str
    mls_number: Optional[str] = None
    notes: Optional[str] = None


class PropertyCreate(PropertyBase):
    """
    Schema for Create Property
    """


class PropertyUpdate(BaseModel):
    """
    Schema for Update a property
    """
    property_name: Optional[str]
    lead_id: Optional[int] = None
    mls_number: Optional[str] = None
    notes: Optional[str] = None

class PropertyPublic(PropertyBase):
    """
    Schema for Get Property
    """
    property_id: int
    address_id: Optional[int] = None
    # include nested address details when reading a property
    address: Optional[AddressPublic] = None
    units: List[UnitPublic] = []

    class Config:
        from_attributes = True
