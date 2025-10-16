import requests
import pprint
import json
from __init__ import RAPIDAPI_KEY
from to_leads import rapid_to_leads

def search_agents(city: str):

    url = "https://zillow-com4.p.rapidapi.com/agents/search"

    querystring = {"location":city,"specialty":"BuyersAgent"}

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "zillow-com4.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)

    leads = rapid_to_leads(response.json()["data"]["results"]["professionals"])

    return leads


if __name__ == "__main__":
    response = search_agents("Houston, TX")
    pprint.pprint(response)

    # with open("agents_log.txt", "a", encoding="utf-8") as f:
    #     f.write("\n--- new run ---\n")
    #     f.write(json.dumps(response.json()["data"]["results"]["professionals"], indent=2, ensure_ascii=False))


