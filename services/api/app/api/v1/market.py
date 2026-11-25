from __future__ import annotations

import time

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, get_optional_user
from app.core.db import get_db
from app.core.errors import AppError
from app.models.user import User
from app.services.market.analysis_calc import get_analysis_calc_enrich
from app.services.market.context import market_store_for_user
from app.services.market.facade import get_candles, get_quote, get_quotes, search_symbols
from app.services.market.symbols import (
    POPULAR_CN,
    POPULAR_CRYPTO,
    POPULAR_HK,
    POPULAR_STOCKS,
)

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])


def _parse_asset(asset_type: str | None) -> str:
    if asset_type in {"stock", "hk", "crypto", "cn"}:
        return asset_type
    return "stock"


@router.get("/quotes")
async def quotes(
    symbol: str | None = None,
    symbols: str | None = None,
    assetType: str | None = None,
    popular: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    store = await market_store_for_user(db, user)
    if popular == "1":
        if asset_type == "crypto":
            items = [{"symbol": s, "assetType": "crypto"} for s in POPULAR_CRYPTO]
        elif asset_type == "hk":
            items = [{"symbol": s, "assetType": "hk"} for s in POPULAR_HK]
        elif asset_type == "cn":
            items = [{"symbol": s, "assetType": "cn"} for s in POPULAR_CN]
        else:
            items = [{"symbol": s, "assetType": "stock"} for s in POPULAR_STOCKS]
        return {"quotes": await get_quotes(items, store=store)}
    if symbols:
        parts = [s.strip() for s in symbols.split(",") if s.strip()][:48]
        if not parts:
            raise AppError("symbols required", code="VALIDATION_ERROR", status_code=400)
        items = [{"symbol": s, "assetType": asset_type} for s in parts]
        return {"quotes": await get_quotes(items, store=store)}
    if not symbol:
        raise AppError("symbol required", code="VALIDATION_ERROR", status_code=400)
    quote = await get_quote(symbol, asset_type, store=store)
    return {"quote": quote}


@router.get("/quotes/calc")
async def quotes_calc(
    assetType: str | None = None,
    symbols: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    if not symbols:
        raise AppError("symbols required", code="VALIDATION_ERROR", status_code=400)
    parts = [s.strip() for s in symbols.split(",") if s.strip()][:48]
    if not parts:
        raise AppError("symbols required", code="VALIDATION_ERROR", status_code=400)
    store = await market_store_for_user(db, user)
    try:
        rows = await get_analysis_calc_enrich(parts, asset_type, store=store)
        return {"rows": rows}
    except Exception as exc:  # noqa: BLE001
        message = str(exc) or "Failed to fetch calc indexes"
        no_creds = "not configured" in message.lower() or "no market data" in message.lower()
        raise AppError(
            message,
            code="NO_CREDENTIALS" if no_creds else "UPSTREAM",
            status_code=503 if no_creds else 502,
        ) from exc


@router.get("/candles")
async def candles(
    symbol: str = Query(...),
    assetType: str | None = None,
    resolution: str = "D",
    from_: int | None = Query(default=None, alias="from"),
    to: int | None = None,
    _user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    now = int(time.time())
    to_ts = to if to and to <= now else now
    if from_ and from_ < to_ts:
        frm = from_
    elif resolution in {"T", "1"}:
        frm = to_ts - 2 * 24 * 3600
    elif resolution == "5":
        frm = to_ts - 5 * 24 * 3600
    else:
        frm = to_ts - 365 * 24 * 3600
    return await get_candles(symbol, asset_type, resolution=resolution, frm=frm, to=to_ts)


@router.get("/search")
async def search(
    q: str = "",
    assetType: str | None = None,
    _user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    results = await search_symbols(q, asset_type)
    return {"results": results}
