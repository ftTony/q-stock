"""Optional Bearer → user market credential store."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.market_creds import load_user_market_creds


async def market_store_for_user(
    db: AsyncSession,
    user: User | None,
) -> dict[str, Any] | None:
    if not user:
        return None
    try:
        return await load_user_market_creds(db, user.id)
    except Exception:
        return {
            "userId": user.id,
            "equityVendor": getattr(user, "equityVendor", None) or "longbridge",
            "cryptoVendor": getattr(user, "cryptoVendor", None) or "binance",
        }
