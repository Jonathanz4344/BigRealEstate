import requests, sys, re, pprint
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

def search_agents(place_text_or_zip: str, radius_m=10000):
    lat, lng = geocode(place_text_or_zip)

    payload = {
        "includedTypes": ["real_estate_agency"],
        "locationRestriction": {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": radius_m}},
    }
    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        # Basic fields returned by searchNearby
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
    }
    r = requests.post(PLACES_NEARBY_URL, headers=headers, json=payload, timeout=10)
    if r.status_code == 403:
        raise PlacesError("Forbidden: check Places API key restrictions & that Places API is enabled.")
    if r.status_code >= 400:
        raise PlacesError(
            f"searchNearby failed (status={r.status_code}): {r.text or 'No response body'}"
        )
    r.raise_for_status()
    places = r.json().get("places", [])

    results = []
    for p in places:
        base = {
            "id": p["id"],
            "name": p["displayName"]["text"],
            "address": p.get("formattedAddress"),
            "lat": p.get("location", {}).get("latitude"),
            "lng": p.get("location", {}).get("longitude"),
        }
        # Try to enrich with contact info; fail soft if not available
        try:
            base.update(get_place_contact(p["id"]))
        except Exception:
            base.update({"phone": None, "website": None, "maps_url": None})
        results.append(base)
    return gplaces_to_leads(results)

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "Houston, TX"
    try:
        agents = search_agents(query)
        pprint.pprint(agents)
    except (GeocodeError, PlacesError) as e:
        print(f"Error: {e}")
