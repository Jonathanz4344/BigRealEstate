from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.property import PropertyPublic


class UnitBase(BaseModel):
    """
    Base Schema for Unit
    """
    apt_num: Optional[str]
    bedrooms: Optional[int]
    bath: Optional[Decimal] = Field(max_digits=3, decimal_places=1)
    sqft: Optional[int]
    notes: Optional[str]


class UnitCreate(UnitBase):
    """
    Schema for Create Unit
    """
    property_id: int

class UnitUpdate(BaseModel):
    """
    Schema for Create Unit
    """
    property_id: Optional[int]
    apt_num: Optional[str]
    bedrooms: Optional[int]
    bath: Optional[Decimal] = Field(max_digits=3, decimal_places=1)
    sqft: Optional[int]
    notes: Optional[str]


class UnitPublic(UnitBase):
    """
    Schema for Get Unit
    """
    class Config:
        orm_mode = True
