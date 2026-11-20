"""Pending paper limit/stop fill tick."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.db import SessionLocal
from app.core.errors import AppError
from app.models.paper import PaperOrder
from app.services.market.facade import get_quote
from app.services.market_creds import load_user_market_creds
from app.services.trading import fill_pending_order
from app.worker.paper_rules import should_trigger_pending

log = logging.getLogger(__name__)

_ORDER_TAKE = 200


async def tick_paper_orders() -> None:
    async with SessionLocal() as db:
        res = await db.execute(
            select(PaperOrder)
            .where(
                PaperOrder.status == "pending",
                PaperOrder.type.in_(("limit", "stop")),
            )
            .order_by(PaperOrder.createdAt.asc())
            .limit(_ORDER_TAKE)
        )
        pending = list(res.scalars().all())
        if not pending:
            log.info(
                "[trading] no pending orders @ %s",
                datetime.now(timezone.utc).isoformat(),
            )
            return

        by_user: dict[str, list[PaperOrder]] = {}
        for order in pending:
            by_user.setdefault(order.userId, []).append(order)

        for user_id, orders in by_user.items():
            store = None
            try:
                store = await load_user_market_creds(db, user_id)
            except Exception:  # noqa: BLE001
                store = None

            unique: dict[str, tuple[str, str]] = {}
            for order in orders:
                unique[f"{order.assetType}:{order.symbol}"] = (
                    order.symbol,
                    order.assetType,
                )

            quotes: dict[str, float] = {}
            for symbol, asset_type in unique.values():
                try:
                    q = await get_quote(symbol, asset_type, store=store)
                    quotes[f"{asset_type}:{symbol}"] = float(q.get("price") or 0)
                except Exception as exc:  # noqa: BLE001
                    log.error("[trading] quote failed %s: %s", symbol, exc)

            for order in orders:
                price = quotes.get(f"{order.assetType}:{order.symbol}")
                if price is None or not (price > 0):
                    continue
                hit = should_trigger_pending(
                    order_type=order.type,
                    side=order.side,
                    price=price,
                    limit_price=float(order.limitPrice) if order.limitPrice is not None else None,
                    stop_price=float(order.stopPrice) if order.stopPrice is not None else None,
                )
                if not hit:
                    continue
                try:
                    filled = await fill_pending_order(db, order.id, price)
                    if filled:
                        log.info(
                            "[trading] filled %s %s %s qty=%s @ %s",
                            order.side,
                            order.type,
                            order.symbol,
                            order.qty,
                            price,
                        )
                except AppError as exc:
                    order.status = "rejected"
                    order.rejectReason = exc.message
                    await db.commit()
                    log.warning("[trading] rejected %s: %s", order.id, exc.message)
                except Exception as exc:  # noqa: BLE001
                    await db.rollback()
                    log.error("[trading] fill failed %s: %s", order.id, exc)
