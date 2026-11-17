"""Billing entitlements + redeem (Stripe checkout stays Next for now)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.models.user import User
from app.services.billing_redeem import redeem_code
from app.services.entitlements import entitlements_dict, peek_ai_quota

router = APIRouter(prefix="/billing", dependencies=[Depends(enforce_rate_limit)])


class RedeemBody(BaseModel):
    code: str = Field(min_length=4, max_length=64)


@router.get("/entitlements")
async def get_entitlements(
    user: User = Depends(require_user),
) -> dict:
    return {
        "entitlements": entitlements_dict(user),
        "quota": peek_ai_quota(user),
    }


@router.post("/redeem")
async def redeem(
    body: RedeemBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    result = await redeem_code(db, user, body.code)
    if not result.get("ok"):
        raise AppError(
            str(result.get("error") or "Redeem failed"),
            code=str(result.get("code") or "REDEEM_FAILED"),
            status_code=400,
        )
    await db.refresh(user)
    return {
        "ok": True,
        "days": result.get("days"),
        "planExpiresAt": result.get("planExpiresAt"),
        "entitlements": entitlements_dict(user),
    }
