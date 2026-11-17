from __future__ import annotations

import time

from fastapi import APIRouter, Depends, Query

from app.api.deps import enforce_rate_limit, get_optional_user
from app.core.errors import AppError
from app.models.user import User
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
    assetType: str | None = None,
    popular: str | None = None,
    _user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    if popular == "1":
        if asset_type == "crypto":
            items = [{"symbol": s, "assetType": "crypto"} for s in POPULAR_CRYPTO]
        elif asset_type == "hk":
            items = [{"symbol": s, "assetType": "hk"} for s in POPULAR_HK]
        elif asset_type == "cn":
            items = [{"symbol": s, "assetType": "cn"} for s in POPULAR_CN]
        else:
            items = [{"symbol": s, "assetType": "stock"} for s in POPULAR_STOCKS]
        return {"quotes": await get_quotes(items)}
    if not symbol:
        raise AppError("symbol required", code="VALIDATION_ERROR", status_code=400)
    quote = await get_quote(symbol, asset_type)
    return {"quote": quote}


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
