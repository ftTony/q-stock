"""Futu OpenAPI: history klines + US/HK option chain (parity with TS futu.ts / futu-options)."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

from app.services.market.futu_http import futu_configured, futu_request
from app.services.market.symbols import normalize_symbol, to_futu_symbol

log = logging.getLogger(__name__)

KLINE_PAGE_SIZE = 370
KLINE_MAX_PAGES = 20

# Futu ktype: 1=1m, 6=5m, 2=day, 3=week, 4=month
_KTYPE = {"T": 1, "1": 1, "5": 6, "D": 2, "W": 3, "M": 4, "Q": 2, "Y": 2}


def _ms_to_sec(ms: Any) -> int:
    try:
        n = float(ms)
    except (TypeError, ValueError):
        return int(datetime.now(tz=timezone.utc).timestamp())
    if n > 1e12:
        return int(n // 1000)
    return int(n)


def _ymd(unix_sec: int) -> str:
    return datetime.fromtimestamp(unix_sec, tz=timezone.utc).strftime("%Y-%m-%d")


def _aggregate(bars: list[dict[str, Any]], kind: str) -> list[dict[str, Any]]:
    if not bars or kind not in {"Q", "Y"}:
        return bars
    groups: dict[str, list[dict[str, Any]]] = {}
    for bar in sorted(bars, key=lambda b: b["time"]):
        dt = datetime.fromtimestamp(bar["time"], tz=timezone.utc)
        key = (
            str(dt.year)
            if kind == "Y"
            else f"{dt.year}-Q{dt.month // 3 + 1}"
        )
        groups.setdefault(key, []).append(bar)
    out: list[dict[str, Any]] = []
    for group in groups.values():
        first, last = group[0], group[-1]
        out.append(
            {
                "time": first["time"],
                "open": first["open"],
                "high": max(g["high"] for g in group),
                "low": min(g["low"] for g in group),
                "close": last["close"],
                "volume": sum(g["volume"] for g in group),
            }
        )
    return out


async def futu_candles(
    symbol: str,
    asset_type: str,
    *,
    resolution: str,
    frm: int,
    to: int,
    store: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    if asset_type == "crypto":
        raise RuntimeError("Futu does not support crypto")
    if not futu_configured(store):
        raise RuntimeError("Futu credentials not configured")

    code = to_futu_symbol(normalize_symbol(symbol, asset_type), asset_type)
    ktype = _KTYPE.get(resolution, 2)
    path = f"/api/v1.0/quote/{quote(code, safe='')}/history-kline"
    by_time: dict[int, dict[str, Any]] = {}
    end_ymd = _ymd(to)
    start_ymd = _ymd(frm)

    for _ in range(KLINE_MAX_PAGES):
        data = await futu_request(
            "GET",
            path,
            query={
                "start": start_ymd,
                "end": end_ymd,
                "ktype": ktype,
                "autype": 1,
                "num": KLINE_PAGE_SIZE,
            },
            store=store,
        )
        rows = (data or {}).get("kline_list") or []
        for row in rows:
            t = _ms_to_sec(row.get("time_key"))
            if t < frm or t > to:
                continue
            by_time[t] = {
                "time": t,
                "open": float(row.get("open") or 0),
                "high": float(row.get("high") or 0),
                "low": float(row.get("low") or 0),
                "close": float(row.get("close") or 0),
                "volume": float(row.get("volume") or 0),
            }

        cursor = int((data or {}).get("next_time") or 0)
        more = cursor > 0 and len(rows) >= KLINE_PAGE_SIZE
        if not more:
            break
        next_end = _ymd(_ms_to_sec(cursor))
        if next_end >= end_ymd or next_end < start_ymd:
            break
        end_ymd = next_end

    bars = sorted(by_time.values(), key=lambda b: b["time"])
    if resolution in {"Q", "Y"}:
        bars = _aggregate(bars, resolution)
    if not bars:
        raise RuntimeError(f"Futu returned no klines for {code}")
    return bars


def _num_or_null(v: Any) -> float | None:
    try:
        n = float(v)
    except (TypeError, ValueError):
        return None
    return n if n == n and n > 0 else None


async def futu_option_expiries(
    symbol: str,
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> list[str]:
    if asset_type not in {"stock", "hk"}:
        raise RuntimeError("Futu options are US/HK only")
    if not futu_configured(store):
        raise RuntimeError("Futu credentials not configured")
    code = to_futu_symbol(normalize_symbol(symbol, asset_type), asset_type)
    data = await futu_request(
        "GET",
        f"/api/v1.0/quote/{quote(code, safe='')}/option-expiration",
        store=store,
    )
    out = [
        str(e.get("strike_time") or "").strip()
        for e in (data or {}).get("expiration_list") or []
        if str(e.get("strike_time") or "").strip()
    ]
    out = [d for d in out if len(d) == 10 and d[4] == "-" and d[7] == "-"]
    if not out:
        raise RuntimeError(f"No Futu option expiries for {code}")
    return out[:24]


async def futu_option_stats(
    symbol: str,
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    code = to_futu_symbol(normalize_symbol(symbol, asset_type), asset_type)
    data = await futu_request(
        "GET",
        f"/api/v1.0/quote/{quote(code, safe='')}/option-chain-statistic",
        store=store,
    )
    by_expiry: dict[str, dict[str, Any]] = {}
    for item in (data or {}).get("items") or []:
        ymd = str(item.get("strike_date") or "").strip()
        if len(ymd) != 10:
            continue
        call_v = _num_or_null(item.get("call_volume"))
        put_v = _num_or_null(item.get("put_volume"))
        nxt = {
            "iv": _num_or_null(item.get("iv")),
            "expectedMove": _num_or_null(item.get("expected_move")),
            "callVolume": call_v,
            "putVolume": put_v,
        }
        prev = by_expiry.get(ymd)
        if not prev or ((call_v or 0) + (put_v or 0)) > (
            (prev.get("callVolume") or 0) + (prev.get("putVolume") or 0)
        ):
            by_expiry[ymd] = nxt
    return {
        "underlyingIv": _num_or_null((data or {}).get("underlying_iv")),
        "underlyingHv": _num_or_null((data or {}).get("underlying_hv")),
        "byExpiry": by_expiry,
    }


async def futu_option_chain(
    symbol: str,
    asset_type: str,
    expiry_ymd: str,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if asset_type not in {"stock", "hk"}:
        raise RuntimeError("Futu options are US/HK only")
    if not futu_configured(store):
        raise RuntimeError("Futu credentials not configured")
    if len(expiry_ymd.strip()) != 10:
        raise RuntimeError("Invalid option expiry")

    code = to_futu_symbol(normalize_symbol(symbol, asset_type), asset_type)
    data = await futu_request(
        "GET",
        f"/api/v1.0/quote/{quote(code, safe='')}/option-chain",
        query={"start": expiry_ymd, "end": expiry_ymd},
        store=store,
    )
    contracts = [
        c
        for c in (data or {}).get("option_chain") or []
        if c.get("code") and float(c.get("strike_price") or 0) > 0
    ]
    if not contracts:
        raise RuntimeError(f"No Futu option contracts for {code} @ {expiry_ymd}")

    calls_raw: list[dict[str, Any]] = []
    puts_raw: list[dict[str, Any]] = []
    for c in contracts:
        strike = float(c.get("strike_price") or 0)
        side = "put" if str(c.get("option_type") or "").upper() == "PUT" else "call"
        row = {"symbol": str(c["code"]), "strike": strike, "side": side}
        (puts_raw if side == "put" else calls_raw).append(row)

    calls_raw.sort(key=lambda r: r["strike"])
    puts_raw.sort(key=lambda r: r["strike"])
    codes = [r["symbol"] for r in calls_raw + puts_raw]
    quote_map: dict[str, dict[str, Any]] = {}

    try:
        for i in range(0, len(codes), 80):
            chunk = codes[i : i + 80]
            snap = await futu_request(
                "POST",
                "/api/v1.0/quote/snapshot",
                body={"code_list": chunk},
                store=store,
            )
            for s in (snap or {}).get("snapshot_list") or []:
                sym = s.get("code")
                if not sym:
                    continue
                last = float(s.get("last_price") or 0)
                prev = float(s.get("prev_close_price") or 0)
                iv = float(s.get("option_implied_volatility") or 0)
                bid = float(s.get("bid_price") or 0)
                ask = float(s.get("ask_price") or 0)
                quote_map[str(sym)] = {
                    "symbol": str(sym),
                    "strike": float(s.get("option_strike_price") or 0) or 0,
                    "last": last,
                    "prevClose": prev,
                    "chgPct": ((last - prev) / prev * 100) if prev > 0 else None,
                    "iv": iv if iv > 0 else None,
                    "oi": float(s.get("option_open_interest") or 0),
                    "volume": float(s.get("volume") or 0),
                    "bid": bid if bid > 0 else None,
                    "ask": ask if ask > 0 else None,
                    "bidVol": float(s.get("bid_vol") or 0) or None,
                    "askVol": float(s.get("ask_vol") or 0) or None,
                    "bidAskRatio": _num_or_null(s.get("bid_ask_ratio")),
                    "open": float(s.get("open_price") or 0) or None,
                    "high": float(s.get("high_price") or 0) or None,
                    "low": float(s.get("low_price") or 0) or None,
                }
    except Exception as exc:  # noqa: BLE001
        log.warning("[futu] option snapshot failed: %s", exc)

    def to_rows(raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for c in raw:
            q = quote_map.get(c["symbol"])
            if q:
                out.append({**q, "strike": q["strike"] if q["strike"] > 0 else c["strike"]})
            else:
                out.append(
                    {
                        "symbol": c["symbol"],
                        "strike": c["strike"],
                        "last": 0,
                        "prevClose": 0,
                        "chgPct": None,
                        "iv": None,
                        "oi": 0,
                        "volume": 0,
                    }
                )
        return out

    return {
        "expiry": expiry_ymd,
        "calls": to_rows(calls_raw),
        "puts": to_rows(puts_raw),
        "source": "futu",
    }
