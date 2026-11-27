"""Optional Longbridge via official `longport` Python package."""

from __future__ import annotations

import asyncio
import logging
from datetime import date, datetime, timezone
from typing import Any

from app.services.market.creds_resolve import resolve_longbridge_creds
from app.services.market.symbols import normalize_symbol, to_longbridge_symbol

log = logging.getLogger(__name__)

_LONGPORT_OK: bool | None = None
_ctx_cache: dict[str, Any] = {}
_CTX_MAX = 2


def longport_available() -> bool:
    """Detect SDK once; allow one retry after pip install without full restart."""
    global _LONGPORT_OK
    if _LONGPORT_OK is True:
        return True
    try:
        import longport.openapi  # noqa: F401

        _LONGPORT_OK = True
        return True
    except Exception:
        _LONGPORT_OK = False
        return False


def _dec(v: Any) -> float:
    if v is None:
        return 0.0
    if hasattr(v, "to_number"):
        try:
            return float(v.to_number())
        except Exception:
            return 0.0
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _creds_fp(creds: dict[str, Any]) -> str:
    return f"{creds.get('appKey', '')[:8]}:{creds.get('accessToken', '')[:12]}"


def _longbridge_http_url() -> str:
    import os

    return (
        os.environ.get("LONGBRIDGE_HTTP_URL", "").strip()
        or os.environ.get("LONGBRIDGE_HTTP_HOST", "").strip()
        or os.environ.get("LONGPORT_HTTP_URL", "").strip()
        # CN default — international longportapp.com often unreachable inland.
        or "https://openapi.longbridge.cn"
    )


def _build_quote_ctx(creds: dict[str, Any]) -> Any:
    from longport.openapi import Config, QuoteContext

    key = _creds_fp(creds)
    hit = _ctx_cache.get(key)
    if hit is not None:
        return hit
    http_url = _longbridge_http_url()
    cfg = Config.from_apikey(
        str(creds["appKey"]),
        str(creds["appSecret"]),
        str(creds["accessToken"]),
        http_url=http_url,
        enable_overnight=True,
        enable_print_quote_packages=False,
    )
    ctx = QuoteContext(cfg)
    _ctx_cache[key] = ctx
    while len(_ctx_cache) > _CTX_MAX:
        _ctx_cache.pop(next(iter(_ctx_cache)), None)
    return ctx


def _map_lb_session(pp: Any, regular_price: float) -> dict[str, Any] | None:
    if pp is None:
        return None
    price = _dec(getattr(pp, "last_done", None) or getattr(pp, "lastDone", None))
    if not (price > 0):
        return None
    # Percent vs regular last (TS longbridge-quote-map parity).
    change = price - regular_price if regular_price > 0 else 0.0
    pct = (change / regular_price * 100) if regular_price > 0 else 0.0
    high = _dec(getattr(pp, "high", None))
    low = _dec(getattr(pp, "low", None))
    volume = float(getattr(pp, "volume", 0) or 0)
    ts = getattr(pp, "timestamp", None)
    out: dict[str, Any] = {
        "price": price,
        "change": change,
        "percentChange": pct,
    }
    if isinstance(ts, datetime):
        out["timestamp"] = int(ts.timestamp())
    if high > 0:
        out["high"] = high
    if low > 0:
        out["low"] = low
    if volume > 0:
        out["volume"] = volume
    return out


