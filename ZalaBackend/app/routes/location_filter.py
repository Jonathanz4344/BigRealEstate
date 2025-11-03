from typing import Dict, List, Optional, Tuple

import json
import os
import re
from math import atan2, cos, radians, sin, sqrt

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload, selectinload

from app.db.session import get_db
from app.models.address import Address
from app.models.lead import Lead
from app.models.property import Property
from app.schemas.location import DataSource, LeadSearchRequest, LocationFilter
from app.utils.geocode import geocode_location, reverse_geocode
from app.external_api import google_places, openai_api, rapidapi


mock_data_path = os.path.join(os.path.dirname(__file__), "../data/mock_properties.json")
with open(mock_data_path, "r") as f:
    MOCK_PROPERTIES = json.load(f)


router = APIRouter()


class LocationResolutionError(RuntimeError):
    """Raised when input data is insufficient to resolve a usable location."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class ExternalProviderError(RuntimeError):
    """Raised when an upstream external provider fails."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


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


def _resolve_location(
    filter: LocationFilter,
    source_label: Optional[str] = None,
) -> Tuple[float, float, Dict[str, object], str]:
    lat = filter.latitude
    lon = filter.longitude
    location_query = _build_location_query(filter)

    if lat is None or lon is None:
        if not location_query:
            raise LocationResolutionError("No valid location input provided")
        geocoded = geocode_location(location_query)
        if not geocoded:
            raise LocationResolutionError("Geocoding failed")
        lat = geocoded["latitude"]
        lon = geocoded["longitude"]
        normalized_location: Dict[str, object] = {
            "latitude": lat,
            "longitude": lon,
            "city": geocoded.get("city"),
            "state": geocoded.get("state"),
            "zip": geocoded.get("zip"),
        }
    else:
        normalized_location = {
            "latitude": lat,
            "longitude": lon,
        }
        if not location_query:
            location_query = f"{lat},{lon}"

    if source_label:
        normalized_location["source"] = source_label

    return float(lat), float(lon), normalized_location, location_query  # type: ignore[arg-type]


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


def _split_freeform_location(text: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    if not text:
        return (None, None)
    lowered = text.lower()
    idx = lowered.rfind(" in ")
    if idx == -1:
        return (None, text.strip())
    before = text[:idx].strip()
    after = text[idx + 4 :].strip()
    if not after:
        return (None, text.strip())
    return (before or None, after)


def _model_to_dict(model) -> Dict[str, object]:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def _geocode_string(
    value: Optional[str],
    cache: Dict[str, Optional[Dict[str, float]]],
) -> Optional[Dict[str, float]]:
    if not value:
        return None
    cached = cache.get(value)
    if cached is not None:
        return cached
    result = geocode_location(value)
    cache[value] = result
    return result


def _prepare_external_filter(filter: LocationFilter) -> Tuple[LocationFilter, Optional[str]]:
    """
    Returns a filter instance with a location string suitable for geocoding and
    an optional dynamic qualifier extracted from free-form text.
    """
    dynamic_filter = None
    location_override = None

    if filter.location_text:
        query_fragment, location_fragment = _split_freeform_location(filter.location_text)
        if query_fragment:
            dynamic_filter = query_fragment
        if location_fragment and location_fragment != filter.location_text.strip():
            location_override = location_fragment

    if location_override:
        if hasattr(filter, "model_copy"):
            return filter.model_copy(update={"location_text": location_override}), dynamic_filter
        return filter.copy(update={"location_text": location_override}), dynamic_filter  # type: ignore[attr-defined]

    return filter, dynamic_filter


def _perform_mock_search(filter: LocationFilter) -> Dict[str, object]:
    if filter.latitude is not None and filter.longitude is not None:
        result = reverse_geocode(filter.latitude, filter.longitude)
        if not result:
            raise LocationResolutionError("Reverse geocoding failed")
        result["source"] = DataSource.mock.value
        mock_properties = get_mock_properties(float(result["latitude"]), float(result["longitude"]))
        return {
            "normalized_location": result,
            "nearby_properties": mock_properties,
        }

    zip_match = re.match(r"^\d{5}$", filter.location_text or "")
    if zip_match:
        location_text = zip_match.group()
    else:
        location_text = filter.location_text or ""
        if filter.city and filter.state:
            location_text = f"{filter.city}, {filter.state}"
        elif filter.city:
            location_text = filter.city
        elif filter.state:
            location_text = filter.state

    if not location_text:
        raise LocationResolutionError("No valid location input provided")

    result = geocode_location(location_text)
    if not result:
        raise LocationResolutionError("Geocoding failed")

    result["source"] = DataSource.mock.value
    mock_properties = get_mock_properties(float(result["latitude"]), float(result["longitude"]))

    return {
        "normalized_location": result,
        "nearby_properties": mock_properties,
    }


def _perform_db_search(filter: LocationFilter, db: Session) -> Dict[str, object]:
    lat, lon, normalized_location, _ = _resolve_location(filter, DataSource.db.value)

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
        "normalized_location": normalized_location,
        "leads": nearby_leads,
    }


