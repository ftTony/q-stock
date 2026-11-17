"""Research card CRUD."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.core.ids import new_id
from app.models.social import ResearchCard
from app.models.user import User
from app.services.entitlements import research_card_limit
from app.services.market.symbols import normalize_symbol

router = APIRouter(prefix="/research-cards", dependencies=[Depends(enforce_rate_limit)])


class UpsertCard(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    assetType: str
    whyWatch: str | None = Field(default=None, max_length=2000)
    question: str | None = Field(default=None, max_length=2000)
    watchConditions: str | None = Field(default=None, max_length=2000)
    risks: str | None = Field(default=None, max_length=2000)
    reviewAt: datetime | None = None


class DeleteCard(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    assetType: str


def _card_dict(c: ResearchCard) -> dict:
    return {
        "id": c.id,
        "userId": c.userId,
        "symbol": c.symbol,
        "assetType": c.assetType,
        "whyWatch": c.whyWatch,
        "question": c.question,
        "watchConditions": c.watchConditions,
        "risks": c.risks,
        "reviewAt": c.reviewAt,
        "createdAt": c.createdAt,
        "updatedAt": c.updatedAt,
    }


@router.get("")
async def get_cards(
    symbol: str | None = None,
    assetType: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if symbol and assetType:
        if assetType not in {"stock", "hk", "crypto", "cn"}:
            raise AppError("Invalid assetType", code="VALIDATION_ERROR", status_code=400)
        sym = normalize_symbol(symbol, assetType)
        res = await db.execute(
            select(ResearchCard).where(
                ResearchCard.userId == user.id,
                ResearchCard.symbol == sym,
                ResearchCard.assetType == assetType,
            )
        )
        card = res.scalar_one_or_none()
        return {"card": _card_dict(card) if card else None}

    limit = await research_card_limit(db, user)
    res = await db.execute(
        select(ResearchCard)
        .where(ResearchCard.userId == user.id)
        .order_by(desc(ResearchCard.updatedAt))
        .limit(limit)
    )
    cards = [_card_dict(c) for c in res.scalars()]
    return {"cards": cards, "limit": limit, "count": len(cards)}


@router.post("")
async def upsert_card(
    body: UpsertCard,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.assetType not in {"stock", "hk", "crypto", "cn"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    sym = normalize_symbol(body.symbol, body.assetType)
    limit = await research_card_limit(db, user)

    res = await db.execute(
        select(ResearchCard).where(
            ResearchCard.userId == user.id,
            ResearchCard.symbol == sym,
            ResearchCard.assetType == body.assetType,
        )
    )
    existing = res.scalar_one_or_none()
    now = datetime.now(timezone.utc)

    if not existing:
        count_res = await db.execute(
            select(func.count()).select_from(ResearchCard).where(
                ResearchCard.userId == user.id
            )
        )
        count = int(count_res.scalar_one() or 0)
        if count >= limit:
            raise AppError(
                "researchCards limit reached",
                code="PLAN_LIMIT_EXCEEDED",
                status_code=403,
                details={"kind": "researchCards", "limit": limit, "upgradePath": "/pricing"},
            )
        card = ResearchCard(
            id=new_id(),
            userId=user.id,
            symbol=sym,
            assetType=body.assetType,
            whyWatch=body.whyWatch or "",
            question=body.question or "",
            watchConditions=body.watchConditions or "",
            risks=body.risks or "",
            reviewAt=body.reviewAt,
            createdAt=now,
            updatedAt=now,
        )
        db.add(card)
        await db.commit()
        await db.refresh(card)
        return {"card": _card_dict(card)}

    if body.whyWatch is not None:
        existing.whyWatch = body.whyWatch
    if body.question is not None:
        existing.question = body.question
    if body.watchConditions is not None:
        existing.watchConditions = body.watchConditions
    if body.risks is not None:
        existing.risks = body.risks
    if "reviewAt" in body.model_fields_set:
        existing.reviewAt = body.reviewAt
    existing.updatedAt = now
    await db.commit()
    await db.refresh(existing)
    return {"card": _card_dict(existing)}


@router.delete("")
async def delete_card(
    body: DeleteCard,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.assetType not in {"stock", "hk", "crypto", "cn"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    sym = normalize_symbol(body.symbol, body.assetType)
    res = await db.execute(
        select(ResearchCard).where(
            ResearchCard.userId == user.id,
            ResearchCard.symbol == sym,
            ResearchCard.assetType == body.assetType,
        )
    )
    card = res.scalar_one_or_none()
    if card:
        await db.delete(card)
        await db.commit()
    return {"ok": True}
