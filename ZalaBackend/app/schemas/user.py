from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

from app.models.contact import Contact
from app.schemas.contact import ContactPublic, ContactBase
from app.schemas.lead import LeadPublic
from app.schemas.property import PropertyPublic


class UserBase(BaseModel):
    """
    Base Schema for User
    """
    username: str = Field(max_length=15)
    profile_pic: Optional[str]
    role: Optional[str] = "user"


class UserCreate(UserBase):
    """
    Schema for POST user (create)
    """
    contact: ContactBase
    password: str


class UserUpdate(BaseModel):
    """
    Schema for update a User
    """
    contact: Optional[ContactBase]
    password: Optiona[str]
    username: Optiona[str] = Field(max_length=15)
    profile_pic: Optional[str]
    role: Optional[str] = "user"


class UserPublic(UserBase):
    """
    Schema for GET user (read/return)
    """
    user_id: int
    contact: ContactPublic
    xp: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class UserPublicWithProperties(UserPublic):
    """
    Schema for Get a user with their properties
    """
    properties: List[PropertyPublic] = []


class UserPublicWithLeads(UserPublic):
    """
    Schema for Get a user with their leads
    """
    leads_created: List[LeadPublic] = []


class UserPublicWithLeadsAndProperties(UserPublic):
    """
    Schema for Get a user with their leads and properties
    """
    leads_created: List[LeadPublic] = []
    properties: List[PropertyPublic] = []
