from typing import Dict, List, Optional

import json
import os
import re
from math import atan2, cos, radians, sin, sqrt

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload, selectinload

from app.db.session import get_db
from app.models.address import Address
from app.models.lead import Lead
from app.models.property import Property
from app.schemas.location import LocationFilter
from app.utils.geocode import geocode_location, reverse_geocode


mock_data_path = os.path.join(os.path.dirname(__file__), "../data/mock_properties.json")
with open(mock_data_path, "r") as f:
    MOCK_PROPERTIES = json.load(f)


router = APIRouter()


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute miles between two lat/long pairs."""
    R = 3958.8  # miles
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


def get_mock_properties(lat: float, lon: float) -> List[Dict[str, object]]:
    """Filter bundled mock properties by distance."""
    results = []
    for prop in MOCK_PROPERTIES:
        distance = haversine(lat, lon, prop["latitude"], prop["longitude"])
        if distance <= 50:
            prop["distance_miles"] = round(distance, 2)
            results.append(prop)
    return results


def _build_location_query(filter: LocationFilter) -> Optional[str]:
    zip_match = re.match(r"^\d{5}$", filter.location_text or "")
    if zip_match:
        return zip_match.group()

    parts: List[str] = []
    if filter.city:
        parts.append(filter.city)
    if filter.state:
        parts.append(filter.state)
    if filter.location_text:
        parts.append(filter.location_text)

    if not parts:
        return None

    return ", ".join(parts)


def _serialize_lead(lead: Lead, distance: float) -> Dict[str, object]:
    props = []
    for prop in getattr(lead, "properties", []) or []:
        address = getattr(prop, "address", None)
        units = [
            {
                "unit_id": unit.unit_id,
                "property_id": unit.property_id,
                "apt_num": unit.apt_num,
                "bedrooms": unit.bedrooms,
                "bath": unit.bath,
                "sqft": unit.sqft,
                "notes": unit.notes,
            }
            for unit in getattr(prop, "units", []) or []
        ]

        props.append(
            {
                "property_id": prop.property_id,
                "property_name": getattr(prop, "property_name", None),
                "mls_number": getattr(prop, "mls_number", None),
                "notes": getattr(prop, "notes", None),
                "address_id": address.address_id if address else None,
                "address": {
                    "address_id": address.address_id if address else None,
                    "street_1": address.street_1 if address else None,
                    "street_2": address.street_2 if address else None,
                    "city": address.city if address else None,
                    "state": address.state if address else None,
                    "zipcode": address.zipcode if address else None,
                    "lat": address.lat if address else None,
                    "long": address.long if address else None,
                }
                if address
                else None,
                "units": units,
            }
        )

    created_by_user = None
    if getattr(lead, "created_by_user", None):
        user = lead.created_by_user
        created_by_user = {
            "user_id": user.user_id,
            "username": getattr(user, "username", None),
            "profile_pic": getattr(user, "profile_pic", None),
            "role": getattr(user, "role", None),
        }

    contact = None
    if getattr(lead, "contact", None):
        c = lead.contact
        contact = {
            "contact_id": c.contact_id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "phone": c.phone,
        }

    lead_address = getattr(lead, "address", None)

    return {
        "lead_id": lead.lead_id,
        "person_type": lead.person_type,
        "business": lead.business,
        "website": lead.website,
        "license_num": lead.license_num,
        "notes": lead.notes,
        "created_by": lead.created_by,
        "created_by_user": created_by_user,
        "contact_id": lead.contact_id,
        "contact": contact,
        "address": {
            "address_id": lead_address.address_id if lead_address else None,
            "street_1": lead_address.street_1 if lead_address else None,
            "street_2": lead_address.street_2 if lead_address else None,
            "city": lead_address.city if lead_address else None,
            "state": lead_address.state if lead_address else None,
            "zipcode": lead_address.zipcode if lead_address else None,
            "lat": lead_address.lat if lead_address else None,
            "long": lead_address.long if lead_address else None,
        }
        if lead_address
        else None,
        "properties": props,
        "distance_miles": distance,
    }


@router.post("/search-location/",summary="Search Lead Mock", tags=["Search Lead"], include_in_schema=True)
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
            "nearby_properties": mock_properties,
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
        "nearby_properties": mock_properties,
    }


@router.post("/searchLeads/db",summary="Search Lead DB", tags=["Search Lead"])
def search_location_db(filter: LocationFilter, db: Session = Depends(get_db)):
    lat = filter.latitude
    lon = filter.longitude

    if lat is None or lon is None:
        location_query = _build_location_query(filter)
        if not location_query:
            return JSONResponse(status_code=400, content={"error": "No valid location input provided"})
        geocoded = geocode_location(location_query)
        if not geocoded:
            return JSONResponse(status_code=400, content={"error": "Geocoding failed"})
        lat = geocoded["latitude"]
        lon = geocoded["longitude"]
        normalized_location = {
            "latitude": lat,
            "longitude": lon,
            "city": geocoded.get("city"),
            "state": geocoded.get("state"),
            "zip": geocoded.get("zip"),
            "source": filter.source or "gpt",
        }
    else:
        normalized_location = {
            "latitude": lat,
            "longitude": lon,
            "source": filter.source or "gpt",
        }

    leads = (
        db.query(Lead)
        .options(
            joinedload(Lead.address),
            joinedload(Lead.contact),
            joinedload(Lead.created_by_user),
            selectinload(Lead.properties).joinedload(Property.address),
            selectinload(Lead.properties).selectinload(Property.units),
        )
        .all()
    )

    nearby_leads: List[Dict[str, object]] = []
    for lead in leads:
        candidate_distances: List[float] = []

        if getattr(lead, "address", None):
            addr = lead.address
            if addr.lat is not None and addr.long is not None:
                candidate_distances.append(
                    haversine(lat, lon, float(addr.lat), float(addr.long))
                )

        for prop in getattr(lead, "properties", []) or []:
            prop_addr = getattr(prop, "address", None)
            if prop_addr and prop_addr.lat is not None and prop_addr.long is not None:
                candidate_distances.append(
                    haversine(lat, lon, float(prop_addr.lat), float(prop_addr.long))
                )

        if not candidate_distances:
            continue

        best_distance = min(candidate_distances)
        if best_distance <= 50:
            nearby_leads.append(_serialize_lead(lead, round(best_distance, 2)))

    return {
        # "normalized_location": normalized_location,
        "leads": nearby_leads,
    }
