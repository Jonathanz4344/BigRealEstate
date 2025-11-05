from enum import Enum
from typing import List

from pydantic import BaseModel, Field


class DataSource(str, Enum):
    google_places = "google_places"
    gpt = "gpt"
    rapidapi = "rapidapi"
    db = "db"


class LocationFilter(BaseModel):
    location_text: str = Field(..., min_length=1)


class LeadSearchRequest(LocationFilter):
    """
    Combined lead search request supporting multiple data sources.
    """
    sources: List[DataSource] = Field(default_factory=lambda: [DataSource.google_places])
