from __future__ import annotations

import os
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

FREE_WATCHLIST_LIMIT = 20
PRO_WATCHLIST_LIMIT = 100
FREE_ALERT_LIMIT = 5
PRO_ALERT_LIMIT = 30
FREE_RESEARCH_CARD_LIMIT = 1
PRO_RESEARCH_CARD_LIMIT = 500
PRO_AI_MONTHLY_LIMIT = 100


def is_pro_active(user: User, now: datetime | None = None) -> bool:
    now = now or datetime.now(timezone.utc)
    if user.plan != "pro":
        return False
    if user.planExpiresAt is None:
        return True
    exp = user.planExpiresAt
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    return exp > now


def stripe_enabled() -> bool:
    return bool(
        (os.environ.get("STRIPE_SECRET_KEY") or "").strip()
        and (os.environ.get("STRIPE_PRICE_PRO_MONTHLY") or "").strip()
    )


def entitlements_dict(user: User) -> dict:
    pro = is_pro_active(user)
    return {
        "plan": "pro" if pro else "free",
        "planExpiresAt": user.planExpiresAt.isoformat() if user.planExpiresAt else None,
        "isPro": pro,
        "watchlistLimit": PRO_WATCHLIST_LIMIT if pro else FREE_WATCHLIST_LIMIT,
        "alertLimit": PRO_ALERT_LIMIT if pro else FREE_ALERT_LIMIT,
        "researchCardLimit": PRO_RESEARCH_CARD_LIMIT if pro else FREE_RESEARCH_CARD_LIMIT,
        "aiMonthlyLimit": PRO_AI_MONTHLY_LIMIT if pro else None,
        "stripeEnabled": stripe_enabled(),
    }


def peek_ai_quota(user: User) -> dict:
    """Read-only AI quota snapshot (no BYOK probe)."""
    if is_pro_active(user):
        used = int(user.aiPeriodUsageCount or 0)
        limit = PRO_AI_MONTHLY_LIMIT
        return {
            "ok": used < limit,
            "used": used,
            "limit": limit,
            "remaining": max(0, limit - used),
            "mode": "pro",
        }
    used = int(user.aiUsageCount or 0)
    limit = int(user.aiUsageLimit or 5)
    return {
        "ok": used < limit,
        "used": used,
        "limit": limit,
        "remaining": max(0, limit - used),
        "mode": "free",
    }


async def watchlist_limit(db: AsyncSession, user: User) -> int:
    _ = db
    return PRO_WATCHLIST_LIMIT if is_pro_active(user) else FREE_WATCHLIST_LIMIT


async def alert_limit(db: AsyncSession, user: User) -> int:
    _ = db
    return PRO_ALERT_LIMIT if is_pro_active(user) else FREE_ALERT_LIMIT


async def research_card_limit(db: AsyncSession, user: User) -> int:
    _ = db
    return PRO_RESEARCH_CARD_LIMIT if is_pro_active(user) else FREE_RESEARCH_CARD_LIMIT
