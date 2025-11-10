from typing import Dict, List, Optional, Tuple

import re
from decimal import Decimal, InvalidOperation
from math import atan2, cos, radians, sin, sqrt

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.db.session import get_db
from app.models.address import Address
from app.models.contact import Contact
from app.models.lead import Lead
from app.models.property import Property
from app.schemas.location import DataSource, LeadSearchRequest, LocationFilter
from app.utils.geocode import geocode_location
from app.external_api import google_places, openai_api, rapidapi


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


def _build_location_query(filter: LocationFilter) -> Optional[str]:
    location_text = (filter.location_text or "").strip()
    if not location_text:
        return None

    zip_match = re.match(r"^\d{5}$", location_text)
    if zip_match:
        return zip_match.group()

    return location_text


def _resolve_location(
    filter: LocationFilter,
    source_label: Optional[str] = None,
) -> Tuple[float, float, Dict[str, object], str]:
    location_query = _build_location_query(filter)

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


def _coerce_float(value) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


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


def _normalize_str(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    normalized = value.strip().lower()
    return normalized or None


def _normalize_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    digits = re.sub(r"\D", "", value)
    return digits or None


def _decimal_or_none(value) -> Optional[Decimal]:
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def _as_address_dict(value) -> Optional[Dict[str, object]]:
    if isinstance(value, dict):
        return dict(value)
    if isinstance(value, str) and value.strip():
        text = value.strip()
        return {
            "street_1": text,
            "street_2": None,
            "city": text,
            "state": "",
            "zipcode": "",
            "lat": None,
            "long": None,
        }
    return None


def _extract_contact_dict(payload: Dict[str, object]) -> Optional[Dict[str, object]]:
    contact_value = payload.get("contact")
    if isinstance(contact_value, dict):
        return dict(contact_value)
    return None


def _find_existing_lead(db: Session, candidate: Dict[str, object]) -> Optional[Lead]:
    contact_data = _extract_contact_dict(candidate)
    if contact_data:
        email_norm = _normalize_str(contact_data.get("email"))
        if email_norm:
            existing = (
                db.query(Lead)
                .join(Contact, Lead.contact_id == Contact.contact_id)
                .filter(func.lower(Contact.email) == email_norm)
                .first()
            )
            if existing:
                return existing

        phone_digits = _normalize_phone(contact_data.get("phone"))
        if phone_digits:
            existing = (
                db.query(Lead)
                .join(Contact, Lead.contact_id == Contact.contact_id)
                .filter(func.regexp_replace(Contact.phone, r"\D", "", "g") == phone_digits)
                .first()
            )
            if existing:
                return existing

    business_norm = _normalize_str(candidate.get("business"))
    address_data = _as_address_dict(candidate.get("address"))
    if business_norm and address_data:
        city_norm = _normalize_str(address_data.get("city"))
        state_norm = _normalize_str(address_data.get("state"))
        street_norm = _normalize_str(address_data.get("street_1"))

        query = (
            db.query(Lead)
            .outerjoin(Address, Lead.address_id == Address.address_id)
            .filter(func.lower(Lead.business) == business_norm)
        )
        if street_norm:
            query = query.filter(func.lower(Address.street_1) == street_norm)
        if city_norm:
            query = query.filter(func.lower(Address.city) == city_norm)
        if state_norm:
            query = query.filter(func.lower(Address.state) == state_norm)

        existing = query.first()
        if existing:
            return existing

    return None


def _create_contact_from_payload(db: Session, payload: Dict[str, object]) -> Optional[Contact]:
    contact_data = _extract_contact_dict(payload)
    if not contact_data:
        return None

    meaningful = any(
        contact_data.get(field)
        for field in ("first_name", "last_name", "email", "phone")
    )
    if not meaningful:
        return None

    email_norm = _normalize_str(contact_data.get("email"))
    phone_digits = _normalize_phone(contact_data.get("phone"))

    existing_contact = None
    if email_norm:
        existing_contact = (
            db.query(Contact)
            .filter(func.lower(Contact.email) == email_norm)
            .first()
        )
    if not existing_contact and phone_digits:
        existing_contact = (
            db.query(Contact)
            .filter(func.regexp_replace(Contact.phone, r"\D", "", "g") == phone_digits)
            .first()
        )
    if existing_contact:
        return existing_contact

    first_name = contact_data.get("first_name") or contact_data.get("last_name") or payload.get("business") or "Unknown"
    contact = Contact(
        first_name=first_name,
        last_name=contact_data.get("last_name"),
        email=contact_data.get("email"),
        phone=contact_data.get("phone"),
    )
    db.add(contact)
    db.flush()
    return contact


def _create_address_from_payload(db: Session, payload: Dict[str, object]) -> Optional[Address]:
    address_data = _as_address_dict(payload.get("address"))
    if not address_data:
        return None

    street_1 = address_data.get("street_1") or address_data.get("city") or payload.get("business") or "Unknown"
    city = address_data.get("city") or street_1 or "Unknown"
    state = address_data.get("state") or "NA"
    zipcode = address_data.get("zipcode") or "00000"

    address = Address(
        street_1=street_1,
        street_2=address_data.get("street_2"),
        city=city,
        state=state,
        zipcode=zipcode,
        lat=_decimal_or_none(address_data.get("lat")),
        long=_decimal_or_none(address_data.get("long")),
    )
    db.add(address)
    db.flush()
    return address


def _create_lead_from_payload(db: Session, payload: Dict[str, object]) -> Optional[Lead]:
    try:
        contact = _create_contact_from_payload(db, payload)
        address = _create_address_from_payload(db, payload)
        db_lead = Lead(
            person_type=payload.get("person_type"),
            business=payload.get("business"),
            website=payload.get("website"),
            license_num=payload.get("license_num"),
            notes=payload.get("notes"),
            contact_id=contact.contact_id if contact else None,
            address_id=address.address_id if address else None,
        )
        db.add(db_lead)
        db.commit()
        db.refresh(db_lead)
        return db_lead
    except IntegrityError:
        db.rollback()
        return None
    except Exception:
        db.rollback()
        raise


def _persist_external_leads(db: Session, leads: List[Dict[str, object]]) -> Dict[str, int]:
    inserted = 0
    duplicates = 0
    failed = 0

    for lead in leads or []:
        candidate = lead if isinstance(lead, dict) else _model_to_dict(lead)
        if _find_existing_lead(db, candidate):
            duplicates += 1
            continue
        created = _create_lead_from_payload(db, candidate)
        if created:
            inserted += 1
        else:
            failed += 1

    return {
        "inserted": inserted,
        "duplicates": duplicates,
        "failed": failed,
    }


def _perform_db_search(filter: LocationFilter, db: Session) -> Dict[str, object]:
    lat, lon, normalized_location, _ = _resolve_location(filter, DataSource.db.value)
    radius_miles = 50.0

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
        if best_distance <= radius_miles:
            nearby_leads.append(_serialize_lead(lead, round(best_distance, 2)))

    return {
        "leads": nearby_leads,
        "normalized_location": normalized_location,
        "radius_miles": radius_miles,
    }


def _perform_external_search(filter: LocationFilter, source: DataSource) -> Dict[str, object]:
    radius_miles = 50.0
    max_results = 50
    gpt_max_searches = 10

    filter_for_location, dynamic_filter = _prepare_external_filter(filter)
    lat, lon, normalized_location, location_query = _resolve_location(filter_for_location, source.value)

    try:
        if source == DataSource.gpt:
            leads = openai_api.search_agents(location_query, dynamic_filter or "", gpt_max_searches)
        elif source == DataSource.rapidapi:
            leads = rapidapi.search_agents(location_query, max_results=max_results)
        elif source == DataSource.google_places:
            radius_m = max(1, min(50000, int(radius_miles * 1609.34)))
            leads = google_places.search_agents(location_query, radius_m=radius_m, max_results=max_results)
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
        distance: Optional[float] = None
        geocoded_address: Optional[Dict[str, object]] = None
        address_geocoded_from_text: Optional[Dict[str, object]] = None

        if isinstance(address_value, dict):
            addr_lat = _coerce_float(address_value.get("lat"))
            addr_lon = _coerce_float(address_value.get("long"))

            needs_geocode = addr_lat is None or addr_lon is None or not address_value.get("zipcode")
            if needs_geocode:
                address_parts = [
                    address_value.get("street_1"),
                    address_value.get("street_2"),
                    address_value.get("city"),
                    address_value.get("state"),
                    address_value.get("zipcode"),
                ]
                address_string = ", ".join(str(part) for part in address_parts if part)
                if not address_string and isinstance(lead_dict.get("notes"), str):
                    address_string = lead_dict["notes"]

                if address_string:
                    address_geocoded_from_text = _geocode_string(address_string, geo_cache)

                if address_geocoded_from_text:
                    lat_candidate = _coerce_float(address_geocoded_from_text.get("latitude"))
                    lon_candidate = _coerce_float(address_geocoded_from_text.get("longitude"))
                    if lat_candidate is not None:
                        addr_lat = lat_candidate
                        address_value["lat"] = lat_candidate
                    if lon_candidate is not None:
                        addr_lon = lon_candidate
                        address_value["long"] = lon_candidate
                    if not address_value.get("zipcode"):
                        address_value["zipcode"] = address_geocoded_from_text.get("zip") or ""
                    if not address_value.get("city") and address_geocoded_from_text.get("city"):
                        address_value["city"] = address_geocoded_from_text["city"]
                    if not address_value.get("state") and address_geocoded_from_text.get("state"):
                        address_value["state"] = address_geocoded_from_text["state"]

            if addr_lat is not None and addr_lon is not None:
                distance = haversine(lat, lon, addr_lat, addr_lon)
                geocoded_address = {
                    "latitude": addr_lat,
                    "longitude": addr_lon,
                    "city": address_value.get("city"),
                    "state": address_value.get("state"),
                    "zip": address_value.get("zipcode"),
                }
            elif address_geocoded_from_text:
                geocoded_address = {
                    "latitude": address_geocoded_from_text.get("latitude"),
                    "longitude": address_geocoded_from_text.get("longitude"),
                    "city": address_geocoded_from_text.get("city"),
                    "state": address_geocoded_from_text.get("state"),
                    "zip": address_geocoded_from_text.get("zip"),
                }

            lead_dict["address"] = address_value
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
        lead_dict.pop("geocoded_address", None)
        lead_dict["source"] = source.value
        response_leads.append(lead_dict)

    response_leads.sort(
        key=lambda item: (
            item.get("distance_miles") is None,
            item.get("distance_miles") if item.get("distance_miles") is not None else float("inf"),
        )
    )
    trimmed_leads = response_leads[:max_results]

    response: Dict[str, object] = {
        "leads": trimmed_leads,
        "normalized_location": normalized_location,
        "radius_miles": radius_miles,
    }
    if dynamic_filter:
        response["dynamic_filter"] = dynamic_filter
    return response


@router.post("/searchLeads", summary="Search Lead Combined", tags=["Search Lead"])
def search_leads(request: LeadSearchRequest, db: Session = Depends(get_db)):
    unique_sources: List[DataSource] = []
    for src in request.sources or []:
        if src not in unique_sources:
            unique_sources.append(src)

    if not unique_sources:
        unique_sources = [DataSource.google_places]

    if DataSource.db in unique_sources:
        unique_sources = [DataSource.db] + [src for src in unique_sources if src != DataSource.db]
    else:
        unique_sources.insert(0, DataSource.db)

    errors: Dict[str, str] = {}
    external_persistence: Dict[str, Dict[str, int]] = {}

    external_sources = [src for src in unique_sources if src != DataSource.db]
    for source in external_sources:
        try:
            if source not in {DataSource.gpt, DataSource.rapidapi, DataSource.google_places}:
                errors[source.value] = "Unsupported source requested."
                continue
            ext_result = _perform_external_search(request, source)
            persistence = _persist_external_leads(db, ext_result.get("leads", []))
            external_persistence[source.value] = persistence
        except LocationResolutionError as exc:
            errors[source.value] = exc.message
        except ExternalProviderError as exc:
            errors[source.value] = f"External provider request failed: {exc.message}"
        except Exception as exc:
            errors[source.value] = f"Unexpected error: {exc}"

    aggregated_leads: List[Dict[str, object]] = []
    try:
        db_result = _perform_db_search(request, db)
        aggregated_leads = db_result.get("leads", [])
    except LocationResolutionError as exc:
        errors[DataSource.db.value] = exc.message
    except Exception as exc:
        errors[DataSource.db.value] = f"Unexpected error: {exc}"

    response: Dict[str, object] = {
        "aggregated_leads": aggregated_leads,
    }
    if external_persistence:
        response["external_persistence"] = external_persistence

    if errors:
        response["errors"] = errors

    return response
