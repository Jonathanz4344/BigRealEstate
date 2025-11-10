from __future__ import annotations

import base64
from datetime import datetime, timedelta, timezone
from email.utils import formataddr
import logging
from typing import Optional

import requests
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud import google_credentials as google_credentials_crud
from app.models.user import User
from app.schemas import GmailSendRequest, GmailSendResponse
from app.utils.encryption import EncryptionError, decrypt_secret
from app.utils.google_oauth import GoogleOAuthExchangeError, refresh_access_token

logger = logging.getLogger(__name__)

_GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"


def _build_from_header(user: User, from_name: Optional[str]) -> tuple[str, str]:
    email = None
    if user.authentication and user.authentication.provider_email:
        email = user.authentication.provider_email
    elif user.contact and user.contact.email:
        email = user.contact.email

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is missing an email address for Gmail.",
        )

    if from_name:
        display_name = from_name
    elif user.contact:
        parts = [user.contact.first_name or "", user.contact.last_name or ""]
        display_name = " ".join(part for part in parts if part).strip() or user.username
    else:
        display_name = user.username

    return email, formataddr((display_name, email))


def _encode_message(from_header: str, to_email: str, subject: str, html: str) -> str:
    mime = [
        f"From: {from_header}",
        f"To: {to_email}",
        f"Subject: {subject}",
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "",
        html,
    ]
    message = "\r\n".join(mime).encode("utf-8")
    return base64.urlsafe_b64encode(message).decode("utf-8").rstrip("=")


def _decrypt_tokens(credentials):
    try:
        return google_credentials_crud.decrypt_tokens(credentials)
    except EncryptionError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to read stored Google credentials.",
        ) from exc


def _resolve_access_token(db: Session, credentials) -> str:
    access_token, refresh_token = _decrypt_tokens(credentials)
    now = datetime.now(timezone.utc)

    if (
        access_token
        and credentials.token_expiry
        and credentials.token_expiry > now + timedelta(seconds=30)
    ):
        return access_token

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google session expired. Please reconnect your Google account.",
        )

    try:
        refreshed = refresh_access_token(refresh_token)
    except GoogleOAuthExchangeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google rejected the refresh token. Reconnect your Google account.",
        ) from exc

    new_access = refreshed.get("access_token")
    expires_in = int(refreshed.get("expires_in") or 0)

    if not new_access or not expires_in:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google refresh response was incomplete.",
        )

    google_credentials_crud.update_access_token(db, credentials, new_access, expires_in)
    return new_access


def send_gmail_message(db: Session, user: User, request: GmailSendRequest) -> GmailSendResponse:
    credentials = google_credentials_crud.get_credentials(db, user.user_id)
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account is not connected.",
        )

    access_token = _resolve_access_token(db, credentials)
    _, from_header = _build_from_header(user, request.from_name)
    raw_message = _encode_message(from_header, request.to, request.subject, request.html)

    payload = {"raw": raw_message}
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(_GMAIL_SEND_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
    except requests.HTTPError as exc:
        body = response.text if response is not None else "<no response body>"
        logger.error("Gmail send failed (status %s): %s", response.status_code, body)
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google rejected the access token. Please reconnect your Google account.",
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Google Gmail API returned an error.",
        ) from exc
    except requests.RequestException as exc:
        logger.error("Gmail send request failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to reach Google Gmail API.",
        ) from exc

    data = response.json()
    return GmailSendResponse(id=data.get("id"), thread_id=data.get("threadId"))
