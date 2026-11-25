"""Minimal Futu OpenAPI cloud REST (appkey Ed25519) for industry heatmap."""

from __future__ import annotations

import base64
import hashlib
import logging
import os
import secrets
import time
from typing import Any
from urllib.parse import quote

import httpx

log = logging.getLogger(__name__)

FUTU_HOST = os.environ.get("FUTU_HTTP_URL", "").strip() or "https://webapi.futunn.com"

_time_offset_ms = 0.0
_time_synced_at = 0.0
_TIME_SYNC_TTL = 300.0


def env_futu_appkey_creds() -> dict[str, Any] | None:
    app_key = os.environ.get("FUTU_APP_KEY", "").strip()
    private_key = (
        os.environ.get("FUTU_PRIVATE_KEY", "").strip()
        or os.environ.get("FUTU_APP_SECRET", "").strip()
    )
    if not app_key or not private_key:
        return None
    return {
        "mode": "appkey",
        "appKey": app_key,
        "privateKey": private_key,
        "signAlg": (os.environ.get("FUTU_SIGN_ALG") or "ed25519").strip().lower(),
    }


def futu_configured(store: dict[str, Any] | None = None) -> bool:
    if env_futu_appkey_creds():
        return True
    if store and isinstance(store.get("futu"), dict):
        f = store["futu"]
        if f.get("mode") == "bearer" and f.get("accessToken"):
            return True
        if f.get("mode") == "appkey" and f.get("appKey") and f.get("privateKey"):
            return True
    return False


def _resolve_creds(store: dict[str, Any] | None) -> dict[str, Any] | None:
    env = env_futu_appkey_creds()
    if env:
        return env
    if store and isinstance(store.get("futu"), dict):
        return store["futu"]
    return None


def _load_ed25519(private_key: str) -> Any:
    from cryptography.hazmat.primitives.serialization import (
        load_der_private_key,
        load_pem_private_key,
    )

    raw = private_key.replace("\\n", "\n").strip()
    if "BEGIN" in raw:
        return load_pem_private_key(raw.encode(), password=None)
    compact = "".join(raw.split())
    der: bytes | None = None
    try:
        if all(c in "0123456789abcdefABCDEF" for c in compact) and len(compact) % 2 == 0:
            der = bytes.fromhex(compact)
        else:
            der = base64.b64decode(compact)
    except Exception:
        der = None
    if der:
        return load_der_private_key(der, password=None)
    return load_pem_private_key(raw.encode(), password=None)


def _sign_payload(payload: str, creds: dict[str, Any]) -> str:
    alg = (creds.get("signAlg") or "ed25519").lower()
    key = _load_ed25519(str(creds["privateKey"]))
    data = payload.encode("utf-8")
    if alg in {"rsa-sha256", "rsa"}:
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import padding

        sig = key.sign(data, padding.PKCS1v15(), hashes.SHA256())
    else:
        sig = key.sign(data)
    return base64.b64encode(sig).decode("ascii")


async def _sync_server_time(force: bool = False) -> None:
    global _time_offset_ms, _time_synced_at
    now = time.time()
    if not force and now - _time_synced_at < _TIME_SYNC_TTL:
        return
    try:
        async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
            res = await client.get(f"{FUTU_HOST}/api/v1.0/server-time")
            if not res.is_success:
                return
            json = res.json()
        raw = json.get("server_time_ms")
        if raw is None and isinstance(json.get("data"), dict):
            raw = json["data"].get("server_time_ms")
        server_ms = float(raw)
        if server_ms > 0:
            _time_offset_ms = server_ms - (time.time() * 1000)
            _time_synced_at = time.time()
    except Exception:  # noqa: BLE001
        pass


def _now_ms() -> int:
    return int(time.time() * 1000 + _time_offset_ms)


async def _auth_headers(
    method: str,
    path: str,
    query_string: str,
    body: str | None,
    creds: dict[str, Any],
) -> dict[str, str]:
    if creds.get("mode") == "bearer":
        token = str(creds.get("accessToken") or "")
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
    await _sync_server_time()
    timestamp_ms = str(_now_ms())
    nonce = secrets.token_hex(12)
    body_part = (
        hashlib.sha256(body.encode("utf-8")).hexdigest() if body else ""
    )
    payload = "\n".join(
        [timestamp_ms, method.upper(), path, query_string, body_part]
    )
    signature = _sign_payload(payload, creds)
    return {
        "X-Api-Key": str(creds["appKey"]),
        "Authorization": signature,
        "X-Timestamp": timestamp_ms,
        "X-Nonce": nonce,
        "Content-Type": "application/json",
    }


async def _futu_raw(
    method: str,
    path: str,
    *,
    query: dict[str, Any] | None = None,
    body: Any | None = None,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    creds = _resolve_creds(store)
    if not creds:
        raise RuntimeError("Futu credentials not configured")

    entries = [
        (k, v)
        for k, v in (query or {}).items()
        if v is not None and v != ""
    ]
    query_string = "&".join(
        f"{quote(str(k), safe='')}={quote(str(v), safe='')}" for k, v in entries
    )
    body_str = None if body is None else (
        body if isinstance(body, str) else __import__("json").dumps(body, separators=(",", ":"))
    )
    url = f"{FUTU_HOST}{path}" + (f"?{query_string}" if query_string else "")
    headers = await _auth_headers(method, path, query_string, body_str, creds)

    async with httpx.AsyncClient(trust_env=False, timeout=20.0) as client:
        res = await client.request(method.upper(), url, headers=headers, content=body_str)

    if res.status_code in {401} or "-12006" in res.text:
        await _sync_server_time(force=True)
    if not res.is_success:
        raise RuntimeError(f"Futu HTTP {res.status_code}: {res.text[:200]}")

    payload = res.json()
    ret = payload.get("ret_code", payload.get("code"))
    if ret is not None and ret != 0:
        if ret == -12006:
            await _sync_server_time(force=True)
        raise RuntimeError(
            f"Futu {ret}: {payload.get('ret_msg') or payload.get('message') or 'request failed'}"
        )
    if "data" not in payload:
        raise RuntimeError("Futu empty response")
    return payload


async def futu_request(
    method: str,
    path: str,
    *,
    query: dict[str, Any] | None = None,
    body: Any | None = None,
    store: dict[str, Any] | None = None,
) -> Any:
    payload = await _futu_raw(method, path, query=query, body=body, store=store)
    return payload["data"]


async def futu_request_page(
    method: str,
    path: str,
    *,
    query: dict[str, Any] | None = None,
    body: Any | None = None,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Like futu_request, plus pagination fields from the envelope."""
    payload = await _futu_raw(method, path, query=query, body=body, store=store)
    pagination = payload.get("pagination") or {}
    return {
        "data": payload["data"],
        "hasMore": bool(pagination.get("has_more")),
        "nextKey": pagination.get("next_key"),
        "total": pagination.get("total"),
    }
