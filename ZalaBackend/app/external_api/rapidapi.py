import json
import pprint
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List

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


def search_agents(city: str):
    _reserve_rapidapi_call()

    url = "https://zillow-com4.p.rapidapi.com/agents/search"

    querystring = {"location": city, "specialty": "BuyersAgent"}

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "zillow-com4.p.rapidapi.com",
    }

    response = requests.get(url, headers=headers, params=querystring, timeout=10)
    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        text = exc.response.text if exc.response is not None else "No response body"
        raise RuntimeError(f"RapidAPI request failed: {text}") from exc

    payload: Dict[str, Any] = response.json()

    data_block = payload.get("data") or {}
    results_block = data_block.get("results") or {}
    professionals: List[Dict[str, Any]] = results_block.get("professionals") or []

    if not professionals:
        raise RuntimeError("RapidAPI response did not include any professionals.")

    leads = rapid_to_leads(professionals)

    return leads


if __name__ == "__main__":
    response = search_agents("Houston, TX")
    pprint.pprint(response)

    # with open("agents_log.txt", "a", encoding="utf-8") as f:
    #     f.write("\n--- new run ---\n")
    #     f.write(json.dumps(response.json()["data"]["results"]["professionals"], indent=2, ensure_ascii=False))
