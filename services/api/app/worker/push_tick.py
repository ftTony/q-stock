"""Watchlist close push — claim + log; web-push optional later."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.db import SessionLocal
from app.core.ids import new_id
from app.core.settings import get_settings
from app.models.alerts import WatchlistClosePushLog
from app.models.user import User
from app.models.watchlist import WatchlistItem
from app.services.market.facade import get_quote
from app.services.market.session import is_us_market_close_window, us_trade_date
from app.services.market_creds import load_user_market_creds
from app.worker.config import digest_window_minutes

log = logging.getLogger(__name__)


async def tick_watchlist_close_push() -> None:
    settings = get_settings()
    if not settings.watchlist_close_push_enabled:
        return
    start, end = digest_window_minutes(settings)
    if not is_us_market_close_window(start_minutes=start, end_minutes=end):
        return

    trade_date = us_trade_date()
    now = datetime.now(timezone.utc)

    async with SessionLocal() as db:
        # Users with US watchlist items (push subscription table may exist without ORM yet).
        res = await db.execute(select(User.id).limit(200))
        user_ids = [r[0] for r in res.all()]
        if not user_ids:
            return

        sent = 0
        skipped = 0
        for user_id in user_ids[:50]:
            wl = await db.execute(
                select(WatchlistItem)
                .where(
                    WatchlistItem.userId == user_id,
                    WatchlistItem.assetType == "stock",
                )
                .order_by(WatchlistItem.createdAt.asc())
                .limit(40)
            )
            items = list(wl.scalars().all())
            if not items:
                skipped += 1
                continue

            claim_id = new_id()
            try:
                db.add(
                    WatchlistClosePushLog(
                        id=claim_id,
                        userId=user_id,
                        tradeDate=trade_date,
                        itemCount=0,
                        sentAt=now,
                    )
                )
                await db.commit()
            except IntegrityError:
                await db.rollback()
                skipped += 1
                continue

            store = None
            try:
                store = await load_user_market_creds(db, user_id)
            except Exception:  # noqa: BLE001
                store = None

            lines: list[str] = []
            for item in items:
                try:
                    q = await get_quote(item.symbol, item.assetType, store=store)
                    lines.append(f"{item.symbol} {q.get('price')}")
                except Exception:  # noqa: BLE001
                    lines.append(f"{item.symbol} n/a")

            # Web Push credentials not ported — record claim + payload log only.
            log.info(
                "[close-push] prepared user=%s date=%s items=%s (web-push deferred)",
                user_id,
                trade_date,
                len(lines),
            )
            row = await db.get(WatchlistClosePushLog, claim_id)
            if row:
                row.itemCount = len(items)
                row.sentAt = datetime.now(timezone.utc)
                await db.commit()
            sent += 1

        log.info(
            "[close-push] done date=%s prepared=%s skipped=%s",
            trade_date,
            sent,
            skipped,
        )
