"""User settings, invites, and feature suggestions."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import asc, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, get_optional_user, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.core.ids import new_id
from app.models.suggestions import FeatureSuggestion
from app.models.user import InviteCode, User
from app.services.invites import (
    app_base_url,
    ensure_user_invite_codes,
    invite_locale_label,
    invite_register_url,
)
from app.services.locale import to_db_locale

router = APIRouter(prefix="/user", dependencies=[Depends(enforce_rate_limit)])

BODY_MIN = 8
BODY_MAX = 4000
IMAGE_MAX = 160_000
LIST_TAKE = 30
DAY_LIMIT = 8


class SettingsPatch(BaseModel):
    locale: str | None = None
    theme: str | None = None
    changeColorScheme: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=64)


class SuggestionPost(BaseModel):
    body: str = Field(min_length=BODY_MIN, max_length=BODY_MAX)
    imageData: str | None = Field(default=None, max_length=IMAGE_MAX)


def _settings_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "locale": user.locale,
        "theme": user.theme,
        "changeColorScheme": user.changeColorScheme,
    }


def _suggestion_item(row: FeatureSuggestion) -> dict:
    return {
        "id": row.id,
        "body": row.body,
        "hasImage": bool(row.imageData),
        "status": row.status,
        "createdAt": row.createdAt.isoformat() if row.createdAt else None,
    }


@router.get("/settings")
async def get_settings(
    user: User = Depends(require_user),
) -> dict:
    return {"user": _settings_user(user)}


@router.patch("/settings")
async def patch_settings(
    body: SettingsPatch,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.locale is not None:
        if body.locale not in {"zh-CN", "zh-TW", "en"}:
            raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
        user.locale = to_db_locale(body.locale)
    if body.theme is not None:
        if body.theme not in {"light", "dark", "system"}:
            raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
        user.theme = body.theme
    if body.changeColorScheme is not None:
        if body.changeColorScheme not in {"cn", "us"}:
            raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
        user.changeColorScheme = body.changeColorScheme
    if body.name is not None:
        user.name = body.name
    await db.commit()
    await db.refresh(user)
    return {"user": _settings_user(user)}


@router.get("/invites")
async def get_invites(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    await ensure_user_invite_codes(db, user.id)
    res = await db.execute(
        select(InviteCode)
        .where(InviteCode.ownerId == user.id)
        .order_by(asc(InviteCode.usedAt), asc(InviteCode.createdAt))
    )
    rows = list(res.scalars())
    locale = invite_locale_label(user.locale)
    base = app_base_url()
    return {
        "aiQuota": {
            "used": user.aiUsageCount,
            "limit": user.aiUsageLimit,
            "remaining": max(0, user.aiUsageLimit - user.aiUsageCount),
        },
        "invites": [
            {
                "code": r.code,
                "used": bool(r.usedById and r.usedAt),
                "usedAt": r.usedAt.isoformat() if r.usedAt else None,
                "inviteLink": invite_register_url(
                    base_url=base, locale=locale, code=r.code
                ),
            }
            for r in rows
        ],
    }


@router.get("/suggestions")
async def list_suggestions(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    res = await db.execute(
        select(FeatureSuggestion)
        .where(FeatureSuggestion.userId == user.id)
        .order_by(desc(FeatureSuggestion.createdAt))
        .limit(LIST_TAKE)
    )
    items = list(res.scalars())
    return {"items": [_suggestion_item(row) for row in items]}


@router.post("/suggestions")
async def create_suggestion(
    body: SuggestionPost,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    text = body.body.strip()
    if len(text) < BODY_MIN or len(text) > BODY_MAX:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    image_data = (body.imageData or "").strip() or None
    if image_data is not None:
        import re

        if not re.match(
            r"^data:image/(png|jpeg|jpg|webp);base64,", image_data, re.I
        ):
            raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)

    user_id = user.id if user else None
    email = user.email if user else None
    if user_id:
        since = datetime.now(timezone.utc) - timedelta(hours=24)
        recent = await db.scalar(
            select(func.count())
            .select_from(FeatureSuggestion)
            .where(
                FeatureSuggestion.userId == user_id,
                FeatureSuggestion.createdAt >= since,
            )
        )
        if int(recent or 0) >= DAY_LIMIT:
            raise AppError("rate_limited", code="RATE_LIMITED", status_code=429)

    row = FeatureSuggestion(
        id=new_id(),
        userId=user_id,
        email=email,
        body=text,
        imageData=image_data,
        status="open",
        createdAt=datetime.now(timezone.utc),
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return {"item": _suggestion_item(row)}
