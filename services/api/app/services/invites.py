"""Invite code helpers (mint + register URL)."""

from __future__ import annotations

import secrets
from urllib.parse import quote

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ids import new_id
from app.core.settings import get_settings
from app.models.user import InviteCode
from app.services.locale import from_db_locale

INITIAL_INVITE_COUNT = 3
_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"


def generate_invite_code(length: int = 16) -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(length))


def app_base_url() -> str:
    return get_settings().app_url.rstrip("/") or "http://localhost:3000"


def localized_path(locale: str, path: str = "/") -> str:
    """Match src/i18n/config localizedPath (default locale = en → no prefix)."""
    raw = path if path.startswith("/") else f"/{path}"
    suffix = "" if raw == "/" else raw
    if not locale or locale == "en":
        return suffix or "/"
    return f"/{locale}{suffix}"


def invite_register_url(*, base_url: str, locale: str, code: str) -> str:
    base = base_url.rstrip("/")
    return f"{base}{localized_path(locale, '/register')}?invite={quote(code, safe='')}"


async def _create_unique_invite_code(db: AsyncSession, owner_id: str) -> str:
    for _ in range(8):
        code = generate_invite_code()
        existing = await db.scalar(select(InviteCode.id).where(InviteCode.code == code))
        if existing:
            continue
        db.add(InviteCode(id=new_id(), code=code, ownerId=owner_id))
        await db.flush()
        return code
    raise RuntimeError("Failed to mint invite code")


async def ensure_user_invite_codes(db: AsyncSession, user_id: str) -> None:
    count = await db.scalar(
        select(func.count()).select_from(InviteCode).where(InviteCode.ownerId == user_id)
    )
    if int(count or 0) > 0:
        return
    for _ in range(INITIAL_INVITE_COUNT):
        await _create_unique_invite_code(db, user_id)
    await db.commit()


def invite_locale_label(db_locale: str | None) -> str:
    return from_db_locale(db_locale)
