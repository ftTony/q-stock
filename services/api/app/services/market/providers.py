from __future__ import annotations

import time
from typing import Any

import httpx

from app.core.settings import get_settings
from app.services.market.router import provider_status as router_provider_status


class ProviderError(Exception):
    def __init__(self, message: str, *, status: int = 502) -> None:
        super().__init__(message)
        self.status = status


async def finnhub_quote(symbol: str) -> dict[str, Any]:
    key = get_settings().finnhub_api_key.strip()
    if not key:
        raise ProviderError("Finnhub not configured", status=503)
    url = "https://finnhub.io/api/v1/quote"
    async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
        res = await client.get(url, params={"symbol": symbol, "token": key})
        res.raise_for_status()
        data = res.json()
    price = float(data.get("c") or 0)
    if price <= 0:
        raise ProviderError(f"No quote for {symbol}")
    prev = float(data.get("pc") or 0)
    change = price - prev if prev else 0.0
    change_pct = (change / prev * 100) if prev else 0.0
    return {
        "symbol": symbol,
        "assetType": "stock",
        "price": price,
        "change": change,
        "percentChange": change_pct,
        "changePercent": change_pct,
        "high": float(data.get("h") or price),
        "low": float(data.get("l") or price),
        "open": float(data.get("o") or price),
        "previousClose": prev,
        "volume": None,
        "source": "finnhub",
        "asOf": int(data.get("t") or time.time()),
    }


async def finnhub_candles(
    symbol: str, *, resolution: str, frm: int, to: int
) -> list[dict[str, Any]]:
    key = get_settings().finnhub_api_key.strip()
    if not key:
        raise ProviderError("Finnhub not configured", status=503)
    res_map = {"D": "D", "W": "W", "M": "M", "1": "1", "5": "5", "T": "1"}
    r = res_map.get(resolution, "D")
    url = "https://finnhub.io/api/v1/stock/candle"
    async with httpx.AsyncClient(trust_env=False, timeout=15.0) as client:
        res = await client.get(
            url,
            params={"symbol": symbol, "resolution": r, "from": frm, "to": to, "token": key},
        )
        res.raise_for_status()
        data = res.json()
    if data.get("s") != "ok":
        return []
    out: list[dict[str, Any]] = []
    for i, t in enumerate(data.get("t") or []):
        out.append(
            {
                "time": int(t),
                "open": float(data["o"][i]),
                "high": float(data["h"][i]),
                "low": float(data["l"][i]),
                "close": float(data["c"][i]),
                "volume": float(data["v"][i]) if data.get("v") else 0,
            }
        )
    return out


async def finnhub_search(q: str) -> list[dict[str, Any]]:
    key = get_settings().finnhub_api_key.strip()
    if not key:
        raise ProviderError("Finnhub not configured", status=503)
    url = "https://finnhub.io/api/v1/search"
    async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
        res = await client.get(url, params={"q": q, "token": key})
        res.raise_for_status()
        data = res.json()
    results = []
    for item in (data.get("result") or [])[:20]:
        sym = item.get("symbol")
        if not sym:
            continue
        results.append(
            {
                "symbol": sym,
                "name": item.get("description") or sym,
                "assetType": "stock",
                "exchange": item.get("displaySymbol") or "",
            }
        )
    return results


def _binance_symbol(symbol: str) -> str:
    s = symbol.upper().replace("/", "").replace("-", "")
    if not s.endswith("USDT"):
        s = f"{s}USDT"
    return s


async def binance_quote(symbol: str) -> dict[str, Any]:
    base = get_settings().binance_api_url.rstrip("/")
    pair = _binance_symbol(symbol)
    async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
        res = await client.get(f"{base}/api/v3/ticker/24hr", params={"symbol": pair})
        res.raise_for_status()
        data = res.json()
    price = float(data.get("lastPrice") or 0)
    if price <= 0:
        raise ProviderError(f"No quote for {pair}")
    change = float(data.get("priceChange") or 0)
    change_pct = float(data.get("priceChangePercent") or 0)
    return {
        "symbol": pair,
        "assetType": "crypto",
        "price": price,
        "change": change,
        "percentChange": change_pct,
        "changePercent": change_pct,
        "high": float(data.get("highPrice") or price),
        "low": float(data.get("lowPrice") or price),
        "open": float(data.get("openPrice") or price),
        "previousClose": price - change,
        "volume": float(data.get("volume") or 0),
        "source": "binance",
        "asOf": int(time.time()),
    }


async def binance_candles(
    symbol: str, *, interval: str, frm: int, to: int, limit: int = 500
) -> list[dict[str, Any]]:
    base = get_settings().binance_api_url.rstrip("/")
    pair = _binance_symbol(symbol)
    interval_map = {"T": "1m", "1": "1m", "5": "5m", "D": "1d", "W": "1w", "M": "1M"}
    iv = interval_map.get(interval, "1d")
    async with httpx.AsyncClient(trust_env=False, timeout=15.0) as client:
        res = await client.get(
            f"{base}/api/v3/klines",
            params={
                "symbol": pair,
                "interval": iv,
                "startTime": frm * 1000,
                "endTime": to * 1000,
                "limit": min(limit, 1000),
            },
        )
        res.raise_for_status()
        rows = res.json()
    out: list[dict[str, Any]] = []
    for row in rows:
        out.append(
            {
                "time": int(row[0]) // 1000,
                "open": float(row[1]),
                "high": float(row[2]),
                "low": float(row[3]),
                "close": float(row[4]),
                "volume": float(row[5]),
            }
        )
    return out


async def binance_search(q: str) -> list[dict[str, Any]]:
    base = get_settings().binance_api_url.rstrip("/")
    needle = q.upper().replace("/", "").replace("-", "")
    async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
        res = await client.get(f"{base}/api/v3/exchangeInfo")
        res.raise_for_status()
        data = res.json()
    results = []
    for s in data.get("symbols") or []:
        sym = s.get("symbol") or ""
        if needle and needle not in sym:
            continue
        if s.get("status") != "TRADING":
            continue
        if not sym.endswith("USDT"):
            continue
        results.append(
            {
                "symbol": sym,
                "name": sym,
                "assetType": "crypto",
                "exchange": "BINANCE",
            }
        )
        if len(results) >= 20:
            break
    return results


def provider_status() -> dict[str, bool]:
    return router_provider_status(None)
