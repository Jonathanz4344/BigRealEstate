from fastapi import APIRouter, HTTPException
from app.models.location import LocationFilter, DataSource
from app.utils.geocode import geocode_location, reverse_geocode
import re

router = APIRouter()

@router.post("/search-location/")
def search_location(filter: LocationFilter):
    # Reverse geocode if lat/lng provided
    if filter.latitude and filter.longitude:
        result = reverse_geocode(filter.latitude, filter.longitude)
        if not result:
            raise HTTPException(status_code=400, detail="Reverse geocoding failed")
        result["source"] = filter.source or "gpt"
        return {"normalized_location": result}

    # Auto-detect zip code pattern
    zip_match = re.match(r"^\d{5}$", filter.location_text or "")
    if zip_match:
        location_text = zip_match.group()
    else:
        location_text = filter.location_text or ""
        # If city/state are provided separately, prefer them
        if filter.city and filter.state:
            location_text = f"{filter.city}, {filter.state}"
        elif filter.city:
            location_text = filter.city
        elif filter.state:
            location_text = filter.state

    if not location_text:
        raise HTTPException(status_code=400, detail="No valid location input provided")

    # Geocode the location
    result = geocode_location(location_text)
    if not result:
        raise HTTPException(status_code=400, detail="Geocoding failed")

    # Append the selected source to the result
    result["source"] = filter.source or "gpt"

    return {"normalized_location": result}