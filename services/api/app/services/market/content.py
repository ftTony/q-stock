"""Content / board endpoints with soft degrade + list caps."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from app.core.settings import get_settings
from app.services.market.facade import get_quotes
from app.services.market.router import is_provider_enabled
from app.services.market.symbols import (
    POPULAR_CN,
    POPULAR_CRYPTO,
    POPULAR_HK,
    POPULAR_STOCKS,
    indices_for_market,
)

log = logging.getLogger(__name__)


def _empty_boards() -> dict[str, list]:
    return {"hot": [], "gainers": [], "losers": []}


def _pct(q: dict[str, Any]) -> float:
    try:
        raw = q.get("percentChange")
        if raw is None:
            raw = q.get("changePercent")
        return float(raw if raw is not None else 0)
    except (TypeError, ValueError):
        return 0.0


def _sort_boards(quotes: list[dict[str, Any]], limit: int) -> dict[str, list]:
    # Ensure frontend Quote shape (`percentChange`) on every row.
    for q in quotes:
        pct = _pct(q)
        q["percentChange"] = pct
        q["changePercent"] = pct
    hot = quotes[:limit]
    gainers = sorted(quotes, key=_pct, reverse=True)[:limit]
    losers = sorted(quotes, key=_pct)[:limit]
    return {"hot": hot, "gainers": gainers, "losers": losers}


async def resolve_ranks(
    asset_type: str,
    limit: int = 15,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    n = min(50, max(5, limit))
    if asset_type == "crypto":
        items = [{"symbol": s, "assetType": "crypto"} for s in POPULAR_CRYPTO[:n]]
    elif asset_type == "hk":
        items = [{"symbol": s, "assetType": "hk"} for s in POPULAR_HK[:n]]
    elif asset_type == "cn":
        items = [{"symbol": s, "assetType": "cn"} for s in POPULAR_CN[:n]]
    else:
        items = [{"symbol": s, "assetType": "stock"} for s in POPULAR_STOCKS[:n]]
    try:
        quotes = await get_quotes(items, store=store)
        boards = _sort_boards(quotes, n)
        empty = not (boards["hot"] or boards["gainers"] or boards["losers"])
        return {
            "boards": boards,
            "source": "popular",
            "degraded": empty,
        }
    except Exception as exc:  # noqa: BLE001
        log.warning("[ranks] %s", exc)
        return {"boards": _empty_boards(), "source": None, "degraded": True}


async def resolve_industry_ranks(
    asset_type: str,
    limit: int = 40,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    from app.services.market.industry import resolve_industry_heatmap

    return await resolve_industry_heatmap(asset_type, limit, store=store)


async def resolve_indices(
    asset_type: str,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    defs = indices_for_market(asset_type)
    if not defs:
        return {"indices": [], "quotes": []}
    items = [{"symbol": d["symbol"], "assetType": d["assetType"]} for d in defs]
    try:
        quotes = await get_quotes(items, store=store)
        by_sym = {q.get("symbol"): q for q in quotes}
        indices = []
        for d in defs:
            q = by_sym.get(d["symbol"]) or by_sym.get(d["symbol"].lstrip("0"))
            indices.append(
                {
                    **d,
                    "price": q.get("price") if q else None,
                    "change": q.get("change") if q else None,
                    "changePercent": q.get("changePercent") if q else None,
                    "source": q.get("source") if q else None,
                }
            )
        return {"indices": indices, "source": quotes[0].get("source") if quotes else None}
    except Exception as exc:  # noqa: BLE001
        log.warning("[indices] %s", exc)
        return {"indices": [], "degraded": True, "error": str(exc)}


async def resolve_ipo(asset_type: str, status: str | None = None, limit: int = 4) -> dict[str, Any]:
    _ = status
    n = min(20, max(4, limit))
    if asset_type != "hk":
        return {"items": [], "source": None}
    if not is_provider_enabled("longbridge") and not is_provider_enabled("futu"):
        return {"items": [], "source": None, "degraded": True}
    return {"items": [], "status": status or "all", "source": None, "degraded": True, "limit": n}


async def resolve_earnings(symbol: str, asset_type: str, *, scope: str | None = None) -> dict[str, Any]:
    _ = (asset_type, scope)
    empty = {
        "symbol": symbol.upper(),
        "surprises": [],
        "calendar": {"upcoming": [], "recent": []},
        "metrics": [],
        "statement": None,
        "balance": None,
        "cashflow": None,
        "source": None,
        "degraded": True,
    }
    if not is_provider_enabled("finnhub"):
        return empty
    key = get_settings().finnhub_api_key.strip()
    if not key:
        return empty
    try:
        async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
            res = await client.get(
                "https://finnhub.io/api/v1/stock/metric",
                params={"symbol": symbol.upper(), "metric": "all", "token": key},
            )
            res.raise_for_status()
            data = res.json()
        metric = data.get("metric") or {}
        metrics = []
        for k, v in list(metric.items())[:40]:
            if isinstance(v, (int, float)):
                metrics.append({"key": k, "value": float(v)})
        empty["metrics"] = metrics
        empty["source"] = "finnhub" if metrics else None
        empty["degraded"] = len(metrics) == 0
        return empty
    except Exception as exc:  # noqa: BLE001
        log.warning("[earnings] %s", exc)
        empty["error"] = str(exc)
        return empty


async def resolve_company(symbol: str, asset_type: str, locale: str | None = None) -> dict[str, Any]:
    _ = locale
    empty = {"profile": None, "officers": [], "source": None, "degraded": True}
    if asset_type == "crypto":
        return empty
    if not is_provider_enabled("finnhub"):
        return empty
    key = get_settings().finnhub_api_key.strip()
    if not key:
        return empty
    try:
        async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
            res = await client.get(
                "https://finnhub.io/api/v1/stock/profile2",
                params={"symbol": symbol.upper(), "token": key},
            )
            res.raise_for_status()
            profile = res.json() or None
        if not profile or not profile.get("name"):
            return empty
        return {"profile": profile, "officers": [], "source": "finnhub", "degraded": False}
    except Exception as exc:  # noqa: BLE001
        log.warning("[company] %s", exc)
        empty["error"] = str(exc)
        return empty


async def resolve_news(
    symbol: str | None,
    asset_type: str,
    *,
    limit: int = 40,
    locale: str | None = None,
) -> dict[str, Any]:
    _ = locale
    n = min(60, max(1, limit))
    key = get_settings().finnhub_api_key.strip()
    if not key or not is_provider_enabled("finnhub"):
        return {"news": [], "source": None, "degraded": True}
    try:
        async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
            if symbol:
                res = await client.get(
                    "https://finnhub.io/api/v1/company-news",
                    params={
                        "symbol": symbol.upper(),
                        "from": "2020-01-01",
                        "to": "2099-01-01",
                        "token": key,
                    },
                )
            else:
                category = "crypto" if asset_type == "crypto" else "general"
                res = await client.get(
                    "https://finnhub.io/api/v1/news",
                    params={"category": category, "token": key},
                )
            res.raise_for_status()
            rows = res.json() or []
        news = []
        for item in rows[:n]:
            news.append(
                {
                    "id": item.get("id"),
                    "headline": item.get("headline") or item.get("title"),
                    "summary": item.get("summary") or "",
                    "url": item.get("url"),
                    "source": item.get("source"),
                    "datetime": item.get("datetime"),
                    "image": item.get("image"),
                }
            )
        return {"news": news, "source": "finnhub", "degraded": len(news) == 0}
    except Exception as exc:  # noqa: BLE001
        log.warning("[news] %s", exc)
        return {"news": [], "source": None, "degraded": True, "error": str(exc)}


async def resolve_press(
    symbol: str,
    asset_type: str,
    *,
    limit: int = 40,
    locale: str | None = None,
) -> dict[str, Any]:
    _ = locale
    n = min(60, max(1, limit))
    if asset_type == "crypto":
        return {"press": [], "degraded": True, "source": None}
    return {"press": [], "source": None, "degraded": True, "limit": n}


async def resolve_sentiment(symbol: str | None, asset_type: str) -> dict[str, Any]:
    """Adanos soft degrade when key missing / upstream fails (parity with TS client)."""
    import os

    key = os.environ.get("ADANOS_API_KEY", "").strip()

    def _empty(source: str, message: str) -> dict[str, Any]:
        return {"available": False, "source": source, "message": message}

    if not key:
        msg = "ADANOS_API_KEY not configured"
        if symbol:
            return {"sentiment": {"news": _empty("adanos", msg)}, "degraded": True}
        return {"market": _empty("adanos", msg), "degraded": True}

    if asset_type == "hk":
        if symbol:
            return {
                "sentiment": {
                    "news": _empty("hk", "HK sentiment not available via Adanos"),
                }
            }
        return {
            "market": _empty("hk", "HK market sentiment not available via Adanos"),
        }

    base = "https://api.adanos.org"
    headers = {"X-API-Key": key}
    try:
        async with httpx.AsyncClient(trust_env=False, timeout=8.0) as client:
            if not symbol:
                path = (
                    "/reddit/crypto/v1/market-sentiment"
                    if asset_type == "crypto"
                    else "/news/stocks/v1/market-sentiment"
                )
                res = await client.get(f"{base}{path}", headers=headers)
                res.raise_for_status()
                payload = res.json()
                data = payload if isinstance(payload, dict) else {}
                data = {
                    **data,
                    "available": True,
                    "source": (
                        "reddit-crypto" if asset_type == "crypto" else "news-stocks"
                    ),
                }
                return {"market": data}

            sym = symbol.upper()
            if asset_type == "crypto":
                res = await client.get(
                    f"{base}/reddit/crypto/v1/token/{sym}", headers=headers
                )
                res.raise_for_status()
                data = {**res.json(), "available": True, "source": "reddit-crypto"}
                return {"sentiment": {"reddit": data}}

            news_res, reddit_res = await asyncio.gather(
                client.get(f"{base}/news/stocks/v1/stock/{sym}", headers=headers),
                client.get(f"{base}/reddit/stocks/v1/stock/{sym}", headers=headers),
                return_exceptions=True,
            )
            sentiment: dict[str, Any] = {}
            if isinstance(news_res, httpx.Response) and news_res.is_success:
                sentiment["news"] = {
                    **news_res.json(),
                    "available": True,
                    "source": "news-stocks",
                }
            else:
                sentiment["news"] = _empty("news-stocks", "unavailable")
            if isinstance(reddit_res, httpx.Response) and reddit_res.is_success:
                sentiment["reddit"] = {
                    **reddit_res.json(),
                    "available": True,
                    "source": "reddit-stocks",
                }
            else:
                sentiment["reddit"] = _empty("reddit-stocks", "unavailable")
            return {"sentiment": sentiment}
    except Exception as exc:  # noqa: BLE001
        log.warning("[sentiment] %s", exc)
        msg = "Sentiment temporarily unavailable"
        if symbol:
            return {"sentiment": {"news": _empty("adanos", msg)}, "degraded": True}
        return {"market": _empty("adanos", msg), "degraded": True}
