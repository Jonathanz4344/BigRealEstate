import os
from typing import Any, Dict, List

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token


class GoogleTokenVerificationError(Exception):
    """Raised when a Google ID token cannot be validated."""


def _load_client_ids() -> List[str]:
    raw_value = os.getenv("GOOGLE_CLIENT_ID", "")
    return [client_id.strip() for client_id in raw_value.split(",") if client_id.strip()]


_CLIENT_IDS = _load_client_ids()
_ALLOWED_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}
_ISSUER_OVERRIDE = os.getenv("GOOGLE_ISSUER")
if _ISSUER_OVERRIDE:
    _ALLOWED_ISSUERS.add(_ISSUER_OVERRIDE)


def verify_google_id_token(token: str) -> Dict[str, Any]:
    """
    Validate a Google ID token and return the decoded payload.
    """
    if not token:
        raise GoogleTokenVerificationError("Missing Google ID token.")

    if not _CLIENT_IDS:
        raise GoogleTokenVerificationError("Google client ID is not configured.")

    request = google_requests.Request()
    last_error: Exception | None = None
    id_info: Dict[str, Any] | None = None

    for client_id in _CLIENT_IDS:
        try:
            id_info = id_token.verify_oauth2_token(token, request, client_id)
            break
        except Exception as exc:  # pragma: no cover - specific error types vary
            last_error = exc

    if not id_info:
        raise GoogleTokenVerificationError("Invalid Google ID token.") from last_error

    if id_info.get("iss") not in _ALLOWED_ISSUERS:
        raise GoogleTokenVerificationError("Invalid Google token issuer.")

    if not id_info.get("email"):
        raise GoogleTokenVerificationError("Google token did not include an email address.")

    if not id_info.get("email_verified"):
        raise GoogleTokenVerificationError("Google account email is not verified.")

    return id_info
