from pydantic import BaseModel, Field
from typing import Optional

class LocationFilter(BaseModel):
    zip: Optional[str] = Field(None, pattern=r"^\d{5}$")
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_text: Optional[str] = None