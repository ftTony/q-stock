"""Advanced market data with soft degrade (never hang)."""

from __future__ import annotations

import logging
from typing import Any

from app.services.market import longbridge

log = logging.getLogger(__name__)


async def get_depth(
    symbol: str,
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
    levels: int = 10,
) -> dict[str, Any]:
    if asset_type == "crypto":
        return {"bids": [], "asks": [], "unavailable": True, "degraded": True}
    try:
        book = await longbridge.lb_depth(store, symbol, asset_type, levels)
        return book
    except Exception as exc:  # noqa: BLE001
        log.warning("[depth] %s", exc)
        return {
            "bids": [],
            "asks": [],
            "unavailable": True,
            "degraded": True,
            "detail": str(exc),
        }


async def get_trades(
    symbol: str,
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
    count: int = 50,
) -> dict[str, Any]:
    if asset_type == "crypto":
        return {"trades": [], "unavailable": True, "degraded": True}
    try:
        trades = await longbridge.lb_trades(store, symbol, asset_type, count)
        return {"trades": trades}
    except Exception as exc:  # noqa: BLE001
        log.warning("[trades] %s", exc)
        return {
            "trades": [],
            "unavailable": True,
            "degraded": True,
            "detail": str(exc),
        }


async def get_capital(
    symbol: str,
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if asset_type == "crypto":
        return {"unavailable": True, "degraded": True}
    try:
        data = await longbridge.lb_capital(store, symbol, asset_type)
        return {**data, "source": "longbridge"}
    except Exception as exc:  # noqa: BLE001
        log.warning("[capital] %s", exc)
        return {"unavailable": True, "degraded": True, "detail": str(exc)}


async def get_short(
    symbol: str,
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
    count: int = 30,
) -> dict[str, Any]:
    if asset_type in {"crypto", "cn"}:
        return {"rows": [], "unavailable": True, "degraded": True}
    try:
        rows = await longbridge.lb_short(store, symbol, asset_type, count)
        return {"rows": rows[: min(60, count)]}
    except Exception as exc:  # noqa: BLE001
        log.warning("[short] %s", exc)
        return {
            "rows": [],
            "unavailable": True,
            "degraded": True,
            "detail": str(exc),
        }


async def get_options(
    symbol: str,
    asset_type: str,
    *,
    expiry: str | None = None,
    spot: float = 0,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    _ = spot
    if asset_type not in {"stock", "hk"}:
        return {"unavailable": True, "degraded": True}

    from app.services.market.futu_http import futu_configured
    from app.services.market.futu_market import (
        futu_option_chain,
        futu_option_expiries,
        futu_option_stats,
    )

    if not futu_configured(store):
        return {
            "unavailable": True,
            "degraded": True,
            "detail": "Futu credentials not configured for option chain",
        }

    try:
        if not expiry:
            expiries = await futu_option_expiries(symbol, asset_type, store=store)
            stats = None
            try:
                stats = await futu_option_stats(symbol, asset_type, store=store)
            except Exception as exc:  # noqa: BLE001
                log.warning("[options] futu stats: %s", exc)
            return {"expiries": expiries, "stats": stats, "source": "futu"}
        return await futu_option_chain(symbol, asset_type, expiry, store=store)
    except Exception as exc:  # noqa: BLE001
        msg = str(exc)
        log.warning("[options] futu failed: %s", msg)
        return {"unavailable": True, "degraded": True, "detail": f"futu: {msg}"}


async def get_warrants(
    symbol: str,
    asset_type: str,
    *,
    types: list[str] | None = None,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    _ = (symbol, types, store)
    if asset_type != "hk":
        return {"unavailable": True, "degraded": True}
    return {
        "unavailable": True,
        "degraded": True,
        "detail": "warrants soft-degraded on FastAPI",
    }
