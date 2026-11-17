from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.settings import get_settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode(
        "utf-8"
    )


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"), password_hash.encode("utf-8")
        )
    except Exception:
        return False


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(*, user_id: str, email: str, token_version: int = 0) -> str:
    settings = get_settings()
    payload = {
        "sub": user_id,
        "email": email,
        "typ": "access",
        "ver": token_version,
        "exp": _now() + timedelta(minutes=settings.access_token_minutes),
        "iat": _now(),
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.signing_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(*, user_id: str, token_version: int = 0) -> tuple[str, str, int]:
    """Returns (token, jti, ttl_seconds)."""
    settings = get_settings()
    jti = str(uuid.uuid4())
    ttl = settings.refresh_token_days * 24 * 3600
    payload = {
        "sub": user_id,
        "typ": "refresh",
        "ver": token_version,
        "exp": _now() + timedelta(seconds=ttl),
        "iat": _now(),
        "jti": jti,
    }
    token = jwt.encode(payload, settings.signing_secret, algorithm=settings.jwt_algorithm)
    return token, jti, ttl


def decode_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.signing_secret, algorithms=[settings.jwt_algorithm])


def safe_decode(token: str) -> dict[str, Any] | None:
    try:
        return decode_token(token)
    except JWTError:
        return None
