"""Price-alert threshold / re-arm rules (parity with src/lib/alerts/threshold.ts)."""

from __future__ import annotations

from datetime import datetime, timezone


def is_alert_threshold_hit(condition: str, price: float, trigger: float) -> bool:
    return price >= trigger if condition == "gte" else price <= trigger


def same_utc_day(a: datetime, b: datetime) -> bool:
    au = a.astimezone(timezone.utc) if a.tzinfo else a.replace(tzinfo=timezone.utc)
    bu = b.astimezone(timezone.utc) if b.tzinfo else b.replace(tzinfo=timezone.utc)
    return (au.year, au.month, au.day) == (bu.year, bu.month, bu.day)


def next_price_alert_action(
    status: str,
    hit: bool,
    frequency: str = "always",
    last_triggered_at: datetime | None = None,
    now: datetime | None = None,
) -> str:
    """Return fire | rearm | hold."""
    now = now or datetime.now(timezone.utc)
    if status == "disabled":
        return "hold"

    if status == "triggered":
        if frequency == "once":
            return "hold"
        if frequency == "daily":
            if hit:
                if not last_triggered_at or not same_utc_day(last_triggered_at, now):
                    return "fire"
                return "hold"
            return "rearm"
        return "hold" if hit else "rearm"

    return "fire" if hit else "hold"
