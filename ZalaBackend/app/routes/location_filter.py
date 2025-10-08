from fastapi import APIRouter, HTTPException
from app.models.location import LocationFilter
from app.utils.geocode import geocode_location, reverse_geocode

router = APIRouter()

@router.post("/search-location/")
def search_location(filter: LocationFilter):
    # Reverse geocode if lat/lng provided
    if filter.latitude and filter.longitude:
        result = reverse_geocode(filter.latitude, filter.longitude)
        if not result:
            raise HTTPException(status_code=400, detail="Reverse geocoding failed")
        return {"normalized_location": result}

    # Geocode if zip, city/state, or free-text provided
    location_text = filter.location_text or ""
    if filter.zip:
        location_text = filter.zip
    elif filter.city and filter.state:
        location_text = f"{filter.city}, {filter.state}"
    elif filter.city:
        location_text = filter.city
    elif filter.state:
        location_text = filter.state

    if not location_text:
        raise HTTPException(status_code=400, detail="No valid location input provided")

    result = geocode_location(location_text)
    if not result:
        raise HTTPException(status_code=400, detail="Geocoding failed")

    return {"normalized_location": result}

# Example 1:
    # {
    # "city": "Houston",
    # "state": "TX"
    # }

# Example 2:
    # {
    #   "location_text": "Brooklyn, NY"
    # }

# Example 3:
    #{
    #"zip": "10001"
    #}

# Example 4:
    # {
    #   "latitude": 40.7128,
    #   "longitude": -74.0060
    # }


