from fastapi import APIRouter, HTTPException
from app.schemas.location import LocationFilter, DataSource
from app.utils.geocode import geocode_location, reverse_geocode
from fastapi.responses import JSONResponse
import re
from math import radians, sin, cos, sqrt, atan2
import os
import json


mock_data_path = os.path.join(os.path.dirname(__file__), "../data/mock_properties.json")
with open(mock_data_path, "r") as f:
    MOCK_PROPERTIES = json.load(f)


router = APIRouter()

def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8  # Radius of Earth in miles
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def get_mock_properties(lat: float, lon: float):
    results = []
    for prop in MOCK_PROPERTIES:
        distance = haversine(lat, lon, prop["latitude"], prop["longitude"])
        if distance <= 50:
            prop["distance_miles"] = round(distance, 2)
            results.append(prop)
    return results

@router.post("/search-location/", tags=["Search Filter"])
def search_location(filter: LocationFilter):
    # Reverse geocode if lat/lng provided
    if filter.latitude and filter.longitude:
        result = reverse_geocode(filter.latitude, filter.longitude)
        if not result:
            return JSONResponse(status_code=400, content={"error": "Reverse geocoding failed"})
        result["source"] = filter.source or "gpt"
        mock_properties = get_mock_properties(result["latitude"], result["longitude"])
        return {
            "normalized_location": result,
            "nearby_properties": mock_properties
        }

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
        return JSONResponse(status_code=400, content={"error": "No valid location input provided"})

    # Geocode the location
    result = geocode_location(location_text)
    if not result:
         return JSONResponse(status_code=400, content={"error": "Geocoding failed"}) 

    # Append the selected source to the result
    result["source"] = filter.source or "gpt"

    # Add mock property data based on lat/lng
    mock_properties = get_mock_properties(result["latitude"], result["longitude"])

    return {
        "normalized_location": result,
        "nearby_properties": mock_properties
    }