from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit
from app.core.db import get_db
from app.core.redis_client import get_redis
from app.core.settings import get_settings
from app.services.market.providers import provider_status
from app.services.market.router import KNOWN

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])

# Badge display order (parity with Next MARKET_DATA_PROVIDERS / data-source-badge).
_DEFAULT_PRIORITY = ("longbridge", "futu", "finnhub", "binance", "okx")


def _provider_priority() -> list[str]:
    raw = (get_settings().market_data_providers or "").strip()
    if not raw:
        return list(_DEFAULT_PRIORITY)
    out: list[str] = []
    for part in raw.split(","):
        pid = part.strip().lower()
        if pid in KNOWN and pid not in out and pid != "fuyao":
            out.append(pid)
    for pid in _DEFAULT_PRIORITY:
        if pid not in out:
            out.append(pid)
    return out


@router.get("/health")
async def health(db: AsyncSession = Depends(get_db)) -> dict:
    db_ok = True
    try:
        await db.execute(text("SELECT 1"))
    except Exception:  # noqa: BLE001
        db_ok = False
    redis_client = await get_redis()
    return {
        "ok": db_ok,
        "db": db_ok,
        "redis": redis_client is not None,
        "providers": provider_status(),
        "providerPriority": _provider_priority(),
    }
