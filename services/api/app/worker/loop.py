"""Worker main loop: tick + optional quote-ws."""

from __future__ import annotations

import asyncio
import logging

from app.worker.alerts_tick import tick_alerts
from app.worker.config import poll_interval_seconds
from app.worker.digest_tick import tick_watchlist_digest
from app.worker.paper_tick import tick_paper_orders
from app.worker.push_tick import tick_watchlist_close_push
from app.worker.quote_ws import run_quote_ws_server
from app.worker.sitemap_tick import tick_seo_sitemap

log = logging.getLogger(__name__)

_strategy_warned = False


async def _safe(name: str, coro) -> None:  # type: ignore[no-untyped-def]
    try:
        await coro
    except Exception as exc:  # noqa: BLE001
        log.error("[worker] %s failed: %s", name, exc)


async def tick_once() -> None:
    global _strategy_warned
    await _safe("alerts", tick_alerts())
    await _safe("paper", tick_paper_orders())
    if not _strategy_warned:
        log.warning(
            "[jobs] strategy_replay/lab not ported — skipping (use worker:node if needed)"
        )
        _strategy_warned = True
    await _safe("digest", tick_watchlist_digest())
    await _safe("close-push", tick_watchlist_close_push())
    await _safe("sitemap", tick_seo_sitemap())


async def run_worker() -> None:
    interval = poll_interval_seconds()
    log.info("[worker] started, interval=%.1fs", interval)

    ws_task = asyncio.create_task(run_quote_ws_server(), name="quote-ws")
    try:
        while True:
            await tick_once()
            await asyncio.sleep(interval)
    finally:
        ws_task.cancel()
        try:
            await ws_task
        except asyncio.CancelledError:
            pass
