from __future__ import annotations

import json
import logging
from typing import Any

from app.core.errors import AppError
from app.core.redis_client import cache_get, cache_set
from app.services.market import longbridge, providers
from app.services.market.router import list_providers_for
from app.services.market.symbols import normalize_symbol

log = logging.getLogger(__name__)


def _normalize_quote(quote: dict[str, Any]) -> dict[str, Any]:
    """Frontend Quote uses `percentChange`; keep `changePercent` as alias."""
    pct = quote.get("percentChange")
    if pct is None:
        pct = quote.get("changePercent")
    try:
        pct_f = float(pct) if pct is not None else 0.0
    except (TypeError, ValueError):
        pct_f = 0.0
    quote["percentChange"] = pct_f
    quote["changePercent"] = pct_f
    return quote


async def get_quote(
    symbol: str,
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    sym = normalize_symbol(symbol, asset_type)
    cache_key = f"mkt:q:{asset_type}:{sym}"
    cached = await cache_get(cache_key)
    if cached:
        return _normalize_quote(json.loads(cached))

    errors: list[str] = []
    for pid in list_providers_for(asset_type, store):
        try:
            if pid == "longbridge":
                quote = await longbridge.lb_quote(store, sym, asset_type)
            elif pid == "finnhub":
                quote = await providers.finnhub_quote(sym)
                quote["assetType"] = asset_type
            elif pid == "binance":
                quote = await providers.binance_quote(sym)
            else:
                continue
            quote = _normalize_quote(quote)
            await cache_set(cache_key, json.dumps(quote), 15 if asset_type == "crypto" else 20)
            return quote
        except Exception as exc:  # noqa: BLE001
            msg = str(exc)
            errors.append(f"{pid}: {msg}")
            log.warning("[market] quote via %s failed: %s", pid, msg)

    raise AppError(
        errors[0] if errors else "No market data providers",
        code="NO_CREDENTIALS" if any("not configured" in e.lower() for e in errors) else "UPSTREAM",
        status_code=503 if any("not configured" in e.lower() for e in errors) else 502,
    )


async def get_quotes(
    items: list[dict[str, str]],
    *,
    store: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for item in items[:80]:
        try:
            out.append(await get_quote(item["symbol"], item["assetType"], store=store))
        except Exception:  # noqa: BLE001
            continue
    return out


async def get_candles(
    symbol: str,
    asset_type: str,
    *,
    resolution: str = "D",
    frm: int,
    to: int,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    sym = normalize_symbol(symbol, asset_type)
    cache_key = f"mkt:cndl:{asset_type}:{sym}:{resolution}:{frm}:{to}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    errors: list[str] = []
    for pid in list_providers_for(asset_type, store):
        try:
            if pid == "longbridge":
                candles = await longbridge.lb_candles(
                    store, sym, asset_type, resolution=resolution, frm=frm, to=to
                )
                source = "longbridge"
            elif pid == "finnhub":
                candles = await providers.finnhub_candles(
                    sym, resolution=resolution, frm=frm, to=to
                )
                source = "finnhub"
            elif pid == "binance":
                candles = await providers.binance_candles(
                    sym, interval=resolution, frm=frm, to=to
                )
                source = "binance"
            else:
                continue
            payload = {"candles": candles, "source": source, "symbol": sym, "assetType": asset_type}
            await cache_set(cache_key, json.dumps(payload), 60)
            return payload
        except Exception as exc:  # noqa: BLE001
            msg = str(exc)
            errors.append(f"{pid}: {msg}")
            log.warning("[market] candles via %s failed: %s", pid, msg)

    raise AppError(
        errors[0] if errors else "No market data providers",
        code="UPSTREAM",
        status_code=502,
    )


async def search_symbols(
    q: str,
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    query = q.strip()
    if len(query) < 1:
        return []
    cache_key = f"mkt:search:{asset_type}:{query.lower()}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    errors: list[str] = []
    for pid in list_providers_for(asset_type, store):
        try:
            if pid == "longbridge":
                results = await longbridge.lb_search(query, asset_type)
            elif pid == "finnhub":
                results = await providers.finnhub_search(query)
                for r in results:
                    r["assetType"] = asset_type
            elif pid == "binance":
                results = await providers.binance_search(query)
            else:
                continue
            await cache_set(cache_key, json.dumps(results), 120)
            return results
        except Exception as exc:  # noqa: BLE001
            msg = str(exc)
            errors.append(f"{pid}: {msg}")
            log.warning("[market] search via %s failed: %s", pid, msg)

    return []
