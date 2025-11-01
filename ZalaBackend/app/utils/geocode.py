import requests
import os

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def geocode_location(text: str):
    url = f"https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": text, "key": GOOGLE_API_KEY}
    response = requests.get(url, params=params).json()

    if response["status"] != "OK":
        return None

    result = response["results"][0]
    location = result["geometry"]["location"]
    components = {c["types"][0]: c["long_name"] for c in result["address_components"]}

    return {
        "latitude": location["lat"],
        "longitude": location["lng"],
        "city": components.get("locality"),
        "state": components.get("administrative_area_level_1"),
        "zip": components.get("postal_code")
    }

def reverse_geocode(lat: float, lng: float):
    url = f"https://maps.googleapis.com/maps/api/geocode/json"
    params = {"latlng": f"{lat},{lng}", "key": GOOGLE_API_KEY}
    response = requests.get(url, params=params).json()

    if response["status"] != "OK":
        return None

    result = response["results"][0]
    components = {c["types"][0]: c["long_name"] for c in result["address_components"]}

    return {
        "latitude": lat,
        "longitude": lng,
        "city": components.get("locality"),
        "state": components.get("administrative_area_level_1"),
        "zip": components.get("postal_code")
    }