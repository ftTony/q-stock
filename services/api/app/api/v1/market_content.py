"""Content / board routes: ranks, indices, news, company, etc."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, get_optional_user
from app.core.db import get_db
from app.models.user import User
from app.services.market import content as content_svc
from app.services.market.context import market_store_for_user

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])


def _parse_asset(asset_type: str | None) -> str:
    if asset_type in {"stock", "hk", "crypto", "cn"}:
        return asset_type
    return "stock"


@router.get("/ranks")
async def ranks(
    assetType: str | None = None,
    board: str | None = None,
    limit: int = Query(default=15, ge=5, le=50),
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    asset_type = _parse_asset(assetType)
    store = await market_store_for_user(db, user)
    data = await content_svc.resolve_ranks(asset_type, limit, store=store)
    boards = data.get("boards") or {"hot": [], "gainers": [], "losers": []}
    if board in {"hot", "gainers", "losers"}:
        return {
            "quotes": boards.get(board) or [],
            "board": board,
            "source": data.get("source"),
            "degraded": data.get("degraded"),
        }
    return data


@router.get("/industry-ranks")
async def industry_ranks(
    assetType: str | None = None,
    limit: int = Query(default=40, ge=10, le=60),
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    store = await market_store_for_user(db, user)
    return await content_svc.resolve_industry_ranks(
        _parse_asset(assetType), limit, store=store
    )


@router.get("/indices")
async def indices(
    assetType: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    store = await market_store_for_user(db, user)
    return await content_svc.resolve_indices(_parse_asset(assetType), store=store)


@router.get("/ipo")
async def ipo(
    assetType: str | None = None,
    status: str | None = None,
    limit: int = Query(default=4, ge=4, le=20),
    _user: User | None = Depends(get_optional_user),
) -> dict:
    return await content_svc.resolve_ipo(_parse_asset(assetType), status=status, limit=limit)


@router.get("/earnings")
async def earnings(
    symbol: str = Query(...),
    assetType: str | None = None,
    scope: str | None = None,
    _user: User | None = Depends(get_optional_user),
) -> dict:
    return await content_svc.resolve_earnings(
        symbol, _parse_asset(assetType), scope=scope
    )


@router.get("/company")
async def company(
    symbol: str = Query(...),
    assetType: str | None = None,
    locale: str | None = None,
    _user: User | None = Depends(get_optional_user),
) -> dict:
    return await content_svc.resolve_company(
        symbol, _parse_asset(assetType), locale=locale
    )


@router.get("/news")
async def news(
    symbol: str | None = None,
    assetType: str | None = None,
    locale: str | None = None,
    limit: int = Query(default=40, ge=1, le=60),
    _user: User | None = Depends(get_optional_user),
) -> dict:
    return await content_svc.resolve_news(
        symbol, _parse_asset(assetType), limit=limit, locale=locale
    )


@router.get("/press")
async def press(
    symbol: str = Query(...),
    assetType: str | None = None,
    locale: str | None = None,
    limit: int = Query(default=40, ge=1, le=60),
    _user: User | None = Depends(get_optional_user),
) -> dict:
    return await content_svc.resolve_press(
        symbol, _parse_asset(assetType), limit=limit, locale=locale
    )


@router.get("/sentiment")
async def sentiment(
    symbol: str | None = None,
    assetType: str | None = None,
    _user: User | None = Depends(get_optional_user),
) -> dict:
    return await content_svc.resolve_sentiment(symbol, _parse_asset(assetType))
