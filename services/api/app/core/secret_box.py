"""AES-256-GCM secret box compatible with src/lib/crypto/secret-box.ts.

Wire format: base64(iv | tag | ciphertext), iv=12, tag=16.
"""

from __future__ import annotations

import base64
import json
import os
from typing import Any

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.settings import get_settings

IV_LEN = 12
TAG_LEN = 16


def _resolve_key() -> bytes:
    raw = (get_settings().credentials_encryption_key or "").strip()
    if not raw:
        raise ValueError("CREDENTIALS_ENCRYPTION_KEY is not set")
    if len(raw) == 64 and all(c in "0123456789abcdefABCDEF" for c in raw):
        return bytes.fromhex(raw)
    try:
        from_b64 = base64.b64decode(raw, validate=False)
    except Exception as exc:
        raise ValueError(
            "CREDENTIALS_ENCRYPTION_KEY must be 32-byte hex (64 chars) or base64"
        ) from exc
    if len(from_b64) == 32:
        return from_b64
    raise ValueError(
        "CREDENTIALS_ENCRYPTION_KEY must be 32-byte hex (64 chars) or base64"
    )


def encrypt_json(value: Any) -> str:
    key = _resolve_key()
    iv = os.urandom(IV_LEN)
    plaintext = json.dumps(value, separators=(",", ":"), ensure_ascii=False).encode(
        "utf-8"
    )
    # AESGCM.encrypt returns ciphertext || tag
    bundled = AESGCM(key).encrypt(iv, plaintext, None)
    ciphertext, tag = bundled[:-TAG_LEN], bundled[-TAG_LEN:]
    return base64.b64encode(iv + tag + ciphertext).decode("ascii")


def decrypt_json(blob: str) -> Any:
    key = _resolve_key()
    buf = base64.b64decode(blob)
    if len(buf) < IV_LEN + TAG_LEN + 1:
        raise ValueError("Invalid ciphertext")
    iv = buf[:IV_LEN]
    tag = buf[IV_LEN : IV_LEN + TAG_LEN]
    ciphertext = buf[IV_LEN + TAG_LEN :]
    plaintext = AESGCM(key).decrypt(iv, ciphertext + tag, None)
    return json.loads(plaintext.decode("utf-8"))
