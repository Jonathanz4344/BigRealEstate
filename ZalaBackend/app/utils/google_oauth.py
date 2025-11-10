import os
from typing import Any, Dict, List

import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token


class GoogleTokenVerificationError(Exception):
    """Raised when a Google ID token cannot be validated."""


class GoogleOAuthExchangeError(Exception):
    """Raised when exchanging or refreshing Google OAuth tokens fails."""


_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"


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


def _get_client_config() -> Dict[str, str]:
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI") or "postmessage"

    if not client_id or not client_secret:
        raise GoogleOAuthExchangeError("Google OAuth client ID/secret are not configured.")

    return {
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
    }


def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    """
    Exchange an OAuth authorization code for access and refresh tokens.
    """
    if not code:
        raise GoogleOAuthExchangeError("Missing authorization code.")

    config = _get_client_config()
    payload = {
        "code": code,
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "redirect_uri": config["redirect_uri"],
        "grant_type": "authorization_code",
    }

    try:
        response = requests.post(_TOKEN_ENDPOINT, data=payload, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise GoogleOAuthExchangeError("Failed to exchange authorization code.") from exc

    data: Dict[str, Any] = response.json()
    if "access_token" not in data:
        raise GoogleOAuthExchangeError("Token exchange response did not include an access token.")

    return data


def refresh_access_token(refresh_token: str) -> Dict[str, Any]:
    """
    Refresh an access token using a stored refresh token.
    """
    if not refresh_token:
        raise GoogleOAuthExchangeError("Missing refresh token.")

    config = _get_client_config()
    payload = {
        "refresh_token": refresh_token,
        "client_id": config["client_id"],
        "client_secret": config["client_secret"],
        "grant_type": "refresh_token",
    }

    try:
        response = requests.post(_TOKEN_ENDPOINT, data=payload, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise GoogleOAuthExchangeError("Failed to refresh Google access token.") from exc

    data: Dict[str, Any] = response.json()
    if "access_token" not in data:
        raise GoogleOAuthExchangeError("Refresh response did not include an access token.")

    return data
