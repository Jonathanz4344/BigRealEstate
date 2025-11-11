import json
import pprint
from typing import Any, Dict, List, Set

import requests

from . import RAPIDAPI_KEY
from .to_leads import rapid_to_leads
from .usage_tracker import reserve_call

MAX_RAPIDAPI_CALLS_PER_MONTH = 95


def _fetch_agents_page(city: str, page: int, page_size: int, allow_retry: bool = True) -> List[Dict[str, Any]]:
    reserve_call("rapidapi", MAX_RAPIDAPI_CALLS_PER_MONTH, label="RapidAPI")

    url = "https://zillow-com4.p.rapidapi.com/agents/search"
    querystring: Dict[str, Any] = {"location": city, "specialty": "BuyersAgent"}
    if page > 1:
        querystring["page"] = page
    if page_size > 0:
        querystring["pageSize"] = page_size

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "zillow-com4.p.rapidapi.com",
    }

    response = requests.get(url, headers=headers, params=querystring, timeout=10)
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        if page_size > 0 and allow_retry:
            return _fetch_agents_page(city, page, 0, allow_retry=False)
        if page > 1 and exc.response is not None and exc.response.status_code in (400, 404):
            return []
        text = exc.response.text if exc.response is not None else "No response body"
        raise RuntimeError(f"RapidAPI request failed: {text}") from exc

    payload: Dict[str, Any] = response.json()
    data_block = payload.get("data") or {}
    results_block = data_block.get("results") or {}
    professionals: List[Dict[str, Any]] = results_block.get("professionals") or []

    return professionals


def search_agents(city: str, max_results: int = 50):
    max_results = max(1, max_results)
    aggregated: List[Dict[str, Any]] = []
    seen_keys: Set[str] = set()
    page = 1
    max_pages = max(1, min(10, (max_results + 9) // 10))
    page_size = min(50, max_results)

    while len(aggregated) < max_results and page <= max_pages:
        professionals = _fetch_agents_page(city, page, page_size if page == 1 else 0)
        if not professionals:
            if page == 1:
                raise RuntimeError("RapidAPI response did not include any professionals.")
            break

        added_this_page = 0
        for prof in professionals:
            key_candidate = (
                prof.get("encodedZuid")
                or prof.get("id")
                or prof.get("profileLink")
                or prof.get("fullName")
                or prof.get("businessName")
            )
            key_str = str(key_candidate) if key_candidate is not None else json.dumps(prof, sort_keys=True)
            if key_str in seen_keys:
                continue
            seen_keys.add(key_str)
            aggregated.append(prof)
            added_this_page += 1
            if len(aggregated) >= max_results:
                break

        if len(aggregated) >= max_results:
            break
        if added_this_page == 0:
            break

        page += 1

    truncated = aggregated[:max_results]
    if not truncated:
        raise RuntimeError("RapidAPI response did not include any professionals.")

    leads = rapid_to_leads(truncated)

    return leads


if __name__ == "__main__":
    response = search_agents("Houston, TX")
    pprint.pprint(response)