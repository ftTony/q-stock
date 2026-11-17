from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.ids import new_id
from app.core.redis_client import cache_delete, cache_get, cache_set
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    safe_decode,
    verify_password,
)
from app.core.settings import get_settings
from app.models.user import InviteCode, User
from app.schemas.auth import UserPublic
from app.services.locale import from_db_locale, to_db_locale


def user_public(user: User) -> UserPublic:
    return UserPublic(
        id=user.id,
        email=user.email,
        name=user.name,
        locale=from_db_locale(user.locale),
        theme=user.theme,
        plan=user.plan,
    )


async def get_token_version(user_id: str) -> int:
    raw = await cache_get(f"auth:ver:{user_id}")
    return int(raw) if raw is not None else 0


async def bump_token_version(user_id: str) -> int:
    current = await get_token_version(user_id)
    nxt = current + 1
    await cache_set(f"auth:ver:{user_id}", str(nxt), 60 * 60 * 24 * 30)
    return nxt


async def _blacklist_jti(jti: str, ttl_seconds: int) -> None:
    """Revocation list — Redis flush must NOT invalidate unrevoked refresh JWTs."""
    await cache_set(f"auth:rt:deny:{jti}", "1", max(60, ttl_seconds))


async def _is_jti_denied(jti: str) -> bool:
    return (await cache_get(f"auth:rt:deny:{jti}")) is not None


async def register_user(
    db: AsyncSession,
    *,
    email: str,
    password: str,
    name: str | None,
    locale: str | None,
    invite_code: str | None,
) -> User:
    email_l = email.lower().strip()
    existing = await db.execute(select(User).where(User.email == email_l))
    if existing.scalar_one_or_none():
        raise AppError("Email already registered", code="EMAIL_EXISTS", status_code=409)

    invite: InviteCode | None = None
    if invite_code:
        res = await db.execute(select(InviteCode).where(InviteCode.code == invite_code.strip()))
        invite = res.scalar_one_or_none()
        if not invite or invite.usedById:
            raise AppError("Invalid or used invite code", code="INVALID_INVITE", status_code=400)

    now = datetime.now(timezone.utc)
    user = User(
        id=new_id(),
        email=email_l,
        passwordHash=hash_password(password),
        name=name,
        locale=to_db_locale(locale),
        createdAt=now,
        updatedAt=now,
    )
    db.add(user)
    await db.flush()

    if invite:
        result = await db.execute(
            update(InviteCode)
            .where(InviteCode.id == invite.id, InviteCode.usedById.is_(None))
            .values(usedById=user.id, usedAt=datetime.now(timezone.utc))
        )
        if result.rowcount != 1:
            raise AppError("Invalid or used invite code", code="INVALID_INVITE", status_code=400)
        owner = await db.get(User, invite.ownerId)
        if owner:
            owner.aiUsageLimit = int(owner.aiUsageLimit or 5) + 5
            db.add(
                InviteCode(
                    id=new_id(),
                    code=new_id()[:10].upper(),
                    ownerId=owner.id,
                )
            )

    await db.commit()
    await db.refresh(user)
    return user


async def authenticate(db: AsyncSession, *, email: str, password: str) -> User:
    res = await db.execute(select(User).where(User.email == email.lower().strip()))
    user = res.scalar_one_or_none()
    if not user or not verify_password(password, user.passwordHash):
        raise AppError("Invalid email or password", code="INVALID_CREDENTIALS", status_code=401)
    return user


async def upsert_oauth_user(
    db: AsyncSession,
    *,
    email: str,
    name: str | None,
    locale: str | None = None,
) -> User:
    email_l = email.lower().strip()
    res = await db.execute(select(User).where(User.email == email_l))
    user = res.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if not user:
        user = User(
            id=new_id(),
            email=email_l,
            passwordHash=None,
            name=(name or "").strip() or email_l.split("@")[0],
            locale=to_db_locale(locale),
            createdAt=now,
            updatedAt=now,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    if not user.name and name and name.strip():
        user.name = name.strip()
        user.updatedAt = now
        await db.commit()
        await db.refresh(user)
    return user


async def request_password_reset(db: AsyncSession, *, email: str) -> None:
    """Always succeed (no email enumeration). Token created when user exists."""
    import hashlib
    import secrets

    from app.models.auth_extra import PasswordResetToken

    email_l = email.lower().strip()
    res = await db.execute(select(User).where(User.email == email_l))
    user = res.scalar_one_or_none()
    if not user:
        return
    # Invalidate unused tokens
    existing = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.userId == user.id,
            PasswordResetToken.usedAt.is_(None),
        )
    )
    for row in existing.scalars():
        await db.delete(row)

    raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)
    from datetime import timedelta

    db.add(
        PasswordResetToken(
            id=new_id(),
            userId=user.id,
            tokenHash=token_hash,
            expiresAt=now + timedelta(hours=1),
            createdAt=now,
        )
    )
    await db.commit()
    # Email delivery stays on Next/worker for now; log token in dev only.
    print(f"[forgot-password] user={user.id} token={raw}")  # noqa: T201


