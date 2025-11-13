from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.user_google_credentials import UserGoogleCredential
from app.utils.encryption import encrypt_secret, decrypt_secret


def get_credentials(db: Session, user_id: int) -> Optional[UserGoogleCredential]:
    return db.query(UserGoogleCredential).filter(UserGoogleCredential.user_id == user_id).first()


def upsert_tokens(
    db: Session,
    user_id: int,
    access_token: str,
    expires_in: int,
    scope: Optional[str],
    refresh_token: Optional[str] = None,
) -> UserGoogleCredential:
    credentials = get_credentials(db, user_id)
    if not credentials:
        credentials = UserGoogleCredential(user_id=user_id)

    credentials.access_token_encrypted = encrypt_secret(access_token)
    credentials.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=max(0, expires_in))
    credentials.scope = scope

    if refresh_token:
        credentials.refresh_token_encrypted = encrypt_secret(refresh_token)

    db.add(credentials)
    db.commit()
    db.refresh(credentials)
    return credentials


def update_access_token(
    db: Session,
    credentials: UserGoogleCredential,
    access_token: str,
    expires_in: int,
) -> UserGoogleCredential:
    credentials.access_token_encrypted = encrypt_secret(access_token)
    credentials.token_expiry = datetime.now(timezone.utc) + timedelta(seconds=max(0, expires_in))
    db.add(credentials)
    db.commit()
    db.refresh(credentials)
    return credentials


def decrypt_tokens(credentials: UserGoogleCredential) -> tuple[Optional[str], Optional[str]]:
    return (
        decrypt_secret(credentials.access_token_encrypted),
        decrypt_secret(credentials.refresh_token_encrypted),
    )
