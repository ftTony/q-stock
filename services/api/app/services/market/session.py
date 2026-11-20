"""US equity session phase (parity with src/lib/market/session.ts)."""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

_NY = ZoneInfo("America/New_York")


def _as_ny(now: datetime | None = None) -> datetime:
    if now is None:
        return datetime.now(_NY)
    if now.tzinfo is None:
        return now.replace(tzinfo=_NY)
    return now.astimezone(_NY)


def _ny_clock(now: datetime | None = None) -> tuple[int, int]:
    """Return (weekday Mon=0, minutes-from-midnight) in America/New_York."""
    dt = _as_ny(now)
    return dt.weekday(), dt.hour * 60 + dt.minute


def us_trade_date(now: datetime | None = None) -> str:
    return _as_ny(now).strftime("%Y-%m-%d")


def is_us_market_close_window(
    now: datetime | None = None,
    *,
    start_minutes: int = 16 * 60,
    end_minutes: int = 17 * 60,
) -> bool:
    weekday, minutes = _ny_clock(now)
    if weekday >= 5:
        return False
    return start_minutes <= minutes < end_minutes


def is_us_midnight_window(
    now: datetime | None = None,
    *,
    start_minutes: int = 0,
    end_minutes: int = 60,
) -> bool:
    _weekday, minutes = _ny_clock(now)
    return start_minutes <= minutes < end_minutes


def get_us_market_phase(now: datetime | None = None) -> str:
    """pre | regular | post | overnight | closed."""
    dt = now.astimezone(_NY) if now else datetime.now(_NY)
    if dt.weekday() >= 5:
        return "closed"
    minutes = dt.hour * 60 + dt.minute
    if 4 * 60 <= minutes < 9 * 60 + 30:
        return "pre"
    if 9 * 60 + 30 <= minutes < 16 * 60:
        return "regular"
    if 16 * 60 <= minutes < 20 * 60:
        return "post"
    return "overnight"


def resolve_active_session(
    *,
    pre: dict | None,
    post: dict | None,
    overnight: dict | None,
) -> str:
    phase = get_us_market_phase()
    if phase == "pre" and pre:
        return "pre"
    if phase == "post" and post:
        return "post"
    if phase == "overnight" and overnight:
        return "overnight"
    if phase == "overnight" and post:
        return "post"
    if phase == "closed" and post:
        return "post"
    if phase == "closed" and overnight:
        return "overnight"
    return "regular"


def apply_active_extended_price(row: dict) -> dict:
    """Overlay primary price/change from active extended snapshot (TS parity)."""
    session = row.get("activeSession") or "regular"
    if session == "regular":
        return row
    ext = (
        row.get("preMarket")
        if session == "pre"
        else row.get("postMarket")
        if session == "post"
        else row.get("overnight")
    )
    if not isinstance(ext, dict) or not float(ext.get("price") or 0) > 0:
        return row
    if "regularSession" not in row:
        row = {
            **row,
            "regularSession": {
                "price": row.get("price"),
                "change": row.get("change"),
                "percentChange": row.get("percentChange"),
                "timestamp": row.get("timestamp") or row.get("asOf"),
            },
        }
    out = {
        **row,
        "price": ext["price"],
        "change": ext.get("change", 0),
        "percentChange": ext.get("percentChange", 0),
        "changePercent": ext.get("percentChange", 0),
    }
    if ext.get("timestamp") is not None:
        out["timestamp"] = ext["timestamp"]
        out["asOf"] = ext["timestamp"]
    return out
