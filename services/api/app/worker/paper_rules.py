"""Pending paper-order trigger rules (parity with shouldTriggerPending)."""

from __future__ import annotations


def should_trigger_pending(
    *,
    order_type: str,
    side: str,
    price: float,
    limit_price: float | None,
    stop_price: float | None,
) -> bool:
    if order_type == "limit":
        if limit_price is None:
            return False
        return price <= limit_price if side == "buy" else price >= limit_price
    if order_type == "stop":
        if stop_price is None:
            return False
        return price >= stop_price if side == "buy" else price <= stop_price
    return False
