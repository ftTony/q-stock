import asyncio
from datetime import datetime, timezone
from types import SimpleNamespace
from zoneinfo import ZoneInfo

from app.api.v1 import market as market_api
from app.services.market import facade, longbridge
from longport.openapi import TradeSessions


def _bar(hour: int, minute: int) -> dict:
    time = int(
        datetime(2026, 1, 5, hour, minute, tzinfo=ZoneInfo("America/New_York")).timestamp()
    )
    return {
        "time": time,
        "open": 10,
        "high": 10,
        "low": 10,
        "close": 10,
        "volume": 1,
    }


def test_candles_endpoint_forwards_extended_hours(monkeypatch):
    received = {}

    async def get_candles(*args, **kwargs):
        received.update(kwargs)
        return {"bars": []}

    monkeypatch.setattr(market_api, "get_candles", get_candles)

    asyncio.run(
        market_api.candles(
            symbol="AAPL",
            assetType="stock",
            resolution="1",
            from_=None,
            to=None,
            extended=True,
            _user=None,
        )
    )

    assert received["extended_hours"] is True


def test_extended_candles_bypass_regular_session_filter_and_cache_separately(
    monkeypatch,
):
    bars = [
        _bar(9, 29),
        _bar(9, 30),
        _bar(15, 59),
        _bar(16, 0),
    ]
    cache_keys = []

    async def cache_get(key):
        cache_keys.append(key)
        return None

    async def cache_set(*args):
        return None

    async def futu_candles(*args, **kwargs):
        return bars

    monkeypatch.setattr(facade, "cache_get", cache_get)
    monkeypatch.setattr(facade, "cache_set", cache_set)
    monkeypatch.setattr(facade, "list_providers_for", lambda *_: ["futu"])
    monkeypatch.setattr(facade, "futu_candles", futu_candles)

    async def load_both_sessions():
        regular = await facade.get_candles(
            "AAPL",
            "stock",
            resolution="1",
            frm=1,
            to=2,
            extended_hours=False,
        )
        extended = await facade.get_candles(
            "AAPL",
            "stock",
            resolution="1",
            frm=1,
            to=2,
            extended_hours=True,
        )
        return regular, extended

    regular, extended = asyncio.run(load_both_sessions())

    assert [bar["time"] for bar in regular["bars"]] == [
        bars[1]["time"],
        bars[2]["time"],
    ]
    assert [bar["time"] for bar in extended["bars"]] == [
        bar["time"] for bar in bars
    ]
    assert len(set(cache_keys)) == 2


def test_longbridge_candles_use_requested_trade_session(monkeypatch):
    timestamp = 1_767_632_400

    class QuoteContext:
        def history_candlesticks_by_date(self, *args):
            self.trade_sessions = args[-1]
            return [
                SimpleNamespace(
                    timestamp=datetime.fromtimestamp(timestamp, timezone.utc),
                    open=1,
                    high=2,
                    low=1,
                    close=2,
                    volume=3,
                )
            ]

    context = QuoteContext()
    monkeypatch.setattr(longbridge, "_build_quote_ctx", lambda _: context)

    for extended_hours, expected_session in (
        (False, TradeSessions.Intraday),
        (True, TradeSessions.All),
    ):
        bars = longbridge._candles_sync(
            {},
            "AAPL",
            "stock",
            "1",
            timestamp - 60,
            timestamp + 60,
            extended_hours=extended_hours,
        )

        assert context.trade_sessions == expected_session
        assert bars[0]["time"] == timestamp
