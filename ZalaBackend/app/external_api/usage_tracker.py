import json
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any, Dict, Optional

_USAGE_FILE = Path(__file__).resolve().parent / "api_usage.json"
_LEGACY_FILE = Path(__file__).resolve().parent / "rapidapi_usage.json"
_USAGE_LOCK = Lock()


def _current_period() -> str:
    """Return the current calendar period in UTC (YYYY-MM)."""
    return datetime.utcnow().strftime("%Y-%m")


def _normalize_entry(entry: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not isinstance(entry, dict):
        entry = {}

    period = entry.get("period")
    if not isinstance(period, str):
        period = None

    count = entry.get("count", 0)
    try:
        count = int(count)
    except (TypeError, ValueError):
        count = 0

    if count < 0:
        count = 0

    return {"period": period, "count": count}


def _load_usage() -> Dict[str, Dict[str, Any]]:
    if _USAGE_FILE.exists():
        try:
            data = json.loads(_USAGE_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            data = {}

        if isinstance(data, dict):
            normalized: Dict[str, Dict[str, Any]] = {}
            for key, value in data.items():
                if isinstance(value, dict):
                    normalized[str(key)] = _normalize_entry(value)
            return normalized

    if _LEGACY_FILE.exists():
        try:
            legacy = json.loads(_LEGACY_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            legacy = {}

        if isinstance(legacy, dict) and "period" in legacy and "count" in legacy:
            return {"rapidapi": _normalize_entry(legacy)}

    return {}


def _save_usage(data: Dict[str, Dict[str, Any]]) -> None:
    serializable = {
        provider: {
            "period": details.get("period"),
            "count": int(details.get("count", 0)),
        }
        for provider, details in data.items()
    }

    _USAGE_FILE.write_text(json.dumps(serializable, indent=2), encoding="utf-8")

    try:
        if _LEGACY_FILE.exists():
            _LEGACY_FILE.unlink()
    except OSError:
        # Non-fatal if we cannot clean up the legacy file.
        pass


def reserve_call(provider: str, max_calls: int, *, label: Optional[str] = None) -> int:
    """
    Reserve a single API call for the given provider. Raises RuntimeError if the limit would be exceeded.
    Returns the new count for the current period.
    """
    if max_calls <= 0:
        raise ValueError("max_calls must be positive")

    key = provider.strip()
    display_name = label or key

    with _USAGE_LOCK:
        usage = _load_usage()
        entry = _normalize_entry(usage.get(key))

        period = _current_period()
        if entry["period"] != period:
            entry["period"] = period
            entry["count"] = 0

        if entry["count"] >= max_calls:
            raise RuntimeError(f"{display_name} monthly quota exceeded ({max_calls} calls).")

        entry["count"] += 1
        usage[key] = entry
        _save_usage(usage)
        return entry["count"]
