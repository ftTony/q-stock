"""Advanced market routes: depth / trades / capital / short / options / warrants."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, get_optional_user
from app.core.db import get_db
from app.models.user import User
from app.services.market import advanced as adv
from app.services.market.advanced_gate import (
    ADVANCED_QUOTES_REQUIRED,
    can_use_advanced_quotes,
)
from app.services.market.context import market_store_for_user

router = APIRouter(prefix="/market", dependencies=[Depends(enforce_rate_limit)])


def _parse_asset(asset_type: str | None) -> str:
    if asset_type in {"stock", "hk", "crypto", "cn"}:
        return asset_type
    return "stock"


async def _store(db: AsyncSession, user: User | None) -> dict | None:
    return await market_store_for_user(db, user)


@router.get("/depth")
async def depth(
    symbol: str = Query(...),
    assetType: str | None = None,
    levels: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> Any:
    asset_type = _parse_asset(assetType)
    if asset_type == "crypto":
        return {"bids": [], "asks": [], "unavailable": True}
    store = await _store(db, user)
    if not can_use_advanced_quotes(store):
        return JSONResponse(
            status_code=403,
            content={
                "bids": [],
                "asks": [],
                "unavailable": True,
                "code": ADVANCED_QUOTES_REQUIRED,
            },
        )
    return await adv.get_depth(symbol, asset_type, store=store, levels=levels)


@router.get("/trades")
async def trades(
    symbol: str = Query(...),
    assetType: str | None = None,
    count: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> Any:
    asset_type = _parse_asset(assetType)
    if asset_type == "crypto":
        return {"trades": [], "unavailable": True}
    store = await _store(db, user)
    if not can_use_advanced_quotes(store):
        return JSONResponse(
            status_code=403,
            content={
                "trades": [],
                "unavailable": True,
                "code": ADVANCED_QUOTES_REQUIRED,
            },
        )
    return await adv.get_trades(symbol, asset_type, store=store, count=count)


@router.get("/capital")
async def capital(
    symbol: str = Query(...),
    assetType: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    store = await _store(db, user)
    return await adv.get_capital(symbol, asset_type, store=store)


@router.get("/short")
async def short_interest(
    symbol: str = Query(...),
    assetType: str | None = None,
    count: int = Query(default=30, ge=1, le=60),
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    store = await _store(db, user)
    return await adv.get_short(symbol, asset_type, store=store, count=count)


@router.get("/options")
async def options(
    symbol: str = Query(...),
    assetType: str | None = None,
    expiry: str | None = None,
    spot: float = 0,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    store = await _store(db, user)
    return await adv.get_options(
        symbol, asset_type, expiry=expiry, spot=spot, store=store
    )


@router.get("/warrants")
async def warrants(
    symbol: str = Query(...),
    assetType: str | None = None,
    types: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    store = await _store(db, user)
    type_list = [t.strip() for t in (types or "").split(",") if t.strip()] or None
    return await adv.get_warrants(symbol, asset_type, types=type_list, store=store)
