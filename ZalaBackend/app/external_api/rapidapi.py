import requests
import pprint
import json
from __init__ import RAPIDAPI_KEY

url = "https://zillow-com4.p.rapidapi.com/agents/search"

querystring = {"location":"Houston, TX","specialty":"BuyersAgent"}

headers = {
	"x-rapidapi-key": RAPIDAPI_KEY,
	"x-rapidapi-host": "zillow-com4.p.rapidapi.com"
}

response = requests.get(url, headers=headers, params=querystring)

pprint.pprint(response.json()["data"]["results"]["professionals"])

with open("agents_log.txt", "a", encoding="utf-8") as f:
    f.write("\n--- new run ---\n")
    f.write(json.dumps(response.json()["data"]["results"]["professionals"], indent=2, ensure_ascii=False))