def _quote_sync(creds: dict[str, Any], symbol: str, asset_type: str) -> dict[str, Any]:
    from app.services.market.session import (
        apply_active_extended_price,
        resolve_active_session,
    )

    ctx = _build_quote_ctx(creds)
    normalized = normalize_symbol(symbol, asset_type)
    lb_sym = to_longbridge_symbol(normalized, asset_type)
    rows = ctx.quote([lb_sym])
    if not rows:
        raise RuntimeError(f"No quote for {lb_sym}")
    q = rows[0]
    price = _dec(getattr(q, "last_done", None) or getattr(q, "lastDone", None))
    prev = _dec(getattr(q, "prev_close", None) or getattr(q, "prevClose", None))
    change = price - prev
    ts = getattr(q, "timestamp", None)
    as_of = int(ts.timestamp()) if isinstance(ts, datetime) else int(datetime.now(tz=timezone.utc).timestamp())
    pct = (change / prev * 100) if prev else 0.0
    quote: dict[str, Any] = {
        "symbol": normalized,
        "assetType": asset_type,
        "price": price,
        "change": change,
        "percentChange": pct,
        "changePercent": pct,
        "high": _dec(getattr(q, "high", None)),
        "low": _dec(getattr(q, "low", None)),
        "open": _dec(getattr(q, "open", None)),
        "previousClose": prev,
        "volume": float(getattr(q, "volume", 0) or 0) or None,
        "source": "longbridge",
        "asOf": as_of,
        "timestamp": as_of,
    }
    if asset_type == "stock":
        pre = _map_lb_session(
            getattr(q, "pre_market_quote", None) or getattr(q, "preMarketQuote", None),
            price,
        )
        post = _map_lb_session(
            getattr(q, "post_market_quote", None) or getattr(q, "postMarketQuote", None),
            price,
        )
        overnight = _map_lb_session(
            getattr(q, "overnight_quote", None) or getattr(q, "overnightQuote", None),
            price,
        )
        if pre:
            quote["preMarket"] = pre
        if post:
            quote["postMarket"] = post
        if overnight:
            quote["overnight"] = overnight
        quote["activeSession"] = resolve_active_session(
            pre=pre, post=post, overnight=overnight
        )
        quote = apply_active_extended_price(quote)
    return quote


def _period_for(resolution: str) -> Any:
    from longport.openapi import Period

    mapping = {
        "T": Period.Min_1,
        "1": Period.Min_1,
        "5": Period.Min_5,
        "D": Period.Day,
        "W": Period.Week,
        "M": Period.Month,
    }
    return mapping.get(resolution, Period.Day)


def _candles_sync(
    creds: dict[str, Any],
    symbol: str,
    asset_type: str,
    resolution: str,
    frm: int,
    to: int,
    extended_hours: bool,
) -> list[dict[str, Any]]:
    from longport.openapi import AdjustType, TradeSessions

    ctx = _build_quote_ctx(creds)
    normalized = normalize_symbol(symbol, asset_type)
    lb_sym = to_longbridge_symbol(normalized, asset_type)
    period = _period_for(resolution)
    trade_sessions = TradeSessions.All if extended_hours else TradeSessions.Intraday
    start = date.fromtimestamp(frm)
    end = date.fromtimestamp(to)
    sticks = []
    try:
        sticks = ctx.history_candlesticks_by_date(
            lb_sym, period, AdjustType.NoAdjust, start, end, trade_sessions
        )
    except Exception as exc:
        log.warning("longbridge history_candlesticks_by_date failed: %s", exc)
        day_span = max(1, int((to - frm) / 86400) + 1)
        denser = 420 if resolution in {"T", "1"} else 84 if resolution == "5" else 1
        count = min(1000, day_span * denser + 20)
        sticks = ctx.candlesticks(
            lb_sym, period, count, AdjustType.NoAdjust, trade_sessions
        )
    out: list[dict[str, Any]] = []
    for c in sticks or []:
        ts = getattr(c, "timestamp", None)
        t = int(ts.timestamp()) if isinstance(ts, datetime) else 0
        if t < frm or t > to:
            continue
        out.append(
            {
                "time": t,
                "open": _dec(getattr(c, "open", None)),
                "high": _dec(getattr(c, "high", None)),
                "low": _dec(getattr(c, "low", None)),
                "close": _dec(getattr(c, "close", None)),
                "volume": float(getattr(c, "volume", 0) or 0),
            }
        )
    out.sort(key=lambda b: b["time"])
    return out


