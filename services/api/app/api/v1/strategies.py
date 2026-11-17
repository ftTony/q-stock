from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, get_optional_user, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.core.ids import new_id
from app.models.strategy import Strategy, StrategyReplay
from app.models.user import User

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])
DAILY_LIMIT = 20
MAX_RANGE_DAYS = 365 * 5


class CreateStrategyBody(BaseModel):
    name: str | None = Field(default=None, max_length=80)
    description: str | None = Field(default=None, max_length=500)
    rules: dict | None = None
    fromTemplateId: str | None = None


class PatchStrategyBody(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=500)
    rules: dict | None = None


class ReplayBody(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    assetType: str
    rangeFrom: str
    rangeTo: str
    slipBps: float | None = Field(default=None, ge=0, le=50)
    initialCash: float | None = Field(default=None, ge=1000, le=1_000_000)


def serialize_strategy(s: Strategy) -> dict:
    return {
        "id": s.id,
        "userId": s.userId,
        "slug": s.slug,
        "name": s.name,
        "description": s.description,
        "rules": s.rules,
        "isTemplate": s.isTemplate,
        "createdAt": s.createdAt,
        "updatedAt": s.updatedAt,
    }


def serialize_replay(r: StrategyReplay) -> dict:
    return {
        "id": r.id,
        "userId": r.userId,
        "strategyId": r.strategyId,
        "symbol": r.symbol,
        "assetType": r.assetType,
        "rangeFrom": r.rangeFrom,
        "rangeTo": r.rangeTo,
        "assumptions": r.assumptions,
        "status": r.status,
        "result": r.result,
        "error": r.error,
        "shareToken": r.shareToken,
        "shared": bool(r.shareToken),
        "createdAt": r.createdAt,
        "updatedAt": r.updatedAt,
    }


@router.get("/strategies")
async def list_strategies(
    mine: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    if mine == "1":
        if not user:
            raise AppError("Unauthorized", code="UNAUTHORIZED", status_code=401)
        res = await db.execute(
            select(Strategy)
            .where(Strategy.userId == user.id, Strategy.isTemplate.is_(False))
            .order_by(Strategy.updatedAt.desc())
            .limit(50)
        )
        return {"strategies": [serialize_strategy(s) for s in res.scalars()]}

    templates = await db.execute(
        select(Strategy)
        .where(Strategy.isTemplate.is_(True))
        .order_by(Strategy.slug.asc())
        .limit(20)
    )
    mine_list: list[Strategy] = []
    if user:
        mine_res = await db.execute(
            select(Strategy)
            .where(Strategy.userId == user.id, Strategy.isTemplate.is_(False))
            .order_by(Strategy.updatedAt.desc())
            .limit(50)
        )
        mine_list = list(mine_res.scalars())
    return {
        "templates": [serialize_strategy(s) for s in templates.scalars()],
        "strategies": [serialize_strategy(s) for s in mine_list],
    }


@router.post("/strategies", status_code=201)
async def create_strategy(
    body: CreateStrategyBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if not body.fromTemplateId and not body.rules:
        raise AppError("rules or fromTemplateId required", code="VALIDATION_ERROR", status_code=400)

    rules = body.rules
    description = body.description
    name = body.name or "My strategy"

    if body.fromTemplateId:
        tpl = await db.get(Strategy, body.fromTemplateId)
        if not tpl or not tpl.isTemplate:
            raise AppError("Template not found", code="NOT_FOUND", status_code=404)
        rules = tpl.rules if isinstance(tpl.rules, dict) else body.rules
        if not description:
            description = tpl.description
        if not body.name:
            name = f"{tpl.name} (copy)"

    if not rules:
        raise AppError("Invalid rules", code="VALIDATION_ERROR", status_code=400)

    count = await db.scalar(
        select(func.count())
        .select_from(Strategy)
        .where(Strategy.userId == user.id, Strategy.isTemplate.is_(False))
    )
    if int(count or 0) >= 50:
        raise AppError("Strategy limit reached", code="STRATEGY_LIMIT", status_code=400)

    now = datetime.now(timezone.utc)
    strategy = Strategy(
        id=new_id(),
        userId=user.id,
        name=name,
        description=description,
        rules=rules,
        isTemplate=False,
        createdAt=now,
        updatedAt=now,
    )
    db.add(strategy)
    await db.commit()
    await db.refresh(strategy)
    return {"strategy": serialize_strategy(strategy)}


@router.get("/strategies/replays")
async def list_all_replays(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    res = await db.execute(
        select(StrategyReplay)
        .where(StrategyReplay.userId == user.id)
        .order_by(StrategyReplay.createdAt.desc())
        .limit(50)
    )
    return {"replays": [serialize_replay(r) for r in res.scalars()]}


@router.get("/strategies/{strategy_id}")
async def get_strategy(
    strategy_id: str,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    strategy = await db.get(Strategy, strategy_id)
    if not strategy:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    if not strategy.isTemplate and (not user or strategy.userId != user.id):
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    return {"strategy": serialize_strategy(strategy)}


@router.patch("/strategies/{strategy_id}")
async def patch_strategy(
    strategy_id: str,
    body: PatchStrategyBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    strategy = await db.get(Strategy, strategy_id)
    if not strategy or strategy.isTemplate or strategy.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(strategy, k, v)
    await db.commit()
    await db.refresh(strategy)
    return {"strategy": serialize_strategy(strategy)}


@router.delete("/strategies/{strategy_id}")
async def delete_strategy(
    strategy_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    strategy = await db.get(Strategy, strategy_id)
    if not strategy or strategy.isTemplate or strategy.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    await db.delete(strategy)
    await db.commit()
    return {"ok": True}


@router.get("/strategies/{strategy_id}/replay")
async def list_replays(
    strategy_id: str,
    replayId: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    day_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = await db.scalar(
        select(func.count())
        .select_from(StrategyReplay)
        .where(StrategyReplay.userId == user.id, StrategyReplay.createdAt >= day_start)
    )
    quota = {"used": int(today_count or 0), "limit": DAILY_LIMIT}
    if replayId:
        replay = await db.get(StrategyReplay, replayId)
        if not replay or replay.userId != user.id or replay.strategyId != strategy_id:
            raise AppError("Not found", code="NOT_FOUND", status_code=404)
        return {"replay": serialize_replay(replay), "quota": quota}
    res = await db.execute(
        select(StrategyReplay)
        .where(StrategyReplay.userId == user.id, StrategyReplay.strategyId == strategy_id)
        .order_by(StrategyReplay.createdAt.desc())
        .limit(20)
    )
    return {"replays": [serialize_replay(r) for r in res.scalars()], "quota": quota}


@router.post("/strategies/{strategy_id}/replay", status_code=201)
async def enqueue_replay(
    strategy_id: str,
    body: ReplayBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.assetType not in {"stock", "hk", "crypto", "cn"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    strategy = await db.execute(
        select(Strategy).where(
            Strategy.id == strategy_id,
            or_(Strategy.isTemplate.is_(True), Strategy.userId == user.id),
        )
    )
    strat = strategy.scalar_one_or_none()
    if not strat:
        raise AppError("Strategy not found", code="NOT_FOUND", status_code=404)

    try:
        range_from = datetime.fromisoformat(body.rangeFrom.replace("Z", "+00:00"))
        range_to = datetime.fromisoformat(body.rangeTo.replace("Z", "+00:00"))
    except ValueError as exc:
        raise AppError("Invalid date range", code="VALIDATION_ERROR", status_code=400) from exc
    if range_from >= range_to:
        raise AppError("Invalid date range", code="VALIDATION_ERROR", status_code=400)
    if (range_to - range_from).total_seconds() > MAX_RANGE_DAYS * 86400:
        raise AppError("Range too long (max 5 years)", code="RANGE_TOO_LONG", status_code=400)

    day_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = await db.scalar(
        select(func.count())
        .select_from(StrategyReplay)
        .where(StrategyReplay.userId == user.id, StrategyReplay.createdAt >= day_start)
    )
    used = int(today_count or 0)
    if used >= DAILY_LIMIT:
        raise AppError(
            "Daily replay limit reached",
            code="daily_limit",
            status_code=429,
            details={"used": used, "limit": DAILY_LIMIT},
        )
    running = await db.scalar(
        select(func.count())
        .select_from(StrategyReplay)
        .where(
            StrategyReplay.userId == user.id,
            StrategyReplay.status.in_(["pending", "running"]),
        )
    )
    if int(running or 0) >= 1:
        raise AppError("A replay is already queued", code="queued", status_code=429)

    now = datetime.now(timezone.utc)
    replay = StrategyReplay(
        id=new_id(),
        userId=user.id,
        strategyId=strategy_id,
        symbol=body.symbol.upper(),
        assetType=body.assetType,
        rangeFrom=range_from,
        rangeTo=range_to,
        assumptions={
            "fill": "signal_close",
            "slipBps": body.slipBps if body.slipBps is not None else 5,
            "initialCash": body.initialCash if body.initialCash is not None else 100_000,
        },
        status="pending",
        createdAt=now,
        updatedAt=now,
    )
    db.add(replay)
    await db.commit()
    await db.refresh(replay)
    return {
        "replay": serialize_replay(replay),
        "quota": {"used": used + 1, "limit": DAILY_LIMIT},
    }
