"""Unit tests for margin math, interest accrual and trade-PIN validation."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest

from app.services.trade_password import is_valid_trade_pin
from app.services.trading import (
    MARGIN_INTEREST_APR,
    account_metrics,
    accrue_interest,
)


def test_account_metrics_cash_book() -> None:
    m = account_metrics(
        account_type="cash",
        cash=Decimal("100000"),
        gross=Decimal("20000"),
        borrowed=Decimal("0"),
        interest=Decimal("0"),
    )
    assert m["equity"] == Decimal("120000")
    assert m["leverage"] == Decimal("1")
    assert m["buyingPower"] == Decimal("100000")


def test_account_metrics_margin_book() -> None:
    m = account_metrics(
        account_type="margin",
        cash=Decimal("50000"),
        gross=Decimal("40000"),
        borrowed=Decimal("10000"),
        interest=Decimal("100"),
    )
    # equity = 50000 + 40000 - 10000 - 100 = 79900
    assert m["equity"] == Decimal("79900")
    assert m["maxExposure"] == Decimal("159800")
    # buying power = 2×equity - gross
    assert m["buyingPower"] == Decimal("119800")


def test_account_metrics_margin_buying_power_never_negative() -> None:
    m = account_metrics(
        account_type="margin",
        cash=Decimal("0"),
        gross=Decimal("10000"),
        borrowed=Decimal("150000"),
        interest=Decimal("0"),
    )
    # equity = -140000 → exposure cap negative → buying power floored at 0
    assert m["buyingPower"] == Decimal("0")


def test_accrue_interest_noop_for_cash() -> None:
    interest, at = accrue_interest(
        "cash",
        Decimal("10000"),
        Decimal("0"),
        datetime.now(timezone.utc) - timedelta(days=10),
    )
    assert interest == Decimal("0")
    assert at is not None  # unchanged None passthrough happens only via caller


def test_accrue_interest_accrues_daily() -> None:
    base = datetime.now(timezone.utc) - timedelta(days=365)
    interest, at = accrue_interest("margin", Decimal("10000"), Decimal("0"), base)
    assert at is not None
    # borrowed × APR × 1 year
    expected = Decimal("10000") * MARGIN_INTEREST_APR
    assert abs(float(interest) - float(expected)) < 1.0
    # zero borrowing → unchanged
    interest2, _ = accrue_interest("margin", Decimal("0"), Decimal("7"), base)
    assert interest2 == Decimal("7")


def test_accrue_interest_noop_when_no_time_passed() -> None:
    now = datetime.now(timezone.utc)
    interest, at = accrue_interest("margin", Decimal("10000"), Decimal("5"), now)
    # microseconds may elapse between calls — accrual must stay negligible
    assert abs(interest - Decimal("5")) < Decimal("0.01")
    assert at is not None


def test_trade_pin_validation() -> None:
    assert is_valid_trade_pin("123456")
    assert not is_valid_trade_pin("12345")
    assert not is_valid_trade_pin("1234567")
    assert not is_valid_trade_pin("12a456")
    assert not is_valid_trade_pin(None)
    assert not is_valid_trade_pin("")
