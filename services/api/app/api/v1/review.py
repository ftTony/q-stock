"""Review process desk."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.api.deps import enforce_rate_limit, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.models.user import User
from app.services.review_process import build_process_summary
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/review", dependencies=[Depends(enforce_rate_limit)])


@router.get("/process")
async def process_review(
    period: str = Query(default="day"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if period not in {"day", "week"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    return await build_process_summary(db, user_id=user.id, period=period)
