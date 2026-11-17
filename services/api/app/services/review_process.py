"""Process review summary (parity with src/lib/review/process-summary.ts)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.paper import PaperAccount, PaperOrder, PaperPosition
from app.models.strategy import Strategy

FILL_TAKE = 40
POSITION_TAKE = 30
EMOTION_FLAGS = ("fomo", "panic", "revenge", "oversizing", "noPlan")


def period_start(period: str, now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    if period == "week":
        return now - timedelta(days=7)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def deviation_flags(
    *,
    strategy_id: str | None,
    invalidation_note: str | None,
    emotion_tags: list[str] | None,
) -> list[str]:
    flags: list[str] = []
    if not strategy_id:
        flags.append("noTag")
    if not (invalidation_note or "").strip():
        flags.append("noInvalidation")
    tags = emotion_tags or []
    for key in EMOTION_FLAGS:
        if key in tags:
            flags.append(key)
    return flags


async def build_process_summary(
    db: AsyncSession,
    *,
    user_id: str,
    period: str,
) -> dict[str, Any]:
    since = period_start(period)

    orders_res = await db.execute(
        select(PaperOrder, Strategy.name)
        .outerjoin(Strategy, Strategy.id == PaperOrder.strategyId)
        .where(
            PaperOrder.userId == user_id,
            PaperOrder.status == "filled",
            PaperOrder.filledAt >= since,
        )
        .order_by(desc(PaperOrder.filledAt))
        .limit(FILL_TAKE)
    )
    rows = list(orders_res.all())

    pos_res = await db.execute(
        select(PaperPosition).where(PaperPosition.userId == user_id).limit(POSITION_TAKE)
    )
    positions = list(pos_res.scalars())

    acct_res = await db.execute(
        select(PaperAccount).where(PaperAccount.userId == user_id)
    )
    account = acct_res.scalar_one_or_none()

    fills: list[dict[str, Any]] = []
    for order, strategy_name in rows:
        emotion_tags = list(order.emotionTags or [])
        strategy_id = order.strategyId
        invalidation = order.invalidationNote
        fills.append(
            {
                "id": order.id,
                "symbol": order.symbol,
                "assetType": order.assetType,
                "side": order.side,
                "qty": float(order.qty),
                "filledPrice": float(order.filledPrice)
                if order.filledPrice is not None
                else None,
                "filledAt": order.filledAt.isoformat() if order.filledAt else None,
                "createdAt": order.createdAt.isoformat() if order.createdAt else None,
                "strategyId": strategy_id,
                "strategyName": strategy_name,
                "emotionTags": emotion_tags,
                "invalidationNote": invalidation,
                "flags": deviation_flags(
                    strategy_id=strategy_id,
                    invalidation_note=invalidation,
                    emotion_tags=emotion_tags,
                ),
            }
        )

    fill_count = len(fills)
    tagged_count = sum(1 for f in fills if f["strategyId"])
    emotion_tagged = sum(1 for f in fills if f["emotionTags"])

    return {
        "period": period,
        "since": since.isoformat(),
        "summary": {
            "fillCount": fill_count,
            "taggedCount": tagged_count,
            "untaggedCount": fill_count - tagged_count,
            "taggedPct": round(tagged_count / fill_count * 100) if fill_count else None,
            "emotionTaggedCount": emotion_tagged,
            "openPositionCount": len(positions),
            "cash": float(account.cashBalance) if account else None,
        },
        "fills": fills,
        "positions": [
            {
                "symbol": p.symbol,
                "assetType": p.assetType,
                "qty": float(p.qty),
                "avgCost": float(p.avgCost),
            }
            for p in positions
        ],
    }
