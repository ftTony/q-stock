"""Provider enablement + failover order (parity with src/lib/market/router.ts)."""

from __future__ import annotations

import os
from typing import Any

from app.core.settings import get_settings
from app.services.market.creds_resolve import (
    env_finnhub_key,
    env_longbridge_creds,
    resolve_crypto_vendor,
    resolve_equity_vendor,
    resolve_longbridge_creds,
)

KNOWN = ("longbridge", "futu", "finnhub", "binance", "okx", "fuyao")


def _env_provider_list() -> list[str] | None:
    raw = (get_settings().market_data_providers or os.environ.get("MARKET_DATA_PROVIDERS") or "").strip()
    if not raw:
        return None
    out: list[str] = []
    for part in raw.split(","):
        pid = part.strip().lower()
        if pid in KNOWN:
            out.append(pid)
    return out or None


def is_provider_enabled(provider_id: str) -> bool:
    if provider_id == "fuyao":
        return False
    allowed = _env_provider_list()
    if not allowed:
        return True
    return provider_id in allowed


def longbridge_configured(store: dict[str, Any] | None) -> bool:
    return resolve_longbridge_creds(store) is not None or env_longbridge_creds() is not None


def finnhub_configured() -> bool:
    from app.core.settings import get_settings

    return bool(get_settings().finnhub_api_key.strip() or env_finnhub_key())


def futu_configured(store: dict[str, Any] | None = None) -> bool:
    from app.services.market.futu_http import futu_configured as _fc

    return _fc(store)


def list_equity_providers(store: dict[str, Any] | None) -> list[str]:
    """Ordered equity hops: preferred broker (env/BYOK) then Finnhub.

    Note: quote facade currently implements longbridge/finnhub/binance;
    futu appears here for industry/content readiness when creds exist.
    """
    preferred = resolve_equity_vendor(store)
    ordered: list[str] = []
    if preferred == "futu":
        ordered.extend(["futu", "longbridge", "finnhub"])
    else:
        ordered.extend(["longbridge", "futu", "finnhub"])

    out: list[str] = []
    for pid in ordered:
        if not is_provider_enabled(pid):
            continue
        if pid == "longbridge" and not longbridge_configured(store):
            continue
        if pid == "futu" and not futu_configured(store):
            continue
        if pid == "finnhub" and not finnhub_configured():
            continue
        if pid not in out:
            out.append(pid)
    return out


def list_crypto_providers(store: dict[str, Any] | None) -> list[str]:
    primary = resolve_crypto_vendor(store)
    secondary = "okx" if primary == "binance" else "binance"
    ordered = [primary, secondary, "finnhub"]
    out: list[str] = []
    for pid in ordered:
        if not is_provider_enabled(pid):
            continue
        if pid == "okx":
            continue  # not implemented yet
        if pid == "finnhub" and not finnhub_configured():
            continue
        if pid == "binance" or pid == "finnhub":
            if pid not in out:
                out.append(pid)
    return out or ["binance"]


def list_providers_for(asset_type: str, store: dict[str, Any] | None) -> list[str]:
    if asset_type == "crypto":
        return list_crypto_providers(store)
    if asset_type in {"stock", "hk", "cn"}:
        return list_equity_providers(store)
    return list_equity_providers(store)


def provider_status(store: dict[str, Any] | None = None) -> dict[str, bool]:
    return {
        "finnhub": finnhub_configured(),
        "binance": is_provider_enabled("binance"),
        "longbridge": is_provider_enabled("longbridge") and longbridge_configured(store),
        "futu": is_provider_enabled("futu") and futu_configured(store),
        "fuyao": False,
    }
