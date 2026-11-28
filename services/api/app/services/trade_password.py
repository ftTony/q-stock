"""Trade PIN: 6-digit numeric password gating trading/account writes."""

from __future__ import annotations

import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.security import hash_password, verify_password
from app.models.user import User

TRADE_PIN_LENGTH = 6
_PIN_RE = re.compile(rf"^\d{{{TRADE_PIN_LENGTH}}}$")


def is_valid_trade_pin(pin: str | None) -> bool:
    return bool(pin) and bool(_PIN_RE.match(pin))


async def get_trade_password_hash(db: AsyncSession, user_id: str) -> str | None:
    res = await db.execute(
        select(User.tradePasswordHash).where(User.id == user_id)
    )
    row = res.first()
    return row[0] if row else None


async def has_trade_password(db: AsyncSession, user_id: str) -> bool:
    return bool(await get_trade_password_hash(db, user_id))


async def set_trade_password(
    db: AsyncSession, user_id: str, pin: str, current_pin: str | None = None
) -> None:
    """Set or replace the trade password. Replacing an existing PIN requires
    the current one (INVALID_CURRENT_PIN otherwise)."""
    current_hash = await get_trade_password_hash(db, user_id)
    if current_hash:
        if (
            not current_pin
            or not is_valid_trade_pin(current_pin)
            or not verify_password(current_pin, current_hash)
        ):
            raise AppError(
                "Invalid current pin", code="INVALID_CURRENT_PIN", status_code=400
            )
    user = await db.get(User, user_id)
    if not user:
        raise AppError("Unauthorized", code="UNAUTHORIZED", status_code=401)
    user.tradePasswordHash = hash_password(pin)
    await db.commit()


async def disable_trade_password(db: AsyncSession, user_id: str, pin: str) -> bool:
    """Disable the trade password. Returns the resulting enabled state."""
    current_hash = await get_trade_password_hash(db, user_id)
    if not current_hash:
        return False
    if not verify_password(pin, current_hash):
        raise AppError("Invalid pin", code="INVALID_CURRENT_PIN", status_code=400)
    user = await db.get(User, user_id)
    if not user:
        raise AppError("Unauthorized", code="UNAUTHORIZED", status_code=401)
    user.tradePasswordHash = None
    await db.commit()
    return False


async def assert_trade_password(db: AsyncSession, user_id: str, pin: str | None) -> None:
    """Verify a submitted trade PIN against the stored hash.

    - No password configured → allowed (feature is opt-in).
    - Password configured but PIN missing/wrong → 401 INVALID_TRADE_PASSWORD.
    """
    trade_hash = await get_trade_password_hash(db, user_id)
    if not trade_hash:
        return
    if (
        not pin
        or not is_valid_trade_pin(pin)
        or not verify_password(pin, trade_hash)
    ):
        raise AppError(
            "Invalid trade password", code="INVALID_TRADE_PASSWORD", status_code=401
        )


async def assert_trade_password_from_request(
    db: AsyncSession,
    user_id: str,
    request,  # starlette Request — read lazily to keep the service layer thin
    body_pin: str | None = None,
) -> None:
    """Read the trade PIN from the `x-trade-pin` header, falling back to a
    body/query field. Every trading/account write endpoint funnels through
    this so the PIN can be supplied uniformly (DELETE has no body)."""
    header_pin = request.headers.get("x-trade-pin")
    await assert_trade_password(db, user_id, header_pin or body_pin)


async def verify_login_password(
    db: AsyncSession, user_id: str, login_password: str
) -> None:
    """Verify the account login password (forgot-PIN flow step 1)."""
    user = await db.get(User, user_id)
    if not user or not user.passwordHash:
        # OAuth-only account has no login password to verify against.
        raise AppError(
            "No login password", code="NO_LOGIN_PASSWORD", status_code=400
        )
    if not verify_password(login_password, user.passwordHash):
        raise AppError(
            "Invalid login password", code="INVALID_LOGIN_PASSWORD", status_code=401
        )


async def reset_trade_password(
    db: AsyncSession, user_id: str, login_password: str, pin: str
) -> None:
    """Reset a forgotten trade password by verifying the login password."""
    await verify_login_password(db, user_id, login_password)
    await set_trade_password(db, user_id, pin)
