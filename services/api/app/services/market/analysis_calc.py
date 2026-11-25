"""Analysis board calc enrich: LB indexes + Futu snapshot + capped candle periods."""

from __future__ import annotations

import asyncio
import json
import logging
import math
import time
from datetime import datetime, timezone
from typing import Any

from app.core.redis_client import cache_get, cache_set
from app.services.market.creds_resolve import resolve_longbridge_creds
from app.services.market.futu_http import futu_configured, futu_request
from app.services.market.longbridge import longport_available
from app.services.market.symbols import (
    normalize_symbol,
    to_futu_symbol,
    to_longbridge_symbol,
)

log = logging.getLogger(__name__)

PERIOD_BUDGET_S = 5.0
SNAPSHOT_CHUNK = 24
MAX_SYMBOLS = 48
PERIOD_MAX_SYMBOLS = 12
PERIOD_CONCURRENCY = 2
LOOKBACK_S = 400 * 24 * 3600

ENRICH_KEYS = (
    "marketCap",
    "turnoverRate",
    "amplitude",
    "volumeRatio",
    "changeSpeed",
    "change5d",
    "change10d",
    "change20d",
    "change60d",
    "change120d",
    "change250d",
    "changeYtd",
)

PERIODS = (
    ("change5d", 5),
    ("change10d", 10),
    ("change20d", 20),
    ("change60d", 60),
    ("change120d", 120),
    ("change250d", 250),
)


def _opt_float(v: Any) -> float | None:
    if v is None or v == "":
        return None
    if hasattr(v, "to_number"):
        try:
            n = float(v.to_number())
        except Exception:  # noqa: BLE001
            return None
    else:
        try:
            n = float(v)
        except (TypeError, ValueError):
            return None
    return n if math.isfinite(n) else None


def _as_pct(v: Any) -> float | None:
    n = _opt_float(v)
    if n is None:
        return None
    return n * 100 if abs(n) <= 1.5 else n


def _positive(v: Any) -> float | None:
    n = _opt_float(v)
    return n if n is not None and n > 0 else None


def _trim(symbols: list[str], limit: int) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for s in symbols:
        t = (s or "").strip()
        if not t:
            continue
        key = t.upper()
        if key in seen:
            continue
        seen.add(key)
        out.append(t)
        if len(out) >= limit:
            break
    return out


def _merge_row(base: dict[str, Any], extra: dict[str, Any] | None) -> dict[str, Any]:
    if not extra:
        return base
    out = dict(base)
    for k in ENRICH_KEYS:
        if out.get(k) is None and extra.get(k) is not None:
            out[k] = extra[k]
    return out


def merge_calc_rows(
    symbols: list[str],
    asset_type: str,
    layers: list[list[dict[str, Any]]],
) -> list[dict[str, Any]]:
    by_local: dict[str, dict[str, Any]] = {}
    for layer in layers:
        for row in layer:
            key = str(row.get("localSymbol") or "").upper()
            if not key:
                continue
            prev = by_local.get(key)
            by_local[key] = _merge_row(prev, row) if prev else dict(row)
    result: list[dict[str, Any]] = []
    for raw in symbols:
        local = normalize_symbol(raw, asset_type).upper()
        result.append(
            by_local.get(local)
            or {"symbol": raw, "localSymbol": local}
        )
    return result


def _calc_indexes_sync(
    creds: dict[str, Any],
    trimmed: list[str],
    asset_type: str,
) -> list[dict[str, Any]]:
    from longport.openapi import CalcIndex

    from app.services.market.longbridge import _build_quote_ctx

    ctx = _build_quote_ctx(creds)
    lb_symbols = [to_longbridge_symbol(s, asset_type) for s in trimmed]
    indexes = [
        CalcIndex.YtdChangeRate,
        CalcIndex.TurnoverRate,
        CalcIndex.TotalMarketValue,
        CalcIndex.Amplitude,
        CalcIndex.VolumeRatio,
        CalcIndex.FiveDayChangeRate,
        CalcIndex.TenDayChangeRate,
        CalcIndex.HalfYearChangeRate,
        CalcIndex.FiveMinutesChangeRate,
    ]
    rows = ctx.calc_indexes(lb_symbols, indexes)
    out: list[dict[str, Any]] = []
    for idx, r in enumerate(rows or []):
        symbol = str(getattr(r, "symbol", None) or lb_symbols[idx] or "")
        local = normalize_symbol(trimmed[idx] if idx < len(trimmed) else symbol, asset_type).upper()
        row: dict[str, Any] = {"symbol": symbol, "localSymbol": local}
        market_cap = _opt_float(getattr(r, "total_market_value", None))
        if market_cap is not None and market_cap > 0:
            row["marketCap"] = market_cap
        for src, dst, fn in (
            ("turnover_rate", "turnoverRate", _as_pct),
            ("amplitude", "amplitude", _as_pct),
            ("volume_ratio", "volumeRatio", _opt_float),
            ("five_minutes_change_rate", "changeSpeed", _as_pct),
            ("five_day_change_rate", "change5d", _as_pct),
            ("ten_day_change_rate", "change10d", _as_pct),
            ("half_year_change_rate", "change120d", _as_pct),
            ("ytd_change_rate", "changeYtd", _as_pct),
        ):
            val = fn(getattr(r, src, None))
            if val is not None:
                row[dst] = val
        out.append(row)
    return out


