from pydantic import BaseModel, EmailStr
from typing import Optional

class Lead(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr]
    phone_number: Optional[str]