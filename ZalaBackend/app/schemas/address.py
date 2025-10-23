from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class AddressBase(BaseModel):
    """
    Base Schema for Address
    """
    street_1: str
    street_2: Optional[str] = None
    city: str
    state: str
    zipcode: str = Field(max_length=10)
    lat: Optional[Decimal] = Field(max_digits=9, decimal_places=6)
    long: Optional[Decimal] = Field(max_digits=9, decimal_places=6)


class AddressCreate(AddressBase):
    """
    Schema for Create Address
    """
    pass


class AddressUpdate(BaseModel):
    """
    Schema for update an Address
    """
    street_1: Optional[str]
    street_2: Optional[str] = None
    city: Optional[str]
    state: Optional[str]
    zipcode: Optional[str] = Field(max_length=10)
    lat: Optional[Decimal] = Field(max_digits=9, decimal_places=6)
    long: Optional[Decimal] = Field(max_digits=9, decimal_places=6)


class AddressPublic(AddressBase):
    """
    Schema for Get Address
    """
    address_id: int

    class Config:
        orm_mode = True
