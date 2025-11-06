import json
import pprint
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Set

import requests

from . import RAPIDAPI_KEY
from .to_leads import rapid_to_leads

MAX_RAPIDAPI_CALLS_PER_MONTH = 95
_USAGE_FILE = Path(__file__).resolve().parent / "rapidapi_usage.json"
_USAGE_LOCK = Lock()


def _current_period() -> str:
    """Return the current calendar period in UTC (YYYY-MM)."""
    return datetime.utcnow().strftime("%Y-%m")


def _load_usage() -> Dict[str, Any]:
    if not _USAGE_FILE.exists():
        return {"period": None, "count": 0}

    try:
        data = json.loads(_USAGE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"period": None, "count": 0}

    if not isinstance(data, dict):
        return {"period": None, "count": 0}

    return data


def _save_usage(data: Dict[str, Any]) -> None:
    try:
        _USAGE_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except OSError as exc:
        raise RuntimeError("Unable to persist RapidAPI usage tracker.") from exc


def _reserve_rapidapi_call() -> None:
    with _USAGE_LOCK:
        usage = _load_usage()
        period = _current_period()

        stored_period = usage.get("period")
        try:
            count = int(usage.get("count", 0))
        except (TypeError, ValueError):
            count = 0

        if stored_period != period:
            stored_period = period
            count = 0

        if count >= MAX_RAPIDAPI_CALLS_PER_MONTH:
            raise RuntimeError(
                f"RapidAPI monthly quota exceeded ({MAX_RAPIDAPI_CALLS_PER_MONTH} calls)."
            )

        count += 1
        _save_usage({"period": stored_period, "count": count})


def _fetch_agents_page(city: str, page: int, page_size: int, allow_retry: bool = True) -> List[Dict[str, Any]]:
    _reserve_rapidapi_call()

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

    # with open("agents_log.txt", "a", encoding="utf-8") as f:
    #     f.write("\n--- new run ---\n")
    #     f.write(json.dumps(response.json()["data"]["results"]["professionals"], indent=2, ensure_ascii=False))
