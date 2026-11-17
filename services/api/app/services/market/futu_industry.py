"""Futu industry heatmap via plate-list + snapshot (+ plate-stock)."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from app.core.redis_client import cache_get, cache_set
from app.services.market.futu_http import futu_configured, futu_request
from app.services.market.symbols import normalize_symbol

log = logging.getLogger(__name__)


def _markets(asset_type: str) -> list[str]:
    if asset_type == "cn":
        return ["SH", "SZ"]
    if asset_type == "stock":
        return ["US"]
    if asset_type == "hk":
        return ["HK"]
    return []


def _pct(last: float, prev: float) -> float:
    if prev <= 0:
        return 0.0
    return ((last - prev) / prev) * 100


def _plate_name(plate: dict[str, Any], snap: dict[str, Any] | None) -> str:
    snap = snap or {}
    return (
        str(
            snap.get("sc_name")
            or plate.get("sc_name")
            or snap.get("name")
            or plate.get("plate_name")
            or plate.get("tc_name")
            or plate.get("code")
            or ""
        ).strip()
    )


async def _snapshot_codes(
    codes: list[str],
    *,
    store: dict[str, Any] | None,
) -> dict[str, dict[str, Any]]:
    by_code: dict[str, dict[str, Any]] = {}
    unique = list(dict.fromkeys(c for c in codes if c))
    chunk = 400
    for i in range(0, len(unique), chunk):
        part = unique[i : i + chunk]
        try:
            data = await futu_request(
                "POST",
                "/api/v1.0/quote/snapshot",
                body={"code_list": part},
                store=store,
            )
            for row in data.get("snapshot_list") or []:
                code = row.get("code")
                if code:
                    by_code[str(code)] = row
        except Exception as exc:  # noqa: BLE001
            log.warning("[futu-industry] snapshot failed: %s", exc)
    return by_code


async def get_futu_industry_heatmap(
    asset_type: str,
    limit: int = 40,
    *,
    store: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    if not futu_configured(store):
        return []
    markets = _markets(asset_type)
    if not markets:
        return []

    n = min(60, max(10, limit))
    cache_key = f"futu:industry:v1:{'+'.join(markets)}:{n}"
    cached = await cache_get(cache_key)
    if cached:
        try:
            rows = json.loads(cached)
            if isinstance(rows, list):
                return rows
        except Exception:  # noqa: BLE001
            pass

    plates_by_code: dict[str, dict[str, Any]] = {}
    for market in markets:
        try:
            data = await futu_request(
                "GET",
                "/api/v1.0/quote/plate-list",
                query={"market": market, "plate_class": "INDUSTRY"},
                store=store,
            )
            for p in data.get("plate_list") or []:
                code = str(p.get("code") or "").strip()
                if code and code not in plates_by_code:
                    plates_by_code[code] = p
        except Exception as exc:  # noqa: BLE001
            log.warning("[futu-industry] plate-list %s failed: %s", market, exc)

    plates = list(plates_by_code.values())
    if not plates:
        return []

    plate_snaps = await _snapshot_codes(
        [str(p["code"]) for p in plates if p.get("code")],
        store=store,
    )

    ranked: list[dict[str, Any]] = []
    for index, p in enumerate(plates):
        code = str(p.get("code") or "")
        snap = plate_snaps.get(code) or {}
        last = float(snap.get("last_price") or 0)
        prev = float(snap.get("prev_close_price") or 0)
        turnover = float(snap.get("turnover") or 0)
        cap = float(snap.get("total_market_val") or 0)
        name = _plate_name(p, snap)
        if not name:
            continue
        weight = cap if cap > 0 else (turnover if turnover > 0 else max(1, 1000 - index))
        ranked.append(
            {
                "plate": p,
                "cell": {
                    "id": code,
                    "name": name,
                    "percentChange": _pct(last, prev),
                    "weight": weight,
                    "volume": turnover if turnover > 0 else None,
                },
            }
        )

    ranked.sort(key=lambda r: float(r["cell"]["weight"]), reverse=True)
    ranked = ranked[:n]

    # Enrich top plates with member stocks (bounded concurrency via sequential for small-server).
    out: list[dict[str, Any]] = []
    for row in ranked:
        plate_code = str(row["plate"].get("code") or "")
        stocks: list[dict[str, Any]] = []
        try:
            stock_data = await futu_request(
                "GET",
                "/api/v1.0/quote/plate-stock",
                query={"plate_code": plate_code, "limit": 8},
                store=store,
            )
            members = (stock_data.get("stock_list") or [])[:8]
            codes = [str(m.get("code")) for m in members if m.get("code")]
            snaps = await _snapshot_codes(codes, store=store)
            for m in members:
                code = str(m.get("code") or "")
                if not code:
                    continue
                bare = re.sub(r"^(US|HK|SH|SZ|BJ)\.", "", code, flags=re.I)
                snap = snaps.get(code) or {}
                last = float(snap.get("last_price") or 0)
                prev = float(snap.get("prev_close_price") or 0)
                symbol = (
                    normalize_symbol(code, "cn")
                    if asset_type == "cn"
                    else normalize_symbol(bare, asset_type)
                )
                stocks.append(
                    {
                        "symbol": symbol,
                        "name": str(
                            m.get("sc_name")
                            or snap.get("sc_name")
                            or m.get("stock_name")
                            or snap.get("name")
                            or bare
                        ).strip(),
                        "price": last,
                        "percentChange": _pct(last, prev),
                    }
                )
        except Exception as exc:  # noqa: BLE001
            log.warning("[futu-industry] plate-stock %s: %s", plate_code, exc)
        cell = {**row["cell"], "stocks": stocks}
        out.append(cell)

    if out:
        await cache_set(cache_key, json.dumps(out), 120)
    return out
