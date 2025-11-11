import requests, sys, re, pprint, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional
from . import GOOGLE_API_KEY
from .to_leads import gplaces_to_leads

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACES_GET_URL = "https://places.googleapis.com/v1/places/"

ZIP_RE = re.compile(r"^\s*\d{5}(-\d{4})?\s*$")

class GeocodeError(RuntimeError): ...
class PlacesError(RuntimeError): ...

def geocode(query: str):
    params = {"key": GOOGLE_API_KEY}
    if ZIP_RE.match(query):
        params.update({"components": f"postal_code:{query},country:US"})
    else:
        params.update({"address": query, "region": "us"})
    r = requests.get(GEOCODE_URL, params=params, timeout=10)
    r.raise_for_status()
    data = r.json()
    if data.get("status") != "OK":
        raise GeocodeError(data.get("error_message") or f"Geocoding status={data.get('status')}")
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]

def get_place_contact(place_id: str) -> dict:
    """Fetch contact info (phone, website) for a place id."""
    url = f"{PLACES_GET_URL}{place_id}"
    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        # Contact fields are only returned by getPlace and incur Contact Data billing.
        "X-Goog-FieldMask": "id,displayName,websiteUri,nationalPhoneNumber,internationalPhoneNumber,googleMapsUri",
    }
    r = requests.get(url, headers=headers, timeout=10)
    if r.status_code == 403:
        raise PlacesError(
            "Forbidden on getPlace: contact fields require Places API enabled, billing active, "
            "and no incompatible key restrictions."
        )
    r.raise_for_status()
    d = r.json()
    return {
        "phone": d.get("nationalPhoneNumber") or d.get("internationalPhoneNumber"),
        "website": d.get("websiteUri"),
        "maps_url": d.get("googleMapsUri"),
    }

def search_agents(place_text_or_zip: str, radius_m=10000, max_results: int = 50):
    max_results = max(1, min(50, max_results))
    lat, lng = geocode(place_text_or_zip)

    collected_places: list[dict] = []
    seen_ids: set[str] = set()
    next_page_token: str | None = None

    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        # Basic fields returned by searchNearby
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
    }

    while len(collected_places) < max_results:
        payload = {
            "includedTypes": ["real_estate_agency"],
            "locationRestriction": {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": radius_m}},
        }
        if next_page_token:
            payload["pageToken"] = next_page_token

        r = requests.post(PLACES_NEARBY_URL, headers=headers, json=payload, timeout=10)
        if r.status_code == 403:
            raise PlacesError("Forbidden: check Places API key restrictions & that Places API is enabled.")
        if r.status_code >= 400:
            raise PlacesError(
                f"searchNearby failed (status={r.status_code}): {r.text or 'No response body'}"
            )
        r.raise_for_status()

        data = r.json()
        places = data.get("places", []) or []
        for p in places:
            place_id = p.get("id")
            if place_id and place_id in seen_ids:
                continue
            if place_id:
                seen_ids.add(place_id)
            collected_places.append(p)
            if len(collected_places) >= max_results:
                break

        next_page_token = data.get("nextPageToken")
        if not next_page_token or len(collected_places) >= max_results or not places:
            break

        # The nextPageToken can take a moment to become valid.
        time.sleep(2)

    def _build_base(place: Dict[str, object]) -> Dict[str, object]:
        return {
            "id": place.get("id"),
            "name": place.get("displayName", {}).get("text"),
            "address": place.get("formattedAddress"),
            "lat": place.get("location", {}).get("latitude"),
            "lng": place.get("location", {}).get("longitude"),
        }

    def _enrich_with_contact(place: Dict[str, object]) -> Dict[str, object]:
        base = _build_base(place)
        place_id = base.get("id")
        if not place_id:
            base.update({"phone": None, "website": None, "maps_url": None})
            return base
        try:
            base.update(get_place_contact(place_id))
        except Exception:
            base.update({"phone": None, "website": None, "maps_url": None})
        return base

    selected_places: List[Dict[str, object]] = collected_places[:max_results]
    if not selected_places:
        return []

    if len(selected_places) == 1:
        enriched = [_enrich_with_contact(selected_places[0])]
    else:
        max_workers = min(8, len(selected_places))
        enriched: List[Optional[Dict[str, object]]] = [None] * len(selected_places)

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_map = {
                executor.submit(_enrich_with_contact, place): idx
                for idx, place in enumerate(selected_places)
            }
            for future in as_completed(future_map):
                idx = future_map[future]
                enriched[idx] = future.result()

        enriched = [item for item in enriched if item is not None]

    return gplaces_to_leads(enriched)

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "Houston, TX"
    try:
        agents = search_agents(query)
        pprint.pprint(agents)
    except (GeocodeError, PlacesError) as e:
        print(f"Error: {e}")