def _depth_sync(creds: dict[str, Any], symbol: str, asset_type: str, levels: int) -> dict[str, Any]:
    ctx = _build_quote_ctx(creds)
    lb_sym = to_longbridge_symbol(normalize_symbol(symbol, asset_type), asset_type)
    depth = ctx.depth(lb_sym)

    def map_side(rows: Any) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for row in rows or []:
            price = _dec(getattr(row, "price", None))
            if price <= 0:
                continue
            out.append(
                {
                    "price": price,
                    "volume": float(getattr(row, "volume", 0) or 0),
                    "orderNum": int(getattr(row, "order_num", None) or getattr(row, "orderNum", 0) or 0),
                }
            )
            if len(out) >= levels:
                break
        return out

    bids = map_side(getattr(depth, "bids", None))
    asks = map_side(getattr(depth, "asks", None))
    if not bids and not asks:
        raise RuntimeError(f"No depth for {lb_sym}")
    return {"bids": bids, "asks": asks}


def _trades_sync(creds: dict[str, Any], symbol: str, asset_type: str, count: int) -> list[dict[str, Any]]:
    ctx = _build_quote_ctx(creds)
    lb_sym = to_longbridge_symbol(normalize_symbol(symbol, asset_type), asset_type)
    rows = ctx.trades(lb_sym, count)
    out: list[dict[str, Any]] = []
    for t in rows or []:
        price = _dec(getattr(t, "price", None))
        if price <= 0:
            continue
        direction = int(getattr(t, "direction", 0) or 0)
        ts = getattr(t, "timestamp", None)
        out.append(
            {
                "price": price,
                "volume": float(getattr(t, "volume", 0) or 0),
                "time": int(ts.timestamp()) if isinstance(ts, datetime) else 0,
                "direction": "up" if direction == 2 else "down" if direction == 1 else "neutral",
            }
        )
    if not out:
        raise RuntimeError(f"No trades for {lb_sym}")
    return out


def _capital_sync(creds: dict[str, Any], symbol: str, asset_type: str) -> dict[str, Any]:
    ctx = _build_quote_ctx(creds)
    lb_sym = to_longbridge_symbol(normalize_symbol(symbol, asset_type), asset_type)
    try:
        row = ctx.capital_distribution(lb_sym)
        cin = getattr(row, "capital_in", None) or getattr(row, "capitalIn", None)
        cout = getattr(row, "capital_out", None) or getattr(row, "capitalOut", None)

        def bucket(side: Any) -> dict[str, float]:
            return {
                "large": _dec(getattr(side, "large", None)),
                "medium": _dec(getattr(side, "medium", None)),
                "small": _dec(getattr(side, "small", None)),
            }

        inflow = bucket(cin)
        outflow = bucket(cout)
        if sum(inflow.values()) + sum(outflow.values()) > 0:
            ts = getattr(row, "timestamp", None)
            return {
                "timestamp": int(ts.timestamp()) if isinstance(ts, datetime) else int(datetime.now(tz=timezone.utc).timestamp()),
                "inflow": inflow,
                "outflow": outflow,
            }
    except Exception as exc:
        log.warning("capital_distribution failed: %s", exc)
    raise RuntimeError(f"No capital data for {lb_sym}")


def _short_sync(creds: dict[str, Any], symbol: str, asset_type: str, count: int) -> list[dict[str, Any]]:
    ctx = _build_quote_ctx(creds)
    lb_sym = to_longbridge_symbol(normalize_symbol(symbol, asset_type), asset_type)
    resp = ctx.short_trades(lb_sym, count) if hasattr(ctx, "short_trades") else None
    rows = getattr(resp, "data", None) if resp is not None else None
    if rows is None and hasattr(ctx, "security_short_trades"):
        rows = ctx.security_short_trades(lb_sym, count)
    out: list[dict[str, Any]] = []
    for r in rows or []:
        def num(name: str) -> float | None:
            v = getattr(r, name, None)
            try:
                f = float(v)
                return f if f == f else None
            except (TypeError, ValueError):
                return None

        out.append(
            {
                "timestamp": str(getattr(r, "timestamp", "") or ""),
                "rate": num("rate"),
                "close": num("close"),
                "totalAmount": num("total_amount") if hasattr(r, "total_amount") else num("totalAmount"),
                "amount": num("amount"),
                "balance": num("balance"),
            }
        )
    if not out:
        raise RuntimeError(f"No short data for {lb_sym}")
    return out


async def _run(fn: Any, *args: Any, timeout: float = 8.0) -> Any:
    return await asyncio.wait_for(asyncio.to_thread(fn, *args), timeout=timeout)


