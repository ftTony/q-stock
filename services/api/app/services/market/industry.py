"""Industry heatmap: Longbridge public chart → Futu plate-list fallback."""

from __future__ import annotations

import logging
import os
from typing import Any

import httpx

from app.core.redis_client import cache_get, cache_set
from app.services.market.router import is_provider_enabled
from app.services.market.symbols import normalize_symbol

log = logging.getLogger(__name__)

CHART_HOST = (
    os.environ.get("LONGBRIDGE_CHART_HOST", "").strip()
    or "https://mr.lbkrs.com/api/forward"
)


def _to_percent(raw: Any) -> float:
    try:
        n = float(raw)
    except (TypeError, ValueError):
        return 0.0
    return n * 100 if abs(n) <= 1.5 else n


def _counter_to_symbol(counter_id: str, asset_type: str) -> str:
    parts = counter_id.split("/")
    code = parts[2] if len(parts) > 2 else counter_id
    return normalize_symbol(code, asset_type)


def _map_stock(raw: dict[str, Any], asset_type: str) -> dict[str, Any] | None:
    name = str(raw.get("name") or "").strip()
    cid = str(raw.get("counter_id") or "").strip()
    if not name or not cid:
        return None
    try:
        price = float(raw.get("last_done") or 0)
    except (TypeError, ValueError):
        price = 0.0
    return {
        "symbol": _counter_to_symbol(cid, asset_type),
        "name": name,
        "price": price if price == price else 0.0,
        "percentChange": _to_percent(raw.get("chg")),
    }


def _map_cell(raw: dict[str, Any], asset_type: str, index: int) -> dict[str, Any] | None:
    name = str(raw.get("name") or "").strip()
    if not name:
        return None
    cell_id = str(raw.get("counter_id") or name)
    try:
        cap = float(raw.get("market_cap") or 0)
    except (TypeError, ValueError):
        cap = 0.0
    try:
        amount = float(raw.get("amount") or 0)
    except (TypeError, ValueError):
        amount = 0.0
    try:
        balance = float(raw.get("balance") or 0)
    except (TypeError, ValueError):
        balance = 0.0
    volume = amount if amount > 0 else (balance if balance > 0 else None)
    stocks: list[dict[str, Any]] = []
    for s in raw.get("stocks") or []:
        if not isinstance(s, dict):
            continue
        mapped = _map_stock(s, asset_type)
        if mapped:
            stocks.append(mapped)
        if len(stocks) >= 12:
            break
    return {
        "id": cell_id,
        "name": name,
        "percentChange": _to_percent(raw.get("chg")),
        "weight": cap if cap > 0 else max(1, 100 - index),
        "volume": volume,
        "stocks": stocks,
    }


def _market_of(asset_type: str) -> str | None:
    if asset_type == "stock":
        return "US"
    if asset_type == "hk":
        return "HK"
    if asset_type == "cn":
        return "CN"
    return None


async def get_longbridge_industry_heatmap(
    asset_type: str,
    limit: int = 40,
) -> list[dict[str, Any]]:
    """Public Longbridge chart HTTP — no API key required."""
    market = _market_of(asset_type)
    if not market:
        return []
    n = min(60, max(10, limit))
    cache_key = f"lb:industry:chart:v1:{market}:{n}"
    cached = await cache_get(cache_key)
    if cached:
        import json

        try:
            rows = json.loads(cached)
            if isinstance(rows, list):
                return rows
        except Exception:  # noqa: BLE001
            pass

    url = f"{CHART_HOST}/v2/newmarket/global/industry_chart"
    try:
        async with httpx.AsyncClient(trust_env=False, timeout=20.0) as client:
            res = await client.get(
                url,
                params={"market": market, "index_key": "", "limit": n},
                headers={"Accept": "application/json"},
            )
            res.raise_for_status()
            body = res.json()
    except Exception as exc:  # noqa: BLE001
        log.warning("[industry] longbridge chart failed: %s", exc)
        return []

    if isinstance(body, dict) and body.get("code") not in (None, 0):
        log.warning("[industry] longbridge chart code=%s", body.get("code"))
        return []

    items = []
    if isinstance(body, dict):
        items = (body.get("data") or {}).get("items") or []
    out: list[dict[str, Any]] = []
    for i, raw in enumerate(items):
        if not isinstance(raw, dict):
            continue
        cell = _map_cell(raw, asset_type, i)
        if cell:
            out.append(cell)
        if len(out) >= n:
            break

    if out:
        import json

        await cache_set(cache_key, json.dumps(out), 120)
    return out


async def resolve_industry_heatmap(
    asset_type: str,
    limit: int = 40,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    _ = store
    if asset_type == "crypto":
        return {"industries": [], "source": None}

    if is_provider_enabled("longbridge"):
        industries = await get_longbridge_industry_heatmap(asset_type, limit)
        if industries:
            return {
                "industries": industries,
                "source": "longbridge",
                "degraded": False,
            }

    # Futu plate heatmap (env / BYOK)
    try:
        from app.services.market.futu_industry import get_futu_industry_heatmap

        if is_provider_enabled("futu"):
            industries = await get_futu_industry_heatmap(
                asset_type, limit, store=store
            )
            if industries:
                return {
                    "industries": industries,
                    "source": "futu",
                    "degraded": False,
                }
    except Exception as exc:  # noqa: BLE001
        log.warning("[industry] futu fallback failed: %s", exc)

    return {"industries": [], "source": None, "degraded": True}
