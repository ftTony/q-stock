"""Load / status for encrypted user market (BYOK) credentials."""

from __future__ import annotations

import logging
import os
import time
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.secret_box import decrypt_json
from app.core.settings import get_settings
from app.models.user import User, UserMarketCredential

log = logging.getLogger(__name__)

CACHE_TTL_S = 60
_CACHE_MAX = 200
_cache: dict[str, tuple[dict[str, Any], float]] = {}


def invalidate_user_market_creds_cache(user_id: str) -> None:
    _cache.pop(user_id, None)


def _trim_cache() -> None:
    now = time.time()
    expired = [k for k, (_, exp) in _cache.items() if exp <= now]
    for k in expired:
        _cache.pop(k, None)
    while len(_cache) > _CACHE_MAX:
        _cache.pop(next(iter(_cache)), None)


def _parse_longbridge(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    mode = str(raw.get("mode") or "").lower()
    if mode == "bearer":
        access_token = str(raw.get("accessToken") or "").strip()
        if not access_token:
            return None
        out: dict[str, Any] = {"mode": "bearer", "accessToken": access_token}
        refresh = str(raw.get("refreshToken") or "").strip()
        if refresh:
            out["refreshToken"] = refresh
        expires_at = raw.get("expiresAt")
        if isinstance(expires_at, (int, float)) and expires_at > 0:
            out["expiresAt"] = expires_at
        return out
    app_key = str(raw.get("appKey") or "").strip()
    app_secret = str(raw.get("appSecret") or "").strip()
    access_token = str(raw.get("accessToken") or "").strip()
    if not app_key or not app_secret or not access_token:
        return None
    return {
        "mode": "appkey",
        "appKey": app_key,
        "appSecret": app_secret,
        "accessToken": access_token,
    }


def _parse_futu(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    mode = str(raw.get("mode") or "").lower()
    if mode == "bearer":
        access_token = str(raw.get("accessToken") or "").strip()
        if not access_token:
            return None
        out: dict[str, Any] = {"mode": "bearer", "accessToken": access_token}
        refresh = str(raw.get("refreshToken") or "").strip()
        if refresh:
            out["refreshToken"] = refresh
        expires_at = raw.get("expiresAt")
        if isinstance(expires_at, (int, float)) and expires_at > 0:
            out["expiresAt"] = expires_at
        return out
    if mode == "appkey":
        app_key = str(raw.get("appKey") or "").strip()
        private_key = str(raw.get("privateKey") or "").strip()
        if not app_key or not private_key:
            return None
        out = {"mode": "appkey", "appKey": app_key, "privateKey": private_key}
        sign_alg = str(raw.get("signAlg") or "").strip()
        if sign_alg:
            out["signAlg"] = sign_alg
        return out
    return None


def _parse_binance(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    api_key = str(raw.get("apiKey") or "").strip()
    if not api_key:
        return None
    secret = str(raw.get("apiSecret") or "").strip() or None
    return {"apiKey": api_key, "apiSecret": secret}


def _parse_okx(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    api_key = str(raw.get("apiKey") or "").strip()
    if not api_key:
        return None
    return {
        "apiKey": api_key,
        "apiSecret": str(raw.get("apiSecret") or "").strip() or None,
        "passphrase": str(raw.get("passphrase") or "").strip() or None,
    }


def _parse_fuyao(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    api_key = str(raw.get("apiKey") or "").strip()
    if not api_key:
        return None
    return {"apiKey": api_key}


def _oauth_available(env_key: str) -> bool:
    return bool(os.environ.get(env_key, "").strip())


async def load_user_market_creds(db: AsyncSession, user_id: str) -> dict[str, Any]:
    hit = _cache.get(user_id)
    if hit and hit[1] > time.time():
        return hit[0]

    rows = (
        await db.execute(
            select(UserMarketCredential).where(UserMarketCredential.userId == user_id)
        )
    ).scalars().all()
    user = await db.get(User, user_id)

    store: dict[str, Any] = {
        "userId": user_id,
        "equityVendor": (user.equityVendor if user else None) or "longbridge",
        "cryptoVendor": (user.cryptoVendor if user else None) or "binance",
    }
    parsers = {
        "longbridge": _parse_longbridge,
        "futu": _parse_futu,
        "binance": _parse_binance,
        "okx": _parse_okx,
        "fuyao": _parse_fuyao,
    }
    for row in rows:
        try:
            parsed = decrypt_json(row.payload)
            fn = parsers.get(row.provider)
            if fn:
                value = fn(parsed)
                if value is not None:
                    store[row.provider] = value
        except Exception as exc:
            log.warning("market-creds decrypt failed for %s: %s", row.provider, exc)

    _cache[user_id] = (store, time.time() + CACHE_TTL_S)
    _trim_cache()
    return store


async def get_user_market_creds_status(db: AsyncSession, user_id: str) -> dict[str, Any]:
    store = await load_user_market_creds(db, user_id)
    lb = store.get("longbridge")
    futu = store.get("futu")
    return {
        "longbridge": {
            "configured": bool(lb),
            "mode": (
                "bearer"
                if lb and lb.get("mode") == "bearer"
                else ("appkey" if lb else None)
            ),
            "oauthAvailable": _oauth_available("LONGBRIDGE_OAUTH_CLIENT_ID"),
        },
        "futu": {
            "configured": bool(futu),
            "mode": futu.get("mode") if futu else None,
            "oauthAvailable": _oauth_available("FUTU_OAUTH_CLIENT_ID"),
        },
        "binance": {"configured": bool(store.get("binance"))},
        "okx": {"configured": bool(store.get("okx"))},
        "fuyao": {"configured": bool(store.get("fuyao"))},
        "equityVendor": store.get("equityVendor") or "longbridge",
        "cryptoVendor": store.get("cryptoVendor") or "binance",
    }


def encryption_key_configured() -> bool:
    return bool((get_settings().credentials_encryption_key or "").strip())
