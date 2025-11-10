from typing import Optional
from pydantic import BaseModel


class UserSummary(BaseModel):
    user_id: int
    username: Optional[str] = None
    profile_pic: Optional[str] = None
    role: Optional[str] = "user"

    class Config:
        from_attributes = True


class LeadSummary(BaseModel):
    lead_id: int
    person_type: Optional[str] = None

    class Config:
        from_attributes = True


class PropertySummary(BaseModel):
    property_id: int
    property_name: Optional[str] = None

    class Config:
        from_attributes = True


class CampaignSummary(BaseModel):
    campaign_id: int
    campaign_name: Optional[str] = None

    class Config:
        from_attributes = True


class BoardSummary(BaseModel):
    board_id: int
    board_name: Optional[str] = None
    user_id: int

    class Config:
        from_attributes = True
