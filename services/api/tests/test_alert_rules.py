from datetime import datetime, timezone

from app.worker.alert_rules import is_alert_threshold_hit, next_price_alert_action


def test_threshold_gte_lte():
    assert is_alert_threshold_hit("gte", 10, 10)
    assert is_alert_threshold_hit("gte", 11, 10)
    assert not is_alert_threshold_hit("gte", 9, 10)
    assert is_alert_threshold_hit("lte", 10, 10)
    assert is_alert_threshold_hit("lte", 9, 10)
    assert not is_alert_threshold_hit("lte", 11, 10)


def test_active_fires_on_hit():
    assert next_price_alert_action("active", True) == "fire"
    assert next_price_alert_action("active", False) == "hold"


def test_always_rearms_after_recovery():
    assert next_price_alert_action("triggered", True, "always") == "hold"
    assert next_price_alert_action("triggered", False, "always") == "rearm"


def test_once_never_fires_again():
    assert next_price_alert_action("triggered", True, "once") == "hold"
    assert next_price_alert_action("triggered", False, "once") == "hold"


def test_daily_fires_new_utc_day():
    day1 = datetime(2026, 1, 1, 12, tzinfo=timezone.utc)
    day2 = datetime(2026, 1, 2, 12, tzinfo=timezone.utc)
    assert (
        next_price_alert_action("triggered", True, "daily", day1, now=day1) == "hold"
    )
    assert (
        next_price_alert_action("triggered", True, "daily", day1, now=day2) == "fire"
    )
