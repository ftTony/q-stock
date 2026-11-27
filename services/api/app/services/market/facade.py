from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from app.core.errors import AppError
from app.core.redis_client import cache_get, cache_set
from app.services.market import longbridge, providers
from app.services.market.futu_market import futu_candles, futu_quote
from app.services.market.router import list_providers_for
from app.services.market.symbols import normalize_symbol

log = logging.getLogger(__name__)
US_EASTERN = ZoneInfo("America/New_York")


def _filter_us_regular_session_bars(
    bars: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    regular: list[dict[str, Any]] = []
    for bar in bars:
        local_time = datetime.fromtimestamp(int(bar["time"]), US_EASTERN)
        minute = local_time.hour * 60 + local_time.minute
        if local_time.weekday() < 5 and 570 <= minute < 960:
            regular.append(bar)
    return regular


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
    # v2: include US pre/post/overnight fields for watchlist second line.
    cache_key = f"mkt:q:v2:{asset_type}:{sym}"
    cached = await cache_get(cache_key)
    if cached:
        return _normalize_quote(json.loads(cached))

    errors: list[str] = []
    for pid in list_providers_for(asset_type, store):
        try:
            if pid == "longbridge":
                quote = await longbridge.lb_quote(store, sym, asset_type)
            elif pid == "futu":
                quote = await futu_quote(sym, asset_type, store=store)
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
    extended_hours: bool = False,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    sym = normalize_symbol(symbol, asset_type)
    include_extended_hours = (
        extended_hours and asset_type == "stock" and resolution in {"T", "1", "5"}
    )
    # v2: response field is `bars` (frontend contract); bump key to drop `candles` cache.
    session = "all" if include_extended_hours else "regular"
    cache_key = f"mkt:cndl:v2:{asset_type}:{sym}:{resolution}:{session}:{frm}:{to}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    errors: list[str] = []
    for pid in list_providers_for(asset_type, store):
        try:
            if pid == "longbridge":
                candles = await longbridge.lb_candles(
                    store,
                    sym,
                    asset_type,
                    resolution=resolution,
                    frm=frm,
                    to=to,
                    extended_hours=include_extended_hours,
                )
                source = "longbridge"
            elif pid == "futu":
                candles = await futu_candles(
                    sym,
                    asset_type,
                    resolution=resolution,
                    frm=frm,
                    to=to,
                    store=store,
                )
                source = "futu"
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
            if (
                not include_extended_hours
                and asset_type == "stock"
                and resolution in {"T", "1", "5"}
            ):
                candles = _filter_us_regular_session_bars(candles)
            if not candles:
                raise RuntimeError(f"{source} returned empty candles")
            # Frontend / docs expect `bars` (+ hasMore), not `candles`.
            payload = {
                "bars": candles,
                "hasMore": True,
                "resolution": resolution,
                "from": frm,
                "to": to,
                "source": source,
                "symbol": sym,
                "assetType": asset_type,
            }
            await cache_set(cache_key, json.dumps(payload), 60)
            return payload
        except Exception as exc:  # noqa: BLE001
            msg = str(exc)
            errors.append(f"{pid}: {msg}")
            log.warning("[market] candles via %s failed: %s", pid, msg)

    raise AppError(
        " | ".join(errors) if errors else "No market data providers",
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
