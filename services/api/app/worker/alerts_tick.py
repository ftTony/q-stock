"""Price alert evaluation tick."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select

from app.core.db import SessionLocal
from app.core.ids import new_id
from app.models.alerts import AlertDeliveryLog, PriceAlert
from app.models.user import User
from app.services.market.facade import get_quote
from app.services.market_creds import load_user_market_creds
from app.worker.alert_rules import is_alert_threshold_hit, next_price_alert_action
from app.worker.mail import send_alert_email

log = logging.getLogger(__name__)

_ALERT_TAKE = 400


async def tick_alerts() -> None:
    async with SessionLocal() as db:
        res = await db.execute(
            select(PriceAlert, User.email)
            .join(User, User.id == PriceAlert.userId)
            .where(PriceAlert.status.in_(("active", "triggered")))
            .order_by(PriceAlert.updatedAt.asc())
            .limit(_ALERT_TAKE)
        )
        rows = list(res.all())
        if not rows:
            log.info("[alerts] no watch alerts @ %s", datetime.now(timezone.utc).isoformat())
            return

        by_user: dict[str, list[tuple[PriceAlert, str]]] = {}
        for alert, email in rows:
            by_user.setdefault(alert.userId, []).append((alert, email))

        for user_id, user_alerts in by_user.items():
            store = None
            try:
                store = await load_user_market_creds(db, user_id)
            except Exception:  # noqa: BLE001
                store = None

            unique: dict[str, tuple[str, str]] = {}
            for alert, _email in user_alerts:
                unique[f"{alert.assetType}:{alert.symbol}"] = (
                    alert.symbol,
                    alert.assetType,
                )

            quotes: dict[str, float] = {}
            for symbol, asset_type in unique.values():
                try:
                    q = await get_quote(symbol, asset_type, store=store)
                    quotes[f"{asset_type}:{symbol}"] = float(q.get("price") or 0)
                except Exception as exc:  # noqa: BLE001
                    log.error("[alerts] quote failed %s: %s", symbol, exc)

            for alert, email in user_alerts:
                key = f"{alert.assetType}:{alert.symbol}"
                price = quotes.get(key)
                if price is None or price != price:
                    continue
                trigger = float(alert.triggerPrice)
                hit = is_alert_threshold_hit(alert.condition, price, trigger)
                action = next_price_alert_action(
                    alert.status,
                    hit,
                    alert.frequency or "always",
                    alert.triggeredAt,
                )
                if action == "hold":
                    continue
                if action == "rearm":
                    alert.status = "active"
                    await db.commit()
                    log.info(
                        "[alerts] re-armed %s %s %s @ %s",
                        alert.symbol,
                        alert.condition,
                        trigger,
                        price,
                    )
                    continue

                try:
                    await send_alert_email(
                        to=email,
                        symbol=alert.symbol,
                        asset_type=alert.assetType,
                        condition=alert.condition,
                        trigger_price=trigger,
                        current_price=price,
                    )
                    now = datetime.now(timezone.utc)
                    alert.status = "triggered"
                    alert.triggeredAt = now
                    db.add(
                        AlertDeliveryLog(
                            id=new_id(),
                            alertId=alert.id,
                            userId=alert.userId,
                            email=email,
                            price=Decimal(str(price)),
                            createdAt=now,
                        )
                    )
                    await db.commit()
                    log.info(
                        "[alerts] triggered %s %s %s @ %s",
                        alert.symbol,
                        alert.condition,
                        trigger,
                        price,
                    )
                except Exception as exc:  # noqa: BLE001
                    await db.rollback()
                    log.error("[alerts] delivery failed %s: %s", alert.id, exc)
