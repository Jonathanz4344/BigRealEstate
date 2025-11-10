from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class GmailSendRequest(BaseModel):
    user_id: int
    to: EmailStr
    subject: str = Field(min_length=1, max_length=255)
    html: str = Field(min_length=1)
    from_name: Optional[str] = Field(default=None, max_length=128)


class GmailSendResponse(BaseModel):
    id: str
    thread_id: Optional[str] = None
