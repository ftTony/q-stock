from __future__ import annotations

from fastapi import Depends, Header, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.errors import AppError
from app.core.redis_client import cache_get, rate_limit
from app.core.security import safe_decode
from app.core.settings import get_settings
from app.models.user import User


async def get_optional_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> User | None:
    token: str | None = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    payload = safe_decode(token)
    if not payload or payload.get("typ") != "access":
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    ver = int(payload.get("ver") or 0)
    stored = await cache_get(f"auth:ver:{user_id}")
    if stored is not None and int(stored) != ver:
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def require_user(user: User | None = Depends(get_optional_user)) -> User:
    if not user:
        raise AppError("Unauthorized", code="UNAUTHORIZED", status_code=401)
    return user


async def enforce_rate_limit(
    request: Request,
    user: User | None = Depends(get_optional_user),
) -> None:
    settings = get_settings()
    who = user.id if user else (request.client.host if request.client else "anon")
    route = request.url.path
    key = f"rl:{route}:{who}"
    allowed = await rate_limit(key, settings.rate_limit_per_minute, 60)
    if not allowed:
        raise AppError("Too many requests", code="RATE_LIMITED", status_code=429)


async def get_refresh_token(
    request: Request,
    authorization: str | None = Header(default=None),
) -> str | None:
    settings = get_settings()
    cookie = request.cookies.get(settings.refresh_cookie_name)
    if cookie:
        return cookie
    if authorization and authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1].strip()
    return None
