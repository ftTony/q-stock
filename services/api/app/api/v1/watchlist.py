from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.core.ids import new_id
from app.models.user import User
from app.models.watchlist import WatchlistGroup, WatchlistGroupMember, WatchlistItem
from app.services.entitlements import watchlist_limit
from app.services.market.facade import get_quotes
from app.services.market.symbols import normalize_symbol

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])
MAX_GROUPS = 30


class UpsertItem(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    assetType: str


class CreateGroup(BaseModel):
    name: str | None = Field(default=None, max_length=40)


class PatchGroup(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=40)
    sortOrder: int | None = None


class GroupItemBody(BaseModel):
    itemId: str


def _counts(items: list[WatchlistItem]) -> dict:
    return {
        "stock": sum(1 for i in items if i.assetType == "stock"),
        "hk": sum(1 for i in items if i.assetType == "hk"),
        "crypto": sum(1 for i in items if i.assetType == "crypto"),
        "cn": sum(1 for i in items if i.assetType == "cn"),
        "total": len(items),
    }


def _item_dict(i: WatchlistItem, quote=None) -> dict:
    d = {
        "id": i.id,
        "userId": i.userId,
        "symbol": i.symbol,
        "assetType": i.assetType,
        "createdAt": i.createdAt,
    }
    if quote is not None:
        d["quote"] = quote
    return d


@router.get("/watchlist")
async def list_watchlist(
    quotes: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    res = await db.execute(
        select(WatchlistItem)
        .where(WatchlistItem.userId == user.id)
        .order_by(WatchlistItem.createdAt.desc())
        .limit(200)
    )
    items = list(res.scalars())
    if quotes != "1":
        return {"items": [_item_dict(i) for i in items], "counts": _counts(items)}

    quote_list = await get_quotes(
        [{"symbol": i.symbol, "assetType": i.assetType} for i in items[:80]]
    )
    qmap = {f"{q['assetType']}:{q['symbol']}": q for q in quote_list}
    return {
        "items": [
            _item_dict(i, qmap.get(f"{i.assetType}:{i.symbol}"))
            for i in items
        ],
        "counts": _counts(items),
    }


@router.post("/watchlist", status_code=201)
async def upsert_watchlist(
    body: UpsertItem,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.assetType not in {"stock", "hk", "crypto", "cn"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    symbol = normalize_symbol(body.symbol, body.assetType)
    res = await db.execute(
        select(WatchlistItem).where(
            WatchlistItem.userId == user.id,
            WatchlistItem.symbol == symbol,
            WatchlistItem.assetType == body.assetType,
        )
    )
    existing = res.scalar_one_or_none()
    if not existing:
        count = await db.scalar(
            select(func.count()).select_from(WatchlistItem).where(WatchlistItem.userId == user.id)
        )
        limit = await watchlist_limit(db, user)
        if int(count or 0) >= limit:
            raise AppError(
                "watchlist limit reached",
                code="PLAN_LIMIT_EXCEEDED",
                status_code=403,
                details={"kind": "watchlist", "limit": limit, "upgradePath": "/pricing"},
            )
        from datetime import datetime, timezone

        item = WatchlistItem(
            id=new_id(),
            userId=user.id,
            symbol=symbol,
            assetType=body.assetType,
            createdAt=datetime.now(timezone.utc),
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return {"item": _item_dict(item)}
    return {"item": _item_dict(existing)}


@router.delete("/watchlist")
async def delete_watchlist(
    id: str | None = None,
    symbol: str | None = None,
    assetType: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if id:
        item = await db.get(WatchlistItem, id)
        if not item or item.userId != user.id:
            raise AppError("Not found", code="NOT_FOUND", status_code=404)
        await db.delete(item)
        await db.commit()
        return {"ok": True}
    if symbol and assetType in {"stock", "hk", "crypto", "cn"}:
        normalized = normalize_symbol(symbol, assetType)
        res = await db.execute(
            select(WatchlistItem).where(
                WatchlistItem.userId == user.id,
                WatchlistItem.symbol == normalized,
                WatchlistItem.assetType == assetType,
            )
        )
        for item in res.scalars():
            await db.delete(item)
        await db.commit()
        return {"ok": True}
    raise AppError("id or symbol+assetType required", code="VALIDATION_ERROR", status_code=400)


@router.get("/watchlist/groups")
async def list_groups(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    res = await db.execute(
        select(WatchlistGroup)
        .where(WatchlistGroup.userId == user.id)
        .order_by(WatchlistGroup.sortOrder.asc(), WatchlistGroup.createdAt.asc())
        .limit(MAX_GROUPS)
    )
    groups = list(res.scalars())
    out = []
    for g in groups:
        count = await db.scalar(
            select(func.count())
            .select_from(WatchlistGroupMember)
            .where(WatchlistGroupMember.groupId == g.id)
        )
        out.append(
            {
                "id": g.id,
                "name": g.name,
                "sortOrder": g.sortOrder,
                "count": int(count or 0),
                "createdAt": g.createdAt,
            }
        )
    return {"groups": out}


@router.post("/watchlist/groups", status_code=201)
async def create_group(
    body: CreateGroup,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    count = await db.scalar(
        select(func.count()).select_from(WatchlistGroup).where(WatchlistGroup.userId == user.id)
    )
    if int(count or 0) >= MAX_GROUPS:
        raise AppError("Group limit reached", code="GROUP_LIMIT", status_code=400)
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    group = WatchlistGroup(
        id=new_id(),
        userId=user.id,
        name=(body.name or "新分组").strip() or "新分组",
        sortOrder=int(count or 0),
        createdAt=now,
        updatedAt=now,
    )
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return {
        "group": {
            "id": group.id,
            "name": group.name,
            "sortOrder": group.sortOrder,
            "count": 0,
            "createdAt": group.createdAt,
        }
    }


@router.get("/watchlist/groups/{group_id}")
async def get_group(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    group = await db.get(WatchlistGroup, group_id)
    if not group or group.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    res = await db.execute(
        select(WatchlistItem)
        .join(WatchlistGroupMember, WatchlistGroupMember.itemId == WatchlistItem.id)
        .where(WatchlistGroupMember.groupId == group_id)
    )
    items = list(res.scalars())
    return {
        "group": {
            "id": group.id,
            "name": group.name,
            "sortOrder": group.sortOrder,
            "createdAt": group.createdAt,
        },
        "items": [_item_dict(i) for i in items],
    }


@router.patch("/watchlist/groups/{group_id}")
async def patch_group(
    group_id: str,
    body: PatchGroup,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    group = await db.get(WatchlistGroup, group_id)
    if not group or group.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    if body.name is not None:
        group.name = body.name.strip()
    if body.sortOrder is not None:
        group.sortOrder = body.sortOrder
    await db.commit()
    await db.refresh(group)
    return {
        "group": {
            "id": group.id,
            "name": group.name,
            "sortOrder": group.sortOrder,
            "createdAt": group.createdAt,
        }
    }


@router.delete("/watchlist/groups/{group_id}")
async def delete_group(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    group = await db.get(WatchlistGroup, group_id)
    if not group or group.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    await db.delete(group)
    await db.commit()
    return {"ok": True}


@router.post("/watchlist/groups/{group_id}/items", status_code=201)
async def add_group_item(
    group_id: str,
    body: GroupItemBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    group = await db.get(WatchlistGroup, group_id)
    if not group or group.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    item = await db.get(WatchlistItem, body.itemId)
    if not item or item.userId != user.id:
        raise AppError("Item not found", code="NOT_FOUND", status_code=404)
    existing = await db.execute(
        select(WatchlistGroupMember).where(
            WatchlistGroupMember.groupId == group_id,
            WatchlistGroupMember.itemId == body.itemId,
        )
    )
    if existing.scalar_one_or_none():
        return {"ok": True}
    db.add(WatchlistGroupMember(id=new_id(), groupId=group_id, itemId=body.itemId))
    await db.commit()
    return {"ok": True}


@router.delete("/watchlist/groups/{group_id}/items")
async def remove_group_item(
    group_id: str,
    itemId: str = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    group = await db.get(WatchlistGroup, group_id)
    if not group or group.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    res = await db.execute(
        select(WatchlistGroupMember).where(
            WatchlistGroupMember.groupId == group_id,
            WatchlistGroupMember.itemId == itemId,
        )
    )
    member = res.scalar_one_or_none()
    if member:
        await db.delete(member)
        await db.commit()
    return {"ok": True}