def _perform_external_search(filter: LocationFilter, source: DataSource) -> Dict[str, object]:
    radius_miles = 50.0
    max_searches = 10

    filter_for_location, dynamic_filter = _prepare_external_filter(filter)
    lat, lon, normalized_location, location_query = _resolve_location(filter_for_location, source.value)

    try:
        if source == DataSource.gpt:
            leads = openai_api.search_agents(location_query, dynamic_filter or "", max_searches)
        elif source == DataSource.rapidapi:
            leads = rapidapi.search_agents(location_query)
        elif source == DataSource.google_places:
            radius_m = max(1, min(50000, int(radius_miles * 1609.34)))
            leads = google_places.search_agents(location_query, radius_m=radius_m)
        else:
            raise LocationResolutionError(f"Unsupported external source '{source.value}'")
    except LocationResolutionError:
        raise
    except Exception as exc:
        raise ExternalProviderError(str(exc))

    geo_cache: Dict[str, Optional[Dict[str, float]]] = {}
    response_leads: List[Dict[str, object]] = []

    for lead in leads or []:
        lead_dict = _model_to_dict(lead)
        address_value = lead_dict.get("address")
        distance = None
        geocoded_address = None

        if isinstance(address_value, dict):
            addr_lat = address_value.get("lat")
            addr_lon = address_value.get("long")
            if addr_lat is not None and addr_lon is not None:
                distance = haversine(lat, lon, float(addr_lat), float(addr_lon))
                geocoded_address = {
                    "latitude": float(addr_lat),
                    "longitude": float(addr_lon),
                    "city": address_value.get("city"),
                    "state": address_value.get("state"),
                    "zip": address_value.get("zipcode"),
                }
        elif isinstance(address_value, str) and address_value:
            geocoded_address = _geocode_string(address_value, geo_cache)
            if geocoded_address:
                distance = haversine(
                    lat,
                    lon,
                    float(geocoded_address["latitude"]),
                    float(geocoded_address["longitude"]),
                )

        if distance is not None and distance > radius_miles:
            continue

        lead_dict["distance_miles"] = round(distance, 2) if distance is not None else None
        lead_dict["geocoded_address"] = geocoded_address
        lead_dict["source"] = source.value
        response_leads.append(lead_dict)

    response_leads.sort(
        key=lambda item: (
            item.get("distance_miles") is None,
            item.get("distance_miles") if item.get("distance_miles") is not None else float("inf"),
        )
    )

    return {
        "normalized_location": normalized_location,
        "radius_miles": radius_miles,
        "dynamic_filter": dynamic_filter,
        "source": source.value,
        "leads": response_leads,
    }


@router.post("/searchLeads", summary="Search Lead Combined", tags=["Search Lead"])
def search_leads(request: LeadSearchRequest, db: Session = Depends(get_db)):
    unique_sources: List[DataSource] = []
    for src in request.sources or []:
        if src not in unique_sources:
            unique_sources.append(src)

    if not unique_sources:
        unique_sources = [DataSource.db]

    results: Dict[str, object] = {}
    aggregated_leads: List[Dict[str, object]] = []
    errors: Dict[str, str] = {}

    for source in unique_sources:
        try:
            if source == DataSource.mock:
                results[source.value] = _perform_mock_search(request)
            elif source == DataSource.db:
                db_result = _perform_db_search(request, db)
                results[source.value] = db_result
                aggregated_leads.extend(db_result.get("leads", []))
            elif source in {DataSource.gpt, DataSource.rapidapi, DataSource.google_places}:
                ext_result = _perform_external_search(request, source)
                results[source.value] = ext_result
                aggregated_leads.extend(ext_result.get("leads", []))
            else:
                errors[source.value] = "Unsupported source requested."
        except LocationResolutionError as exc:
            errors[source.value] = exc.message
        except ExternalProviderError as exc:
            errors[source.value] = f"External provider request failed: {exc.message}"
        except Exception as exc:
            errors[source.value] = f"Unexpected error: {exc}"

    response: Dict[str, object] = {
        "requested_sources": [src.value if isinstance(src, DataSource) else str(src) for src in unique_sources],
        "results": results,
    }

    if aggregated_leads:
        response["aggregated_leads"] = aggregated_leads
    if errors:
        response["errors"] = errors

    return response
