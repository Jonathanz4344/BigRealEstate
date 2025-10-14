import requests, sys, re
from __init__ import GOOGLE_API_KEY

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"

ZIP_RE = re.compile(r"^\s*\d{5}(-\d{4})?\s*$")

class GeocodeError(RuntimeError): ...
class PlacesError(RuntimeError): ...

def geocode(query: str):
    """Return (lat, lng) for a city/state or a ZIP. Raises GeocodeError when not found."""
    params = {"key": GOOGLE_API_KEY}
    # If it looks like a US ZIP, use components (more reliable)
    if ZIP_RE.match(query):
        params.update({"components": f"postal_code:{query},country:US"})
    else:
        params.update({
            "address": query,
            "region": "us"  # bias to US results
        })

    r = requests.get(GEOCODE_URL, params=params, timeout=10)
    r.raise_for_status()
    data = r.json()

    status = data.get("status")
    if status != "OK":
        # Surface useful details for debugging
        msg = data.get("error_message") or f"Geocoding status={status}"
        raise GeocodeError(msg)

    results = data.get("results", [])
    if not results:
        raise GeocodeError("No geocoding results found.")
    loc = results[0]["geometry"]["location"]
    return loc["lat"], loc["lng"]

def search_agents(place_text_or_zip: str, radius_m=10000):
    lat, lng = geocode(place_text_or_zip)

    payload = {
        "includedTypes": ["real_estate_agency"],
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius_m
            }
        }
    }

    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location"
    }

    r = requests.post(PLACES_NEARBY_URL, headers=headers, json=payload, timeout=10)
    if r.status_code == 403:
        raise PlacesError("Forbidden: check Places API key restrictions & that Places API is enabled.")
    r.raise_for_status()
    data = r.json()

    places = data.get("places", [])
    return [
        {
            "id": p["id"],
            "name": p["displayName"]["text"],
            "address": p.get("formattedAddress"),
            "lat": p.get("location", {}).get("latitude"),
            "lng": p.get("location", {}).get("longitude"),
        }
        for p in places
    ]

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "Houston, TX"
    try:
        agents = search_agents(query)
        for a in agents:
            print(f"{a['name']} — {a['address']}")
        if not agents:
            print("No agents found in the search radius.")
    except (GeocodeError, PlacesError) as e:
        print(f"Error: {e}")