async def reset_password(db: AsyncSession, *, token: str, password: str) -> None:
    import hashlib

    from app.models.auth_extra import PasswordResetToken

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    res = await db.execute(
        select(PasswordResetToken).where(PasswordResetToken.tokenHash == token_hash)
    )
    row = res.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if (
        not row
        or row.usedAt is not None
        or (row.expiresAt.replace(tzinfo=timezone.utc) if row.expiresAt.tzinfo is None else row.expiresAt)
        < now
    ):
        raise AppError("Invalid or expired token", code="INVALID_TOKEN", status_code=400)
    user = await db.get(User, row.userId)
    if not user:
        raise AppError("Invalid or expired token", code="INVALID_TOKEN", status_code=400)
    user.passwordHash = hash_password(password)
    user.updatedAt = now
    row.usedAt = now
    await db.commit()
    await bump_token_version(user.id)


async def issue_tokens(user: User) -> tuple[str, str, int, int]:
    """Returns access, refresh, access_ttl_sec, refresh_ttl_sec."""
    settings = get_settings()
    ver = await get_token_version(user.id)
    access = create_access_token(user_id=user.id, email=user.email, token_version=ver)
    refresh, _jti, refresh_ttl = create_refresh_token(user_id=user.id, token_version=ver)
    return access, refresh, settings.access_token_minutes * 60, refresh_ttl


async def rotate_refresh(db: AsyncSession, refresh_token: str) -> tuple[User, str, str, int, int]:
    payload = safe_decode(refresh_token)
    if not payload or payload.get("typ") != "refresh":
        raise AppError("Invalid refresh token", code="INVALID_REFRESH", status_code=401)
    jti = payload.get("jti")
    user_id = payload.get("sub")
    if not jti or not user_id:
        raise AppError("Invalid refresh token", code="INVALID_REFRESH", status_code=401)
    if await _is_jti_denied(jti):
        raise AppError("Refresh token revoked", code="REFRESH_REVOKED", status_code=401)
    ver = int(payload.get("ver") or 0)
    current_ver = await get_token_version(user_id)
    if ver != current_ver:
        raise AppError("Refresh token revoked", code="REFRESH_REVOKED", status_code=401)
    user = await db.get(User, user_id)
    if not user:
        raise AppError("User not found", code="NOT_FOUND", status_code=404)

    # Rotate: deny old jti for remaining lifetime (exp - now), fail soft if no exp.
    settings = get_settings()
    exp = payload.get("exp")
    ttl = settings.refresh_token_days * 24 * 3600
    if isinstance(exp, (int, float)):
        ttl = max(60, int(exp - datetime.now(timezone.utc).timestamp()))
    await _blacklist_jti(str(jti), ttl)

    access, refresh, access_ttl, refresh_ttl = await issue_tokens(user)
    return user, access, refresh, access_ttl, refresh_ttl


async def revoke_refresh(refresh_token: str | None) -> None:
    if not refresh_token:
        return
    payload = safe_decode(refresh_token)
    if not payload:
        return
    jti = payload.get("jti")
    if not jti:
        return
    settings = get_settings()
    exp = payload.get("exp")
    ttl = settings.refresh_token_days * 24 * 3600
    if isinstance(exp, (int, float)):
        ttl = max(60, int(exp - datetime.now(timezone.utc).timestamp()))
    await _blacklist_jti(str(jti), ttl)
    # Clean legacy allowlist keys from earlier builds
    await cache_delete(f"auth:rt:{jti}")
