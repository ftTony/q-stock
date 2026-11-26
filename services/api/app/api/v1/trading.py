from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.models.paper import PaperOrder, PaperPosition
from app.models.strategy import Strategy
from app.models.user import User
from app.services import trading as trading_svc

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])

DEFAULT_RISK_SETTINGS = {
    "maxPositionPctPerSymbol": 20,
    "maxGrossExposurePct": 80,
    "maxDailyLossPct": 5,
    "maxOrderNotionalPct": None,
    "softOnly": True,
    "requireEmotionCheck": False,
}


class PlaceOrderBody(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    assetType: str
    side: str
    type: str
    qty: float
    limitPrice: float | None = None
    stopPrice: float | None = None
    emotionTags: list[str] | None = None
    invalidationNote: str | None = None
    strategyId: str | None = None
    riskSnapshot: dict | None = None


class ModifyOrderBody(BaseModel):
    id: str = Field(min_length=1)
    qty: float
    limitPrice: float | None = None
    stopPrice: float | None = None


class PatchRiskBody(BaseModel):
    maxPositionPctPerSymbol: float | None = Field(default=None, ge=1, le=100)
    maxGrossExposurePct: float | None = Field(default=None, ge=1, le=200)
    maxDailyLossPct: float | None = Field(default=None, ge=0.5, le=50)
    maxOrderNotionalPct: float | None = Field(default=None, ge=1, le=100)
    softOnly: bool | None = None
    requireEmotionCheck: bool | None = None


def _risk_dict(s) -> dict:
    return {
        "userId": s.userId,
        "maxPositionPctPerSymbol": s.maxPositionPctPerSymbol,
        "maxGrossExposurePct": s.maxGrossExposurePct,
        "maxDailyLossPct": s.maxDailyLossPct,
        "maxOrderNotionalPct": s.maxOrderNotionalPct,
        "softOnly": s.softOnly,
        "requireEmotionCheck": s.requireEmotionCheck,
        "updatedAt": s.updatedAt,
    }


@router.get("/account")
async def get_account(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    account = await trading_svc.ensure_account(db, user.id)
    return {"account": trading_svc.serialize_account(account)}


@router.post("/account")
async def reset_account(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    account = await trading_svc.reset_account(db, user.id)
    return {"account": trading_svc.serialize_account(account)}


@router.get("/orders")
async def list_orders(
    status: str | None = None,
    symbol: str | None = None,
    assetType: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    await trading_svc.ensure_account(db, user.id)
    stmt = select(PaperOrder).where(PaperOrder.userId == user.id)
    if status:
        stmt = stmt.where(PaperOrder.status == status)
    if symbol:
        stmt = stmt.where(PaperOrder.symbol == symbol.upper())
    if assetType in {"stock", "hk", "crypto", "cn"}:
        stmt = stmt.where(PaperOrder.assetType == assetType)
    stmt = stmt.order_by(PaperOrder.createdAt.desc()).limit(100)
    res = await db.execute(stmt)
    orders = list(res.scalars())
    out = []
    for o in orders:
        name = None
        if o.strategyId:
            strat = await db.get(Strategy, o.strategyId)
            name = strat.name if strat else None
        out.append(trading_svc.serialize_order(o, name))
    return {"orders": out}


@router.post("/orders", status_code=201)
async def place_order(
    body: PlaceOrderBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.assetType not in {"stock", "hk", "crypto", "cn"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    if body.side not in {"buy", "sell"} or body.type not in {"market", "limit", "stop"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    order = await trading_svc.place_order(
        db,
        user_id=user.id,
        symbol=body.symbol,
        asset_type=body.assetType,
        side=body.side,
        order_type=body.type,
        qty=body.qty,
        limit_price=body.limitPrice,
        stop_price=body.stopPrice,
        emotion_tags=body.emotionTags,
        invalidation_note=body.invalidationNote,
        strategy_id=body.strategyId,
        risk_snapshot=body.riskSnapshot,
    )
    return {"order": trading_svc.serialize_order(order)}


@router.patch("/orders")
async def modify_order(
    body: ModifyOrderBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if not (body.qty > 0):
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    order = await trading_svc.modify_order(
        db,
        user_id=user.id,
        order_id=body.id,
        qty=body.qty,
        limit_price=body.limitPrice,
        stop_price=body.stopPrice,
    )
    return {"order": trading_svc.serialize_order(order)}


@router.delete("/orders")
async def cancel_order(
    id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    order = await trading_svc.cancel_order(db, user.id, id)
    return {"order": trading_svc.serialize_order(order)}


@router.get("/positions")
async def list_positions(
    quotes: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    from app.services.market.facade import get_quotes

    await trading_svc.ensure_account(db, user.id)
    res = await db.execute(
        select(PaperPosition)
        .where(PaperPosition.userId == user.id)
        .order_by(PaperPosition.updatedAt.desc())
        .limit(80)
    )
    positions = list(res.scalars())
    quote_map: dict[str, float] = {}
    if quotes == "1" and positions:
        try:
            qlist = await get_quotes(
                [{"symbol": p.symbol, "assetType": p.assetType} for p in positions]
            )
            for q in qlist:
                price = float(q.get("price") or 0)
                if price > 0:
                    quote_map[f"{q['assetType']}:{q['symbol']}"] = price
        except Exception:  # noqa: BLE001
            quote_map = {}

    items = []
    for p in positions:
        qty = float(p.qty)
        avg_cost = float(p.avgCost)
        price = quote_map.get(f"{p.assetType}:{p.symbol}")
        market_value = qty * price if price is not None else None
        cost = qty * avg_cost
        unrealized = (market_value - cost) if market_value is not None else None
        unrealized_pct = (
            (unrealized / cost) * 100 if unrealized is not None and cost > 0 else None
        )
        items.append(
            {
                "id": p.id,
                "symbol": p.symbol,
                "assetType": p.assetType,
                "qty": qty,
                "avgCost": avg_cost,
                "price": price if price is not None else None,
                "marketValue": market_value,
                "unrealizedPnl": unrealized,
                "unrealizedPnlPct": unrealized_pct,
                "createdAt": p.createdAt,
                "updatedAt": p.updatedAt,
            }
        )
    return {"positions": items}


@router.get("/risk-settings")
async def get_risk(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    settings = await trading_svc.get_or_create_risk(db, user.id)
    account = await trading_svc.ensure_account(db, user.id)
    day_pnl_pct = None
    day_start = float(account.dayStartEquity) if account.dayStartEquity is not None else None
    if day_start and day_start > 0:
        res = await db.execute(
            select(PaperPosition).where(PaperPosition.userId == user.id).limit(80)
        )
        gross = sum(float(p.qty) * float(p.avgCost) for p in res.scalars())
        equity = float(account.cashBalance) + gross
        day_pnl_pct = ((equity - day_start) / day_start) * 100
    return {
        "settings": _risk_dict(settings),
        "defaults": DEFAULT_RISK_SETTINGS,
        "account": trading_svc.serialize_account(account),
        "dayPnlPct": day_pnl_pct,
        "circuitBroken": day_pnl_pct is not None
        and day_pnl_pct <= -abs(settings.maxDailyLossPct),
    }


@router.patch("/risk-settings")
async def patch_risk(
    body: PatchRiskBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    settings = await trading_svc.get_or_create_risk(db, user.id)
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(settings, k, v)
    await db.commit()
    await db.refresh(settings)
    return {"settings": _risk_dict(settings)}
