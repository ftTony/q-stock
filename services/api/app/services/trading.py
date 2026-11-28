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
# Margin accounts may hold up to 2× equity in gross exposure.
MARGIN_LEVERAGE = 2
# Annual interest rate charged on outstanding margin borrowing.
MARGIN_INTEREST_APR = Decimal("0.08")
ACCOUNT_TYPES = ("cash", "margin")

_EPOCH = datetime(1970, 1, 1, tzinfo=timezone.utc)


def _parse_account_type(value: str | None) -> str:
    return "margin" if value == "margin" else "cash"


def _aware(dt: datetime | None) -> datetime:
    """Coerce a possibly-naive DB datetime to UTC-aware for arithmetic."""
    if dt is None:
        return _EPOCH
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _dec(n: float | int | Decimal | None) -> Decimal | None:
    if n is None:
        return None
    return Decimal(str(n))


def account_metrics(
    *, account_type: str, cash: Decimal, gross: Decimal, borrowed: Decimal, interest: Decimal
) -> dict[str, Decimal]:
    """Shared buying-power math for cash vs margin paper accounts.

    Cash book: buying power = cash. Margin book: total exposure may reach
    leverage × equity, so remaining buying power = maxExposure - gross.
    """
    equity = cash + gross - borrowed - interest
    leverage = Decimal(MARGIN_LEVERAGE) if account_type == "margin" else Decimal("1")
    max_exposure = equity * leverage
    # Cash cannot go negative: buying power is capped by cash on cash book.
    buying_power = (
        max(Decimal("0"), max_exposure - gross)
        if account_type == "margin"
        else max(Decimal("0"), cash)
    )
    return {
        "equity": equity,
        "leverage": leverage,
        "maxExposure": max_exposure,
        "buyingPower": buying_power,
    }


def accrue_interest(
    account_type: str,
    borrowed: Decimal,
    interest_accrued: Decimal,
    interest_accrued_at: datetime | None,
) -> tuple[Decimal, datetime | None]:
    """Daily interest on outstanding margin debt. No-op for cash accounts
    or when no borrowing exists. Call inside the caller's flow/transaction."""
    if account_type != "margin" or borrowed <= 0:
        return interest_accrued, interest_accrued_at
    now = datetime.now(timezone.utc)
    base = _aware(interest_accrued_at)
    days = max(0.0, (now - base).total_seconds() / 86_400)
    if days <= 0:
        return interest_accrued, interest_accrued_at
    accrued = interest_accrued + borrowed * MARGIN_INTEREST_APR * Decimal(str(days)) / Decimal("365")
    return accrued, now


async def refresh_account_interest(db: AsyncSession, account: PaperAccount) -> PaperAccount:
    """Best-effort: persist lazily accrued interest. Must never block reads."""
    accrued, at = accrue_interest(
        account.accountType,
        Decimal(account.borrowedBalance or 0),
        Decimal(account.interestAccrued or 0),
        account.interestAccruedAt,
    )
    if (
        accrued == Decimal(account.interestAccrued or 0)
        and at == account.interestAccruedAt
    ):
        return account
    account.interestAccrued = accrued
    account.interestAccruedAt = at
    await db.commit()
    await db.refresh(account)
    return account


def serialize_account(account: PaperAccount) -> dict:
    return {
        "id": account.id,
        "userId": account.userId,
        "accountType": account.accountType,
        "cashBalance": float(account.cashBalance),
        "currency": account.currency,
        "borrowedBalance": float(account.borrowedBalance or 0),
        "interestAccrued": float(account.interestAccrued or 0),
        "interestAccruedAt": account.interestAccruedAt.isoformat()
        if account.interestAccruedAt
        else None,
        "createdAt": account.createdAt,
        "updatedAt": account.updatedAt,
    }


def serialize_order(order: PaperOrder, strategy_name: str | None = None) -> dict:
    return {
        "id": order.id,
        "userId": order.userId,
        "accountType": order.accountType,
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
        "accountType": pos.accountType,
        "symbol": pos.symbol,
        "assetType": pos.assetType,
        "qty": float(pos.qty),
        "avgCost": float(pos.avgCost),
        "createdAt": pos.createdAt,
        "updatedAt": pos.updatedAt,
    }


