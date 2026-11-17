"""Price alert CRUD matching Next /api/alerts."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.core.ids import new_id
from app.models.alerts import PriceAlert
from app.models.user import User
from app.services.entitlements import alert_limit
from app.services.market.symbols import normalize_symbol

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])


class CreateAlert(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    assetType: str
    condition: str
    triggerPrice: float = Field(gt=0)
    frequency: str = "always"


class PatchAlert(BaseModel):
    id: str
    status: str


def _alert_dict(a: PriceAlert) -> dict:
    return {
        "id": a.id,
        "userId": a.userId,
        "symbol": a.symbol,
        "assetType": a.assetType,
        "condition": a.condition,
        "triggerPrice": float(a.triggerPrice),
        "frequency": a.frequency,
        "status": a.status,
        "triggeredAt": a.triggeredAt,
        "createdAt": a.createdAt,
        "updatedAt": a.updatedAt,
    }


@router.get("/alerts")
async def list_alerts(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    res = await db.execute(
        select(PriceAlert)
        .where(PriceAlert.userId == user.id)
        .order_by(desc(PriceAlert.createdAt))
        .limit(200)
    )
    alerts = list(res.scalars())
    return {"alerts": [_alert_dict(a) for a in alerts]}


@router.post("/alerts", status_code=201)
async def create_alert(
    body: CreateAlert,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.assetType not in {"stock", "hk", "crypto", "cn"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    if body.condition not in {"gte", "lte"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    if body.frequency not in {"once", "daily", "always"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)

    count = await db.scalar(
        select(func.count()).select_from(PriceAlert).where(PriceAlert.userId == user.id)
    )
    limit = await alert_limit(db, user)
    if int(count or 0) >= limit:
        raise AppError(
            "alerts limit reached",
            code="PLAN_LIMIT_EXCEEDED",
            status_code=403,
            details={"kind": "alerts", "limit": limit, "upgradePath": "/pricing"},
        )

    now = datetime.now(timezone.utc)
    alert = PriceAlert(
        id=new_id(),
        userId=user.id,
        symbol=normalize_symbol(body.symbol, body.assetType),
        assetType=body.assetType,
        condition=body.condition,
        triggerPrice=Decimal(str(body.triggerPrice)),
        frequency=body.frequency,
        status="active",
        createdAt=now,
        updatedAt=now,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return {"alert": _alert_dict(alert)}


@router.patch("/alerts")
async def patch_alert(
    body: PatchAlert,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.status not in {"active", "disabled"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    alert = await db.get(PriceAlert, body.id)
    if not alert or alert.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    alert.status = body.status
    if body.status == "active":
        alert.triggeredAt = None
    await db.commit()
    await db.refresh(alert)
    return {"alert": _alert_dict(alert)}


@router.delete("/alerts")
async def delete_alert(
    id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    alert = await db.get(PriceAlert, id)
    if not alert or alert.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    await db.delete(alert)
    await db.commit()
    return {"ok": True}
