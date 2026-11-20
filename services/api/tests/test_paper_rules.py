from app.worker.paper_rules import should_trigger_pending


def test_limit_buy_sell():
    assert should_trigger_pending(
        order_type="limit", side="buy", price=9, limit_price=10, stop_price=None
    )
    assert not should_trigger_pending(
        order_type="limit", side="buy", price=11, limit_price=10, stop_price=None
    )
    assert should_trigger_pending(
        order_type="limit", side="sell", price=11, limit_price=10, stop_price=None
    )


def test_stop_buy_sell():
    assert should_trigger_pending(
        order_type="stop", side="buy", price=11, limit_price=None, stop_price=10
    )
    assert should_trigger_pending(
        order_type="stop", side="sell", price=9, limit_price=None, stop_price=10
    )
