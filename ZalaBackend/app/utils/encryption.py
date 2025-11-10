import os
from functools import lru_cache
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken


class EncryptionConfigError(RuntimeError):
    """Raised when encryption cannot be configured."""


class EncryptionError(RuntimeError):
    """Raised when encryption or decryption fails."""


def _load_key() -> bytes:
    key = os.getenv("GOOGLE_TOKEN_ENCRYPTION_KEY")
    if not key:
        raise EncryptionConfigError(
            "GOOGLE_TOKEN_ENCRYPTION_KEY is not set. Generate one with "
            "`python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"` "
            "and add it to your environment."
        )
    return key.encode()


@lru_cache(maxsize=1)
def _fernet() -> Fernet:
    key = _load_key()
    try:
        return Fernet(key)
    except (ValueError, TypeError) as exc:
        raise EncryptionConfigError("GOOGLE_TOKEN_ENCRYPTION_KEY is invalid.") from exc


def encrypt_secret(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None

    try:
        return _fernet().encrypt(value.encode()).decode()
    except (InvalidToken, TypeError) as exc:
        raise EncryptionError("Unable to encrypt secret.") from exc


def decrypt_secret(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None

    try:
        return _fernet().decrypt(value.encode()).decode()
    except (InvalidToken, TypeError) as exc:
        raise EncryptionError("Unable to decrypt secret.") from exc