async def ensure_account(
    db: AsyncSession, user_id: str, account_type: str = "cash"
) -> PaperAccount:
    res = await db.execute(
        select(PaperAccount).where(
            PaperAccount.userId == user_id,
            PaperAccount.accountType == account_type,
        )
    )
    account = res.scalar_one_or_none()
    if account:
        return account
    now = datetime.now(timezone.utc)
    account = PaperAccount(
        id=new_id(),
        userId=user_id,
        accountType=account_type,
        cashBalance=INITIAL_CASH,
        currency="USD",
        borrowedBalance=Decimal("0"),
        interestAccrued=Decimal("0"),
        interestAccruedAt=now if account_type == "margin" else None,
        createdAt=now,
        updatedAt=now,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


async def ensure_accounts(db: AsyncSession, user_id: str) -> tuple[PaperAccount, PaperAccount]:
    """Ensure both cash and margin books exist for a user."""
    cash = await ensure_account(db, user_id, "cash")
    margin = await ensure_account(db, user_id, "margin")
    return cash, margin


async def reset_account(
    db: AsyncSession, user_id: str, account_type: str = "cash"
) -> PaperAccount:
    await ensure_account(db, user_id, account_type)
    orders = await db.execute(
        select(PaperOrder).where(
            PaperOrder.userId == user_id,
            PaperOrder.accountType == account_type,
        )
    )
    for o in orders.scalars():
        await db.delete(o)
    positions = await db.execute(
        select(PaperPosition).where(
            PaperPosition.userId == user_id,
            PaperPosition.accountType == account_type,
        )
    )
    for p in positions.scalars():
        await db.delete(p)
    account = await ensure_account(db, user_id, account_type)
    now = datetime.now(timezone.utc)
    account.cashBalance = INITIAL_CASH
    account.borrowedBalance = Decimal("0")
    account.interestAccrued = Decimal("0")
    account.interestAccruedAt = now if account_type == "margin" else None
    account.dayStartEquity = None
    account.dayStartDate = None
    await db.commit()
    await db.refresh(account)
    return account


async def _apply_fill(
    db: AsyncSession,
    *,
    user_id: str,
    account_type: str,
    symbol: str,
    asset_type: str,
    side: str,
    qty: Decimal,
    fill_price: Decimal,
    order: PaperOrder,
) -> PaperOrder:
    account = await ensure_account(db, user_id, account_type)
    # Lazily accrue interest on any outstanding margin debt before settling.
    interest, interest_at = accrue_interest(
        account.accountType,
        Decimal(account.borrowedBalance or 0),
        Decimal(account.interestAccrued or 0),
        account.interestAccruedAt,
    )
    notional = qty * fill_price
    cash = Decimal(account.cashBalance)
    borrowed = Decimal(account.borrowedBalance or 0)

    if side == "buy":
        # Cash book cannot borrow. Margin book uses cash first, then borrowing.
        if account_type == "cash" and cash + Decimal("1e-8") < notional:
            raise AppError("Insufficient cash", code="INSUFFICIENT_CASH", status_code=400)
        cash_use = min(cash, notional)
        borrow_delta = max(Decimal("0"), notional - cash_use)
        account.cashBalance = cash - cash_use
        account.borrowedBalance = borrowed + borrow_delta
        account.interestAccrued = interest
        account.interestAccruedAt = interest_at

        res = await db.execute(
            select(PaperPosition).where(
                PaperPosition.userId == user_id,
                PaperPosition.accountType == account_type,
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
                    accountType=account_type,
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
                PaperPosition.accountType == account_type,
                PaperPosition.symbol == symbol,
                PaperPosition.assetType == asset_type,
            )
        )
        pos = res.scalar_one_or_none()
        held = Decimal(pos.qty) if pos else Decimal("0")
        if float(held) + 1e-8 < float(qty):
            raise AppError("Insufficient position", code="INSUFFICIENT_POSITION", status_code=400)
        # Sale proceeds repay margin debt first, remainder returns to cash.
        repay = min(borrowed, notional)
        account.borrowedBalance = borrowed - repay
        account.cashBalance = cash + (notional - repay)
        account.interestAccrued = interest
        account.interestAccruedAt = interest_at
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


async def _buying_power(
    db: AsyncSession, user_id: str, account_type: str
) -> dict[str, Decimal]:
    """Current buying power for an account (cash book or margin book)."""
    account = await ensure_account(db, user_id, account_type)
    res = await db.execute(
        select(PaperPosition).where(
            PaperPosition.userId == user_id,
            PaperPosition.accountType == account_type,
        )
    )
    gross = sum(
        (Decimal(p.qty) * Decimal(p.avgCost) for p in res.scalars()),
        Decimal("0"),
    )
    interest, _ = accrue_interest(
        account.accountType,
        Decimal(account.borrowedBalance or 0),
        Decimal(account.interestAccrued or 0),
        account.interestAccruedAt,
    )
    return account_metrics(
        account_type=account_type,
        cash=Decimal(account.cashBalance),
        gross=gross,
        borrowed=Decimal(account.borrowedBalance or 0),
        interest=interest,
    )


async def place_order(
    db: AsyncSession,
    *,
    user_id: str,
    account_type: str = "cash",
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
    await ensure_account(db, user_id, account_type)

    if order_type == "limit" and not (limit_price and limit_price > 0):
        raise AppError("limitPrice required", code="INVALID_LIMIT", status_code=400)
    if order_type == "stop" and not (stop_price and stop_price > 0):
        raise AppError("stopPrice required", code="INVALID_STOP", status_code=400)

    now = datetime.now(timezone.utc)
    order = PaperOrder(
        id=new_id(),
        userId=user_id,
        accountType=account_type,
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
            account_type=account_type,
            symbol=sym,
            asset_type=asset_type,
            side=side,
            qty=q,
            fill_price=fill_price,
            order=order,
        )

    # Limit / stop: validate then park as pending. Buy reserves buying power
    # (not just cash); sell reserves free float minus pending sells.
    if side == "buy":
        metrics = await _buying_power(db, user_id, account_type)
        reserve_price = _dec(limit_price if order_type == "limit" else stop_price)
        if reserve_price is not None and float(metrics["buyingPower"]) + 1e-8 < float(
            q * reserve_price
        ):
            raise AppError("Insufficient cash", code="INSUFFICIENT_CASH", status_code=400)
    else:
        res = await db.execute(
            select(PaperPosition).where(
                PaperPosition.userId == user_id,
                PaperPosition.accountType == account_type,
                PaperPosition.symbol == sym,
                PaperPosition.assetType == asset_type,
            )
        )
        pos = res.scalar_one_or_none()
        held = float(pos.qty) if pos else 0.0
        pending = await db.execute(
            select(PaperOrder).where(
                PaperOrder.userId == user_id,
                PaperOrder.accountType == account_type,
                PaperOrder.symbol == sym,
                PaperOrder.assetType == asset_type,
                PaperOrder.side == "sell",
                PaperOrder.status == "pending",
            )
        )
        reserved = sum(float(o.qty) for o in pending.scalars())
        if held - reserved + 1e-8 < float(q):
            raise AppError(
                "Insufficient position",
                code="INSUFFICIENT_POSITION",
                status_code=400,
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
        account_type=order.accountType,
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


async def modify_order(
    db: AsyncSession,
    *,
    user_id: str,
    order_id: str,
    qty: float,
    limit_price: float | None = None,
    stop_price: float | None = None,
) -> PaperOrder:
    """Amend pending paper order qty / trigger price (type & side unchanged)."""
    order = await db.get(PaperOrder, order_id)
    if not order or order.userId != user_id:
        raise AppError("Order not found", code="NOT_FOUND", status_code=404)
    if order.status != "pending":
        raise AppError(
            "Only pending orders can be modified",
            code="NOT_PENDING",
            status_code=400,
        )

    if not (qty > 0):
        raise AppError("Invalid quantity", code="INVALID_QTY", status_code=400)
    q = _dec(qty) or Decimal("0")

    next_limit = float(order.limitPrice) if order.limitPrice is not None else None
    next_stop = float(order.stopPrice) if order.stopPrice is not None else None

    if order.type == "limit":
        if not (limit_price is not None and limit_price > 0):
            raise AppError("limitPrice required", code="INVALID_LIMIT", status_code=400)
        next_limit = limit_price
    if order.type == "stop":
        if not (stop_price is not None and stop_price > 0):
            raise AppError("stopPrice required", code="INVALID_STOP", status_code=400)
        next_stop = stop_price

    if order.side == "buy":
        metrics = await _buying_power(db, user_id, order.accountType)
        reserve = (
            float(next_limit or 0)
            if order.type == "limit"
            else float(next_stop or 0)
            if order.type == "stop"
            else 0.0
        )
        if reserve > 0 and float(metrics["buyingPower"]) + 1e-8 < qty * reserve:
            raise AppError("Insufficient cash", code="INSUFFICIENT_CASH", status_code=400)
    else:
        res = await db.execute(
            select(PaperPosition).where(
                PaperPosition.userId == user_id,
                PaperPosition.accountType == order.accountType,
                PaperPosition.symbol == order.symbol,
                PaperPosition.assetType == order.assetType,
            )
        )
        pos = res.scalar_one_or_none()
        held = float(pos.qty) if pos else 0.0
        pending = await db.execute(
            select(PaperOrder).where(
                PaperOrder.userId == user_id,
                PaperOrder.accountType == order.accountType,
                PaperOrder.symbol == order.symbol,
                PaperOrder.assetType == order.assetType,
                PaperOrder.side == "sell",
                PaperOrder.status == "pending",
                PaperOrder.id != order.id,
            )
        )
        reserved = sum(float(o.qty) for o in pending.scalars())
        if held - reserved + 1e-8 < qty:
            raise AppError(
                "Insufficient position",
                code="INSUFFICIENT_POSITION",
                status_code=400,
            )

    order.qty = q
    order.limitPrice = _dec(next_limit) if order.type == "limit" else None
    order.stopPrice = _dec(next_stop) if order.type == "stop" else None
    order.updatedAt = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(order)

    try:
        quote = await get_quote(order.symbol, order.assetType)
        price = float(quote.get("price") or 0)
        if price > 0 and should_trigger_pending(
            order_type=order.type,
            side=order.side,
            price=price,
            limit_price=next_limit,
            stop_price=next_stop,
        ):
            filled = await fill_pending_order(db, order.id, price)
            if filled:
                return filled
    except AppError:
        raise
    except Exception:  # noqa: BLE001 — quote miss should not fail amend
        pass

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
