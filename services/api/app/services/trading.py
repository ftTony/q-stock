from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.ids import new_id
from app.models.paper import PaperAccount, PaperOrder, PaperPosition, PaperRiskSettings
from app.services.market.facade import get_quote
from app.services.market.symbols import normalize_symbol

INITIAL_CASH = Decimal("100000")


def _dec(n: float | int | Decimal | None) -> Decimal | None:
    if n is None:
        return None
    return Decimal(str(n))


def serialize_account(account: PaperAccount) -> dict:
    return {
        "id": account.id,
        "userId": account.userId,
        "cashBalance": float(account.cashBalance),
        "currency": account.currency,
        "createdAt": account.createdAt,
        "updatedAt": account.updatedAt,
    }


def serialize_order(order: PaperOrder, strategy_name: str | None = None) -> dict:
    return {
        "id": order.id,
        "userId": order.userId,
        "symbol": order.symbol,
        "assetType": order.assetType,
        "side": order.side,
        "type": order.type,
        "qty": float(order.qty),
        "limitPrice": float(order.limitPrice) if order.limitPrice is not None else None,
        "stopPrice": float(order.stopPrice) if order.stopPrice is not None else None,
        "status": order.status,
        "filledPrice": float(order.filledPrice) if order.filledPrice is not None else None,
        "filledAt": order.filledAt.isoformat() if order.filledAt else None,
        "rejectReason": order.rejectReason,
        "emotionTags": order.emotionTags or [],
        "invalidationNote": order.invalidationNote,
        "strategyId": order.strategyId,
        "riskSnapshot": order.riskSnapshot,
        "strategyName": strategy_name,
        "createdAt": order.createdAt,
        "updatedAt": order.updatedAt,
    }


def serialize_position(pos: PaperPosition) -> dict:
    return {
        "id": pos.id,
        "userId": pos.userId,
        "symbol": pos.symbol,
        "assetType": pos.assetType,
        "qty": float(pos.qty),
        "avgCost": float(pos.avgCost),
        "createdAt": pos.createdAt,
        "updatedAt": pos.updatedAt,
    }


