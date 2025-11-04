from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class DataSource(str, Enum):
    gpt = "gpt"
    rapidapi = "rapidapi"
    google_places = "google_places"
    mock = "mock"
    db = "db"


class LocationFilter(BaseModel):
    zip: Optional[str] = Field(None, pattern=r"^\d{5}$")
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_text: Optional[str] = None


class LeadSearchRequest(LocationFilter):
    """
    Combined lead search request supporting multiple data sources.
    """
    sources: List[DataSource] = Field(default_factory=lambda: [DataSource.google_places])
