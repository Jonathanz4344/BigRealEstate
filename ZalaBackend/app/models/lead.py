from pydantic import BaseModel, EmailStr
from typing import Optional

class Lead(BaseModel):
    first_name: str
    last_name: Optional[str]
    email: Optional[EmailStr]
    phone_number: Optional[str]
    address: Optional[str]
    businessName: Optional[str]