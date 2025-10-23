from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class ContactBase(BaseModel):
    """
    Shared fields for Contact
    """
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)


class ContactCreate(ContactBase):
    """
    Schema for creating a new Contact
    """
    pass


class ContactUpdate(ContactBase):
    """
    Schema for updating an existing Contact
    """

    first_name: Optional[str]
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)


class ContactPublic(ContactBase):
    """
    Schema for returning a Contact to the client
    """
    contact_id: int

    class Config:
        orm_mode = True
