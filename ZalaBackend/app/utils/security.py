from passlib.context import CryptContext
from passlib.hash import argon2 as _argon2

# Passlib will choose the first available scheme in this list.
pwd_context = CryptContext(
    schemes=[
        "argon2",            # requires argon2-cffi
        # Note: bcrypt variants disabled due to Python 3.13 backend issue
        "pbkdf2_sha256",     # pure-python fallback (no extra deps)
    ],
    deprecated="auto",
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain-text password against stored hash.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hashes plain-text password.
    """
    # Choose the strongest available scheme at runtime to avoid
    # MissingBackendError when optional backends aren't installed.
    if _argon2.has_backend():
        scheme = "argon2"
    else:
        scheme = "pbkdf2_sha256"

    return pwd_context.hash(password, scheme=scheme)
