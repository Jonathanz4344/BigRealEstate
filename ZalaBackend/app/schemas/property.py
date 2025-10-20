from typing import Optional, List

from pydantic import BaseModel, Field

from ZalaBackend.app.schemas.address import AddressPublic, AddressBase
from ZalaBackend.app.schemas.unit import UnitPublic


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
    address: AddressBase
    lead_id: Optional[int] = None


class PropertyPublic(PropertyBase):
    """
    Schema for Get Property
    """
    property_id: int
    address: AddressPublic
    units: List[UnitPublic] = []

    class Config:
        orm_mode = True
