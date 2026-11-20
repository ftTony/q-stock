"""Watchlist close digest (minimal email)."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError

from app.core.db import SessionLocal
from app.core.ids import new_id
from app.core.settings import get_settings
from app.models.alerts import WatchlistDigestLog
from app.models.user import User
from app.models.watchlist import WatchlistItem
from app.services.market.session import is_us_market_close_window, us_trade_date
from app.worker.config import digest_window_minutes
from app.worker.mail import send_email

log = logging.getLogger(__name__)


async def tick_watchlist_digest() -> None:
    settings = get_settings()
    if not settings.watchlist_digest_enabled:
        return
    start, end = digest_window_minutes(settings)
    if not is_us_market_close_window(start_minutes=start, end_minutes=end):
        return

    trade_date = us_trade_date()
    now = datetime.now(timezone.utc)

    async with SessionLocal() as db:
        res = await db.execute(
            select(User)
            .where(
                User.plan == "pro",
                or_(User.planExpiresAt.is_(None), User.planExpiresAt > now),
            )
            .limit(50)
        )
        users = list(res.scalars().all())
        if not users:
            log.info("[digest] no Pro users @ %s", trade_date)
            return

        sent = 0
        skipped = 0
        for user in users:
            wl = await db.execute(
                select(WatchlistItem)
                .where(WatchlistItem.userId == user.id)
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
                    WatchlistDigestLog(
                        id=claim_id,
                        userId=user.id,
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

            lines = [f"{i.symbol} ({i.assetType})" for i in items]
            body = (
                f"q-stock watchlist close digest — {trade_date} ET\n\n"
                + "\n".join(lines)
                + "\n"
            )
            try:
                await send_email(
                    to=user.email,
                    subject=f"[q-stock] Watchlist digest {trade_date}",
                    body=body,
                )
                log_row = await db.get(WatchlistDigestLog, claim_id)
                if log_row:
                    log_row.itemCount = len(items)
                    log_row.sentAt = datetime.now(timezone.utc)
                    await db.commit()
                sent += 1
            except Exception as exc:  # noqa: BLE001
                log.error("[digest] send failed %s: %s", user.id, exc)
                row = await db.get(WatchlistDigestLog, claim_id)
                if row:
                    await db.delete(row)
                    await db.commit()

        log.info(
            "[digest] done date=%s sent=%s skipped=%s users=%s",
            trade_date,
            sent,
            skipped,
            len(users),
        )
