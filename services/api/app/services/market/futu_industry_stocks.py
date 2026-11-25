"""Paginated industry members via Futu plate-stock (analysis board)."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from app.core.redis_client import cache_get, cache_set
from app.services.market.futu_http import futu_configured, futu_request, futu_request_page
from app.services.market.symbols import normalize_symbol

log = logging.getLogger(__name__)

PAGE_SIZE = 24
MAX_TAKE = 200
_PLATE_RE = re.compile(r"^(US|HK|SH|SZ|BJ)\.", re.I)


def looks_like_futu_plate_code(industry_id: str) -> bool:
    return bool(_PLATE_RE.match((industry_id or "").strip()))


def _pct(last: float, prev: float) -> float:
    if prev <= 0 or last != last:  # noqa: PLR0124 — NaN check
        return 0.0
    return ((last - prev) / prev) * 100


async def _snapshot_codes(
    codes: list[str],
    *,
    store: dict[str, Any] | None,
) -> dict[str, dict[str, Any]]:
    by_code: dict[str, dict[str, Any]] = {}
    if not codes:
        return by_code
    try:
        data = await futu_request(
            "POST",
            "/api/v1.0/quote/snapshot",
            body={"code_list": codes[:PAGE_SIZE]},
            store=store,
        )
        for row in data.get("snapshot_list") or []:
            code = row.get("code")
            if code:
                by_code[str(code)] = row
    except Exception as exc:  # noqa: BLE001
        log.warning("[futu-industry-stocks] snapshot failed: %s", exc)
    return by_code


def _map_rows(
    rows: list[dict[str, Any]],
    snaps: dict[str, dict[str, Any]],
    asset_type: str,
) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for r in rows:
        code = str(r.get("code") or "").strip()
        if not code:
            continue
        t = str(r.get("stock_type") or "STOCK").upper()
        if t and t not in {"STOCK", "EQTY"}:
            continue
        bare = _PLATE_RE.sub("", code)
        snap = snaps.get(code) or {}
        try:
            last = float(snap.get("last_price") or 0)
        except (TypeError, ValueError):
            last = 0.0
        try:
            prev = float(snap.get("prev_close_price") or 0)
        except (TypeError, ValueError):
            prev = 0.0
        try:
            cap = float(snap.get("total_market_val") or 0)
        except (TypeError, ValueError):
            cap = 0.0
        symbol = (
            normalize_symbol(code, "cn")
            if asset_type == "cn"
            else normalize_symbol(bare, asset_type)
        )
        name = str(
            r.get("sc_name")
            or snap.get("sc_name")
            or r.get("stock_name")
            or snap.get("name")
            or bare
        ).strip()
        row: dict[str, Any] = {
            "symbol": symbol,
            "name": name,
            "price": last if last == last else 0.0,  # noqa: PLR0124
            "percentChange": _pct(last, prev),
        }
        if cap == cap and cap > 0:  # noqa: PLR0124
            row["marketCap"] = cap
        out.append(row)
    return out


async def get_futu_industry_stocks_page(
    plate_code: str,
    asset_type: str,
    next_key: str,
    loaded: int = 0,
    *,
    store: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if not futu_configured(store) or not looks_like_futu_plate_code(plate_code):
        return {
            "stocks": [],
            "nextKey": None,
            "hasMore": False,
            "total": 0,
            "source": "futu",
        }
    if loaded >= MAX_TAKE:
        return {
            "stocks": [],
            "nextKey": None,
            "hasMore": False,
            "total": loaded,
            "source": "futu",
        }

    take = min(PAGE_SIZE, MAX_TAKE - loaded)
    cache_key = (
        f"futu:industry-stocks:v1:{plate_code}:{asset_type}:{next_key or '0'}:{take}"
    )
    cached = await cache_get(cache_key)
    if cached:
        try:
            parsed = json.loads(cached)
            if isinstance(parsed, dict):
                return parsed
        except Exception:  # noqa: BLE001
            pass

    query: dict[str, Any] = {"plate_code": plate_code, "limit": take}
    if next_key:
        query["next_key"] = next_key
    result = await futu_request_page(
        "GET",
        "/api/v1.0/quote/plate-stock",
        query=query,
        store=store,
    )
    data = result.get("data") or {}
    raw = data.get("stock_list") or []
    codes = [str(r.get("code")) for r in raw if r.get("code")]
    snaps = await _snapshot_codes(codes, store=store)
    stocks = _map_rows(raw, snaps, asset_type)
    cursor = result.get("nextKey")
    if not result.get("hasMore") or not cursor or cursor == "-1":
        cursor = None
    total = result.get("total")
    if not isinstance(total, (int, float)):
        total = loaded + len(stocks)
    has_more = (
        bool(cursor)
        and loaded + len(stocks) < MAX_TAKE
        and len(stocks) > 0
    )
    page = {
        "stocks": stocks,
        "nextKey": cursor if has_more else None,
        "hasMore": has_more,
        "total": min(int(total), MAX_TAKE),
        "source": "futu",
    }
    await cache_set(cache_key, json.dumps(page), 30)
    return page
