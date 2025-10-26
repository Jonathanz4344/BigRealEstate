from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

from app.models.contact import Contact
from app.schemas.contact import ContactPublic, ContactBase
from app.schemas.summaries import LeadSummary


class UserSummary(BaseModel):
    """Lightweight summary of a User for embedding in other resources."""
    user_id: int
    username: str
    profile_pic: Optional[str] = None
    role: Optional[str] = "user"

    class Config:
        from_attributes = True


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
    # Contact should not be created or attached when creating a user.
    # Linking a contact to a user must be done with the link endpoint
    # POST /users/{user_id}/contacts/{contact_id}
    password: str


class UserUpdate(BaseModel):
    """
    Schema for update a User
    """
    # contact: Optional[ContactBase]
    password: Optional[str]
    username: Optional[str] = Field(max_length=15)
    profile_pic: Optional[str]
    role: Optional[str] = "user"


class UserPublic(UserBase):
    """
    Schema for GET user (read/return)
    """
    user_id: int
    # Contact is optional — users may not have a linked contact
    contact: Optional[ContactPublic] = None
    xp: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserPublicWithProperties(UserPublic):
    """
    Schema for Get a user with their properties
    """
    # return property ids to avoid circular schema imports
    properties: List[int] = []


class UserPublicWithLeads(UserPublic):
    """
    Schema for Get a user with their leads
    """
    leads_created: List[LeadSummary] = []


class UserPublicWithLeadsAndProperties(UserPublic):
    """
    Schema for Get a user with their leads and properties
    """
    leads_created: List[LeadSummary] = []
    properties: List[int] = []
