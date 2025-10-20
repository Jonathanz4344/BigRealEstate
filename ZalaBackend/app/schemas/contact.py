from typing import Optional
from pydantic import BaseModel, Field


class ContactBase(BaseModel):
    """
    Base Schema for Contact
    """
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = Field(max_length=20)


class ContactCreate(ContactBase):
    """
    Schema for Create Contact
    """
    pass


class ContactPublic(ContactBase):
    """
    Schema for Get Contact
    """
    contact_id: int

    class Config:
        orm_mode = True
