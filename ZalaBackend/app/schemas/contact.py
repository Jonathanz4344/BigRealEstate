from typing import Optional
from pydantic import BaseModel, Field


class ContactBase(BaseModel):
    """
    Shared fields for Contact
    """
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = Field(default=None, max_length=20)


class ContactCreate(ContactBase):
    """
    Schema for creating a new Contact
    """
    first_name: str


class ContactUpdate(ContactBase):
    """
    Schema for updating an existing Contact
    """
    pass


class ContactPublic(ContactBase):
    """
    Schema for returning a Contact to the client
    """
    contact_id: int

    class Config:
        orm_mode = True