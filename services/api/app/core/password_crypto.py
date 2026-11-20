"""RSA-OAEP password transport: decrypt browser ciphertexts before bcrypt."""

from __future__ import annotations

import base64
import hashlib
import json
import logging
import time
from functools import lru_cache
from typing import Any

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey

from app.core.errors import AppError
from app.core.settings import get_settings

logger = logging.getLogger(__name__)

ALG = "RSA-OAEP-256"
MAX_SKEW_MS = 120_000
_DEV_KEY: RSAPrivateKey | None = None


def _normalize_pem(raw: str) -> str:
    text = raw.strip()
    if "\\n" in text and "\n" not in text:
        text = text.replace("\\n", "\n")
    return text


def _load_private_key(pem: str) -> RSAPrivateKey:
    key = serialization.load_pem_private_key(
        _normalize_pem(pem).encode("utf-8"),
        password=None,
    )
    if not isinstance(key, RSAPrivateKey):
        raise AppError(
            "Invalid password RSA key type",
            code="PASSWORD_KEY_INVALID",
            status_code=500,
        )
    return key


def _generate_dev_key() -> RSAPrivateKey:
    global _DEV_KEY
    if _DEV_KEY is None:
        logger.warning(
            "AUTH_PASSWORD_RSA_PRIVATE_KEY unset — using ephemeral RSA key "
            "(dev only; set a stable PEM for production / multi-worker)"
        )
        _DEV_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return _DEV_KEY


@lru_cache
def _private_key() -> RSAPrivateKey:
    settings = get_settings()
    pem = (settings.auth_password_rsa_private_key or "").strip()
    if pem:
        return _load_private_key(pem)
    return _generate_dev_key()


def public_key_pem() -> str:
    return (
        _private_key()
        .public_key()
        .public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        .decode("utf-8")
    )


def key_id() -> str:
    return hashlib.sha256(public_key_pem().encode("utf-8")).hexdigest()[:16]


def password_key_payload() -> dict[str, str]:
    return {
        "keyId": key_id(),
        "publicKeyPem": public_key_pem(),
        "alg": ALG,
    }


def decrypt_password_cipher(cipher_b64: str) -> str:
    """Decrypt base64 RSA-OAEP ciphertext of JSON {"p": password, "t": unix_ms}."""
    if not cipher_b64 or not cipher_b64.strip():
        raise AppError(
            "Missing password cipher",
            code="PASSWORD_CIPHER_REQUIRED",
            status_code=400,
        )
    try:
        raw = base64.b64decode(cipher_b64.strip(), validate=True)
    except Exception as exc:
        raise AppError(
            "Invalid password cipher encoding",
            code="PASSWORD_CIPHER_INVALID",
            status_code=400,
        ) from exc

    try:
        plaintext = _private_key().decrypt(
            raw,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
    except Exception as exc:
        raise AppError(
            "Invalid password cipher",
            code="PASSWORD_CIPHER_INVALID",
            status_code=400,
        ) from exc

    try:
        data: dict[str, Any] = json.loads(plaintext.decode("utf-8"))
    except Exception as exc:
        raise AppError(
            "Invalid password cipher payload",
            code="PASSWORD_CIPHER_INVALID",
            status_code=400,
        ) from exc

    password = data.get("p")
    ts = data.get("t")
    if not isinstance(password, str) or not password:
        raise AppError(
            "Invalid password cipher payload",
            code="PASSWORD_CIPHER_INVALID",
            status_code=400,
        )
    if not isinstance(ts, (int, float)):
        raise AppError(
            "Invalid password cipher timestamp",
            code="PASSWORD_CIPHER_INVALID",
            status_code=400,
        )
    now_ms = int(time.time() * 1000)
    if abs(now_ms - int(ts)) > MAX_SKEW_MS:
        raise AppError(
            "Password cipher expired",
            code="PASSWORD_CIPHER_EXPIRED",
            status_code=400,
        )
    if len(password) > 72:
        raise AppError(
            "Password too long",
            code="PASSWORD_TOO_LONG",
            status_code=400,
        )
    return password


def clear_password_crypto_cache() -> None:
    """Test helper: drop cached private key."""
    global _DEV_KEY
    _DEV_KEY = None
    _private_key.cache_clear()
