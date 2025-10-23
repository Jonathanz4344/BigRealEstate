from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional

class DataSource(str, Enum):
    gpt = "gpt"
    rapidapi = "rapidapi"
    webscraping = "webscraping"

class LocationFilter(BaseModel):
    zip: Optional[str] = Field(None, pattern=r"^\d{5}$")
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_text: Optional[str] = None
    source: DataSource = DataSource.gpt  # default to GPT