async def get_longbridge_calc_indexes(
    symbols: list[str],
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    if asset_type == "crypto" or not longport_available():
        return []
    creds = resolve_longbridge_creds(store)
    if not creds:
        return []
    trimmed = _trim(symbols, MAX_SYMBOLS)
    if not trimmed:
        return []
    lb_symbols = [to_longbridge_symbol(s, asset_type) for s in trimmed]
    cache_key = f"lb:calc:v2:{asset_type}:{','.join(lb_symbols)}"
    cached = await cache_get(cache_key)
    if cached:
        try:
            parsed = json.loads(cached)
            if isinstance(parsed, list):
                return parsed
        except Exception:  # noqa: BLE001
            pass
    try:
        rows = await asyncio.wait_for(
            asyncio.to_thread(_calc_indexes_sync, creds, trimmed, asset_type),
            timeout=20.0,
        )
        await cache_set(cache_key, json.dumps(rows), 60)
        return rows
    except Exception as exc:  # noqa: BLE001
        log.warning("[longbridge-calc] %s", exc)
        return []


async def get_futu_calc_snapshots(
    symbols: list[str],
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    if asset_type == "crypto" or not futu_configured(store):
        return []
    trimmed = _trim(symbols, MAX_SYMBOLS)
    if not trimmed:
        return []
    codes = [to_futu_symbol(s, asset_type) for s in trimmed]
    cache_key = f"futu:calc-snap:v1:{asset_type}:{','.join(codes)}"
    cached = await cache_get(cache_key)
    if cached:
        try:
            parsed = json.loads(cached)
            if isinstance(parsed, list):
                return parsed
        except Exception:  # noqa: BLE001
            pass

    by_code: dict[str, dict[str, Any]] = {}
    for i in range(0, len(codes), SNAPSHOT_CHUNK):
        chunk = codes[i : i + SNAPSHOT_CHUNK]
        try:
            data = await futu_request(
                "POST",
                "/api/v1.0/quote/snapshot",
                body={"code_list": chunk},
                store=store,
            )
            for row in data.get("snapshot_list") or []:
                code = row.get("code")
                if code:
                    by_code[str(code)] = row
        except Exception as exc:  # noqa: BLE001
            log.warning("[futu-calc-snapshot] failed: %s", exc)

    out: list[dict[str, Any]] = []
    for idx, raw in enumerate(trimmed):
        code = codes[idx]
        snap = by_code.get(code) or {}
        local = normalize_symbol(raw, asset_type).upper()
        price = _positive(snap.get("last_price"))
        prev = _positive(snap.get("prev_close_price"))
        five_min = _positive(snap.get("close_price_5min"))
        high = _positive(snap.get("high_price"))
        low = _positive(snap.get("low_price"))
        turnover_rate = _opt_float(snap.get("turnover_rate"))
        volume_ratio = _opt_float(snap.get("volume_ratio"))
        market_cap = _positive(snap.get("total_market_val"))
        amplitude = _opt_float(snap.get("amplitude"))
        if amplitude is None and prev and high and low and high != low:
            amplitude = ((high - low) / prev) * 100
        change_speed = None
        if price is not None and five_min is not None:
            change_speed = ((price - five_min) / five_min) * 100
        row: dict[str, Any] = {"symbol": code, "localSymbol": local}
        if market_cap is not None:
            row["marketCap"] = market_cap
        if turnover_rate is not None:
            row["turnoverRate"] = turnover_rate
        if amplitude is not None:
            row["amplitude"] = amplitude
        if volume_ratio is not None:
            row["volumeRatio"] = volume_ratio
        if change_speed is not None:
            row["changeSpeed"] = change_speed
        out.append(row)

    await cache_set(cache_key, json.dumps(out), 60)
    return out


def _pct_from_bars(bars: list[dict[str, Any]], trading_days: int) -> float | None:
    if len(bars) < trading_days + 1:
        return None
    last = bars[-1]
    base = bars[-1 - trading_days]
    try:
        last_c = float(last.get("close") or 0)
        base_c = float(base.get("close") or 0)
    except (TypeError, ValueError):
        return None
    if base_c <= 0 or not math.isfinite(last_c):
        return None
    return ((last_c - base_c) / base_c) * 100


def _ytd_pct(bars: list[dict[str, Any]]) -> float | None:
    if len(bars) < 2:
        return None
    last = bars[-1]
    try:
        last_t = int(last.get("time") or 0)
        last_c = float(last.get("close") or 0)
    except (TypeError, ValueError):
        return None
    y = datetime.fromtimestamp(last_t, tz=timezone.utc).year
    prior = None
    for b in reversed(bars):
        try:
            t = int(b.get("time") or 0)
        except (TypeError, ValueError):
            continue
        if datetime.fromtimestamp(t, tz=timezone.utc).year < y:
            prior = b
            break
    anchor = prior
    if anchor is None:
        for b in bars:
            try:
                t = int(b.get("time") or 0)
            except (TypeError, ValueError):
                continue
            if datetime.fromtimestamp(t, tz=timezone.utc).year == y:
                anchor = b
                break
    if not anchor:
        return None
    try:
        ac = float(anchor.get("close") or 0)
    except (TypeError, ValueError):
        return None
    if ac <= 0 or not math.isfinite(last_c):
        return None
    return ((last_c - ac) / ac) * 100


async def _period_one(
    raw: str,
    asset_type: str,
    frm: int,
    to: int,
    *,
    store: dict[str, Any] | None,
) -> dict[str, Any]:
    from app.services.market.facade import get_candles

    local = normalize_symbol(raw, asset_type).upper()
    cache_key = f"analysis:period:v2:{asset_type}:{local}"
    cached = await cache_get(cache_key)
    if cached:
        try:
            parsed = json.loads(cached)
            if isinstance(parsed, dict):
                return parsed
        except Exception:  # noqa: BLE001
            pass
    row: dict[str, Any] = {"symbol": raw, "localSymbol": local}
    try:
        payload = await get_candles(
            raw, asset_type, resolution="D", frm=frm, to=to, store=store
        )
        bars = list(payload.get("bars") or [])
        bars.sort(key=lambda b: int(b.get("time") or 0))
        for key, days in PERIODS:
            pct = _pct_from_bars(bars, days)
            if pct is not None:
                row[key] = pct
        ytd = _ytd_pct(bars)
        if ytd is not None:
            row["changeYtd"] = ytd
        await cache_set(cache_key, json.dumps(row), 15 * 60)
    except Exception as exc:  # noqa: BLE001
        log.warning("[analysis-period] %s: %s", local, exc)
    return row


async def get_period_returns_from_candles(
    symbols: list[str],
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    if asset_type == "crypto":
        return []
    trimmed = _trim(symbols, PERIOD_MAX_SYMBOLS)
    if not trimmed:
        return []
    now = int(time.time())
    frm = now - LOOKBACK_S
    sem = asyncio.Semaphore(PERIOD_CONCURRENCY)

    async def one(sym: str) -> dict[str, Any]:
        async with sem:
            return await _period_one(sym, asset_type, frm, now, store=store)

    return list(await asyncio.gather(*[one(s) for s in trimmed]))


async def get_analysis_calc_enrich(
    symbols: list[str],
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    trimmed = _trim(symbols, MAX_SYMBOLS)
    if not trimmed or asset_type == "crypto":
        return []

    async def soft(label: str, coro: Any, fallback: list) -> list:
        try:
            return await coro
        except Exception as exc:  # noqa: BLE001
            log.warning("[analysis-calc] %s: %s", label, exc)
            return fallback

    lb_t = asyncio.create_task(
        soft("lb", get_longbridge_calc_indexes(trimmed, asset_type, store=store), [])
    )
    futu_t = asyncio.create_task(
        soft("futu", get_futu_calc_snapshots(trimmed, asset_type, store=store), [])
    )
    lb, futu = await asyncio.gather(lb_t, futu_t)

    try:
        periods = await asyncio.wait_for(
            soft(
                "periods",
                get_period_returns_from_candles(trimmed, asset_type, store=store),
                [],
            ),
            timeout=PERIOD_BUDGET_S,
        )
    except asyncio.TimeoutError:
        periods = []

    return merge_calc_rows(trimmed, asset_type, [lb, futu, periods])
