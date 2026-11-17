"""ADVANCED_QUOTES_ENABLED gate (parity with src/lib/market/advanced-quotes.ts)."""

from __future__ import annotations

import os
from typing import Any

from app.services.market.creds_resolve import resolve_longbridge_creds


ADVANCED_QUOTES_REQUIRED = "ADVANCED_QUOTES_REQUIRED"


def _env_futu_creds() -> dict[str, Any] | None:
    app_key = os.environ.get("FUTU_APP_KEY", "").strip()
    app_id = os.environ.get("FUTU_APP_ID", "").strip() or app_key
    app_secret = os.environ.get("FUTU_APP_SECRET", "").strip()
    access_token = os.environ.get("FUTU_ACCESS_TOKEN", "").strip()
    if app_id and app_secret and access_token:
        return {
            "mode": "appkey",
            "appId": app_id,
            "appSecret": app_secret,
            "accessToken": access_token,
        }
    return None


def resolve_futu_creds(store: dict[str, Any] | None) -> dict[str, Any] | None:
    env = _env_futu_creds()
    if env:
        return env
    if not store:
        return None
    user = store.get("futu")
    if isinstance(user, dict) and user.get("mode") in {"appkey", "oauth", "bearer"}:
        if user.get("accessToken") or (user.get("appKey") and user.get("appSecret")):
            return user
    return None


def can_use_advanced_quotes(store: dict[str, Any] | None = None) -> bool:
    raw = (os.environ.get("ADVANCED_QUOTES_ENABLED") or "").strip().lower()
    if raw in {"0", "false", "off", "no"}:
        return False
    has_broker = bool(resolve_longbridge_creds(store) or resolve_futu_creds(store))
    if raw in {"1", "true", "yes", "on"}:
        return has_broker
    return has_broker