async def lb_quote(store: dict[str, Any] | None, symbol: str, asset_type: str) -> dict[str, Any]:
    if asset_type == "crypto":
        raise RuntimeError("Longbridge crypto not preferred")
    if not longport_available():
        raise RuntimeError("longport package not installed")
    creds = resolve_longbridge_creds(store)
    if not creds:
        raise RuntimeError("Longbridge credentials not configured")
    return await _run(_quote_sync, creds, symbol, asset_type, timeout=4.0)


async def lb_candles(
    store: dict[str, Any] | None,
    symbol: str,
    asset_type: str,
    *,
    resolution: str,
    frm: int,
    to: int,
    extended_hours: bool = False,
) -> list[dict[str, Any]]:
    if asset_type == "crypto":
        raise RuntimeError("Longbridge crypto candles unsupported")
    if not longport_available():
        raise RuntimeError("longport package not installed")
    creds = resolve_longbridge_creds(store)
    if not creds:
        raise RuntimeError("Longbridge credentials not configured")
    # Keep short so DNS/connect failures fail over to Futu/Finnhub quickly.
    return await _run(
        _candles_sync,
        creds,
        symbol,
        asset_type,
        resolution,
        frm,
        to,
        extended_hours,
        timeout=4.0,
    )


async def lb_search(q: str, asset_type: str) -> list[dict[str, Any]]:
    """Parity with TS longbridge searchSymbols (synthetic single hit)."""
    if asset_type == "crypto":
        return []
    query = q.strip().upper()
    if not query:
        return []
    cleaned = (
        query.replace(".US", "")
        .replace(".HK", "")
        .removeprefix("HK.")
        .removeprefix("SH.")
        .removeprefix("SZ.")
        .removeprefix("BJ.")
    )
    typ = asset_type if asset_type in {"hk", "cn", "stock"} else "stock"
    sym = normalize_symbol(cleaned, typ)
    display = f"{sym}.HK" if typ == "hk" else sym if typ == "cn" else f"{sym}.US"
    return [
        {
            "symbol": sym,
            "name": f"{sym} (Longbridge)",
            "assetType": typ,
            "exchange": display,
        }
    ]


async def lb_depth(
    store: dict[str, Any] | None, symbol: str, asset_type: str, levels: int = 10
) -> dict[str, Any]:
    if not longport_available():
        raise RuntimeError("longport package not installed")
    creds = resolve_longbridge_creds(store)
    if not creds:
        raise RuntimeError("Longbridge credentials not configured")
    n = min(10, max(1, levels))
    return await _run(_depth_sync, creds, symbol, asset_type, n, timeout=6.0)


async def lb_trades(
    store: dict[str, Any] | None, symbol: str, asset_type: str, count: int = 50
) -> list[dict[str, Any]]:
    if not longport_available():
        raise RuntimeError("longport package not installed")
    creds = resolve_longbridge_creds(store)
    if not creds:
        raise RuntimeError("Longbridge credentials not configured")
    n = min(50, max(1, count))
    return await _run(_trades_sync, creds, symbol, asset_type, n, timeout=6.0)


async def lb_capital(store: dict[str, Any] | None, symbol: str, asset_type: str) -> dict[str, Any]:
    if not longport_available():
        raise RuntimeError("longport package not installed")
    creds = resolve_longbridge_creds(store)
    if not creds:
        raise RuntimeError("Longbridge credentials not configured")
    return await _run(_capital_sync, creds, symbol, asset_type, timeout=8.0)


async def lb_short(
    store: dict[str, Any] | None, symbol: str, asset_type: str, count: int = 30
) -> list[dict[str, Any]]:
    if not longport_available():
        raise RuntimeError("longport package not installed")
    creds = resolve_longbridge_creds(store)
    if not creds:
        raise RuntimeError("Longbridge credentials not configured")
    n = min(60, max(1, count))
    return await _run(_short_sync, creds, symbol, asset_type, n, timeout=8.0)


def is_configured(store: dict[str, Any] | None) -> bool:
    return longport_available() and resolve_longbridge_creds(store) is not None
