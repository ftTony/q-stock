"""Redeem code → grant Pro (parity with src/lib/billing/redeem.ts)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ids import new_id
from app.models.social import EntitlementGrant, RedeemCode, RedeemRedemption
from app.models.user import User


async def grant_pro_plan(
    db: AsyncSession,
    user: User,
    *,
    days: int,
    source: str,
    note: str | None = None,
) -> datetime | None:
    days = max(1, int(days))
    now = datetime.now(timezone.utc)
    from_now = now + timedelta(days=days)
    plan_expires = from_now

    if user.plan == "pro" and user.planExpiresAt:
        exp = user.planExpiresAt
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp > from_now:
            plan_expires = exp
        elif exp > now:
            plan_expires = exp + timedelta(days=days)

    user.plan = "pro"
    user.planExpiresAt = plan_expires
    db.add(
        EntitlementGrant(
            id=new_id(),
            userId=user.id,
            plan="pro",
            source=source,
            days=days,
            note=note,
        )
    )
    await db.flush()
    return plan_expires


async def redeem_code(db: AsyncSession, user: User, raw_code: str) -> dict:
    code = raw_code.strip().upper()
    if not code or len(code) > 64:
        return {"ok": False, "error": "Invalid code", "code": "INVALID_CODE"}

    res = await db.execute(select(RedeemCode).where(RedeemCode.code == code))
    row = res.scalar_one_or_none()
    if not row:
        return {"ok": False, "error": "Code not found", "code": "NOT_FOUND"}

    now = datetime.now(timezone.utc)
    if row.expiresAt:
        exp = row.expiresAt
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now:
            return {"ok": False, "error": "Code expired", "code": "EXPIRED"}

    if row.redemptionCount >= row.maxRedemptions:
        return {"ok": False, "error": "Code already used up", "code": "EXHAUSTED"}

    prior = await db.execute(
        select(RedeemRedemption).where(
            RedeemRedemption.codeId == row.id,
            RedeemRedemption.userId == user.id,
        )
    )
    if prior.scalar_one_or_none():
        return {
            "ok": False,
            "error": "You already redeemed this code",
            "code": "ALREADY_REDEEMED",
        }

    row.redemptionCount = int(row.redemptionCount) + 1
    if row.redemptionCount > row.maxRedemptions:
        return {"ok": False, "error": "Code already used up", "code": "EXHAUSTED"}

    db.add(
        RedeemRedemption(id=new_id(), codeId=row.id, userId=user.id)
    )
    plan_expires = await grant_pro_plan(
        db,
        user,
        days=row.days,
        source="redeem",
        note=f"code:{row.code}",
    )
    await db.commit()
    await db.refresh(user)
    return {
        "ok": True,
        "days": row.days,
        "planExpiresAt": plan_expires.isoformat() if plan_expires else None,
    }
