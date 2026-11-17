"""Resolve market credentials: platform env before user BYOK."""

from __future__ import annotations

import os
from typing import Any


def env_longbridge_creds() -> dict[str, Any] | None:
    app_key = os.environ.get("LONGBRIDGE_APP_KEY", "").strip()
    app_secret = os.environ.get("LONGBRIDGE_APP_SECRET", "").strip()
    access_token = os.environ.get("LONGBRIDGE_ACCESS_TOKEN", "").strip()
    if not app_key or not app_secret or not access_token:
        return None
    return {
        "mode": "appkey",
        "appKey": app_key,
        "appSecret": app_secret,
        "accessToken": access_token,
    }


def env_finnhub_key() -> str | None:
    key = os.environ.get("FINNHUB_API_KEY", "").strip()
    return key or None


def env_binance_creds() -> dict[str, Any] | None:
    api_key = os.environ.get("BINANCE_API_KEY", "").strip()
    if not api_key:
        # Public market data works without keys
        return {"apiKey": None, "apiSecret": None, "public": True}
    return {
        "apiKey": api_key,
        "apiSecret": os.environ.get("BINANCE_API_SECRET", "").strip() or None,
    }


def resolve_longbridge_creds(store: dict[str, Any] | None) -> dict[str, Any] | None:
    """Env platform keys first, then user BYOK (appkey preferred)."""
    env = env_longbridge_creds()
    if env:
        return env
    if not store:
        return None
    user = store.get("longbridge")
    if isinstance(user, dict) and user.get("mode") == "appkey":
        if user.get("appKey") and user.get("appSecret") and user.get("accessToken"):
            return user
    return None


def resolve_equity_vendor(store: dict[str, Any] | None) -> str:
    if store and store.get("equityVendor") in {"longbridge", "futu"}:
        return str(store["equityVendor"])
    return "longbridge"


def resolve_crypto_vendor(store: dict[str, Any] | None) -> str:
    if store and store.get("cryptoVendor") in {"binance", "okx"}:
        return str(store["cryptoVendor"])
    return "binance"