async def ensure_account(db: AsyncSession, user_id: str) -> PaperAccount:
    res = await db.execute(select(PaperAccount).where(PaperAccount.userId == user_id))
    account = res.scalar_one_or_none()
    if account:
        return account
    now = datetime.now(timezone.utc)
    account = PaperAccount(
        id=new_id(),
        userId=user_id,
        cashBalance=INITIAL_CASH,
        currency="USD",
        createdAt=now,
        updatedAt=now,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


async def reset_account(db: AsyncSession, user_id: str) -> PaperAccount:
    await ensure_account(db, user_id)
    orders = await db.execute(select(PaperOrder).where(PaperOrder.userId == user_id))
    for o in orders.scalars():
        await db.delete(o)
    positions = await db.execute(select(PaperPosition).where(PaperPosition.userId == user_id))
    for p in positions.scalars():
        await db.delete(p)
    account = await ensure_account(db, user_id)
    account.cashBalance = INITIAL_CASH
    await db.commit()
    await db.refresh(account)
    return account


async def _apply_fill(
    db: AsyncSession,
    *,
    user_id: str,
    symbol: str,
    asset_type: str,
    side: str,
    qty: Decimal,
    fill_price: Decimal,
    order: PaperOrder,
) -> PaperOrder:
    account = await ensure_account(db, user_id)
    notional = qty * fill_price
    if side == "buy":
        if float(account.cashBalance) + 1e-8 < float(notional):
            raise AppError("Insufficient cash", code="INSUFFICIENT_CASH", status_code=400)
        account.cashBalance = Decimal(account.cashBalance) - notional
        res = await db.execute(
            select(PaperPosition).where(
                PaperPosition.userId == user_id,
                PaperPosition.symbol == symbol,
                PaperPosition.assetType == asset_type,
            )
        )
        pos = res.scalar_one_or_none()
        if pos:
            total_qty = Decimal(pos.qty) + qty
            pos.avgCost = ((Decimal(pos.avgCost) * Decimal(pos.qty)) + notional) / total_qty
            pos.qty = total_qty
        else:
            now = datetime.now(timezone.utc)
            db.add(
                PaperPosition(
                    id=new_id(),
                    userId=user_id,
                    symbol=symbol,
                    assetType=asset_type,
                    qty=qty,
                    avgCost=fill_price,
                    createdAt=now,
                    updatedAt=now,
                )
            )
    else:
        res = await db.execute(
            select(PaperPosition).where(
                PaperPosition.userId == user_id,
                PaperPosition.symbol == symbol,
                PaperPosition.assetType == asset_type,
            )
        )
        pos = res.scalar_one_or_none()
        held = Decimal(pos.qty) if pos else Decimal("0")
        if float(held) + 1e-8 < float(qty):
            raise AppError("Insufficient position", code="INSUFFICIENT_POSITION", status_code=400)
        account.cashBalance = Decimal(account.cashBalance) + notional
        remaining = held - qty
        if remaining <= Decimal("0"):
            await db.delete(pos)
        else:
            pos.qty = remaining

    order.status = "filled"
    order.filledPrice = fill_price
    order.filledAt = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(order)
    return order


async def place_order(
    db: AsyncSession,
    *,
    user_id: str,
    symbol: str,
    asset_type: str,
    side: str,
    order_type: str,
    qty: float,
    limit_price: float | None = None,
    stop_price: float | None = None,
    emotion_tags: list[str] | None = None,
    invalidation_note: str | None = None,
    strategy_id: str | None = None,
    risk_snapshot: dict | None = None,
) -> PaperOrder:
    if not (qty > 0):
        raise AppError("Invalid quantity", code="INVALID_QTY", status_code=400)
    sym = normalize_symbol(symbol, asset_type)
    q = _dec(qty) or Decimal("0")
    await ensure_account(db, user_id)

    if order_type == "limit" and not (limit_price and limit_price > 0):
        raise AppError("limitPrice required", code="INVALID_LIMIT", status_code=400)
    if order_type == "stop" and not (stop_price and stop_price > 0):
        raise AppError("stopPrice required", code="INVALID_STOP", status_code=400)

    now = datetime.now(timezone.utc)
    order = PaperOrder(
        id=new_id(),
        userId=user_id,
        symbol=sym,
        assetType=asset_type,
        side=side,
        type=order_type,
        qty=q,
        limitPrice=_dec(limit_price),
        stopPrice=_dec(stop_price),
        status="pending",
        emotionTags=emotion_tags or [],
        invalidationNote=invalidation_note,
        strategyId=strategy_id,
        riskSnapshot=risk_snapshot,
        createdAt=now,
        updatedAt=now,
    )
    db.add(order)
    await db.flush()

    if order_type == "market":
        quote = await get_quote(sym, asset_type)
        fill_price = _dec(quote["price"]) or Decimal("0")
        if fill_price <= 0:
            raise AppError("Invalid market price", code="NO_QUOTE", status_code=400)
        return await _apply_fill(
            db,
            user_id=user_id,
            symbol=sym,
            asset_type=asset_type,
            side=side,
            qty=q,
            fill_price=fill_price,
            order=order,
        )

    await db.commit()
    await db.refresh(order)
    return order


def should_trigger_pending(
    *,
    order_type: str,
    side: str,
    price: float,
    limit_price: float | None,
    stop_price: float | None,
) -> bool:
    if order_type == "limit":
        if limit_price is None:
            return False
        return price <= limit_price if side == "buy" else price >= limit_price
    if order_type == "stop":
        if stop_price is None:
            return False
        return price >= stop_price if side == "buy" else price <= stop_price
    return False


async def fill_pending_order(
    db: AsyncSession, order_id: str, fill_price: float
) -> PaperOrder | None:
    order = await db.get(PaperOrder, order_id)
    if not order or order.status != "pending":
        return None
    return await _apply_fill(
        db,
        user_id=order.userId,
        symbol=order.symbol,
        asset_type=order.assetType,
        side=order.side,
        qty=Decimal(order.qty),
        fill_price=_dec(fill_price) or Decimal("0"),
        order=order,
    )


async def cancel_order(db: AsyncSession, user_id: str, order_id: str) -> PaperOrder:
    order = await db.get(PaperOrder, order_id)
    if not order or order.userId != user_id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    if order.status != "pending":
        raise AppError("Order not cancellable", code="NOT_CANCELLABLE", status_code=400)
    order.status = "cancelled"
    await db.commit()
    await db.refresh(order)
    return order


async def get_or_create_risk(db: AsyncSession, user_id: str) -> PaperRiskSettings:
    settings = await db.get(PaperRiskSettings, user_id)
    if settings:
        return settings
    settings = PaperRiskSettings(userId=user_id)
    db.add(settings)
    await db.commit()
    await db.refresh(settings)
    return settings
