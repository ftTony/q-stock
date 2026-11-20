"""Quote WebSocket hub — REST poll fallback (protocol-compatible subset)."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from app.core.settings import get_settings
from app.services.market.facade import get_quote

log = logging.getLogger(__name__)

try:
    from websockets.asyncio.server import serve
except ImportError:  # pragma: no cover
    serve = None  # type: ignore[assignment]


def _channel_key(ch: dict[str, Any]) -> str | None:
    kind = ch.get("type")
    if kind == "indices":
        return "indices"
    if kind in ("symbol", "depth", "trades"):
        asset = ch.get("assetType") or "stock"
        symbol = str(ch.get("symbol") or "").strip().upper()
        if not symbol:
            return None
        return f"{kind}:{asset}:{symbol}"
    return None


def _parse_symbol_key(key: str) -> tuple[str, str] | None:
    parts = key.split(":", 2)
    if len(parts) != 3 or parts[0] != "symbol":
        return None
    return parts[1], parts[2]


class QuoteHub:
    def __init__(self) -> None:
        self._clients: dict[Any, set[str]] = {}
        self._channel_subs: dict[str, set[Any]] = {}
        self._lock = asyncio.Lock()
        self._poll_task: asyncio.Task[None] | None = None

    async def start_poll(self) -> None:
        if self._poll_task is None:
            self._poll_task = asyncio.create_task(self._poll_loop(), name="quote-ws-poll")

    async def attach(self, ws: Any) -> None:
        path = ""
        req = getattr(ws, "request", None)
        if req is not None:
            path = getattr(req, "path", "") or ""
        if path.rstrip("/") not in ("/ws/quotes", ""):
            await ws.close(1008, "expected /ws/quotes")
            return

        async with self._lock:
            self._clients[ws] = set()
        await self._send(ws, {"op": "hello", "push": False})
        try:
            async for raw in ws:
                await self._on_message(ws, raw)
        finally:
            await self._detach(ws)

    async def _detach(self, ws: Any) -> None:
        async with self._lock:
            channels = self._clients.pop(ws, set())
            for key in channels:
                subs = self._channel_subs.get(key)
                if subs:
                    subs.discard(ws)
                    if not subs:
                        self._channel_subs.pop(key, None)

    async def _on_message(self, ws: Any, raw: str | bytes) -> None:
        try:
            msg = json.loads(raw)
        except json.JSONDecodeError:
            await self._send(ws, {"op": "error", "message": "invalid json"})
            return
        op = msg.get("op")
        if op == "ping":
            await self._send(ws, {"op": "pong"})
            return
        if op in ("subscribe", "unsubscribe"):
            channels = msg.get("channels") or []
            if not isinstance(channels, list):
                return
            if op == "subscribe":
                await self._subscribe(ws, channels)
            else:
                await self._unsubscribe(ws, channels)

    async def _subscribe(self, ws: Any, channels: list[dict[str, Any]]) -> None:
        settings = get_settings()
        max_subs = max(1, int(settings.quote_ws_max_subscriptions or 40))
        async with self._lock:
            current = self._clients.get(ws)
            if current is None:
                return
            for ch in channels:
                if len(current) >= max_subs:
                    await self._send(ws, {"op": "error", "message": "subscription limit"})
                    break
                key = _channel_key(ch)
                if not key:
                    continue
                current.add(key)
                self._channel_subs.setdefault(key, set()).add(ws)

    async def _unsubscribe(self, ws: Any, channels: list[dict[str, Any]]) -> None:
        async with self._lock:
            current = self._clients.get(ws)
            if current is None:
                return
            for ch in channels:
                key = _channel_key(ch)
                if not key:
                    continue
                current.discard(key)
                subs = self._channel_subs.get(key)
                if subs:
                    subs.discard(ws)
                    if not subs:
                        self._channel_subs.pop(key, None)

    async def _poll_loop(self) -> None:
        settings = get_settings()
        interval = max(1.0, (settings.quote_poll_ms or 4000) / 1000.0)
        while True:
            try:
                await self._poll_once()
            except Exception as exc:  # noqa: BLE001
                log.error("[quote-ws] poll error: %s", exc)
            await asyncio.sleep(interval)

    async def _poll_once(self) -> None:
        async with self._lock:
            symbol_keys = [k for k in self._channel_subs if k.startswith("symbol:")]
        for key in symbol_keys:
            parsed = _parse_symbol_key(key)
            if not parsed:
                continue
            asset_type, symbol = parsed
            try:
                quote = await get_quote(symbol, asset_type, store=None)
            except Exception as exc:  # noqa: BLE001
                log.warning("[quote-ws] quote failed %s: %s", key, exc)
                continue
            async with self._lock:
                targets = list(self._channel_subs.get(key, ()))
            for ws in targets:
                await self._send(ws, {"op": "quote", "quote": quote})

    @staticmethod
    async def _send(ws: Any, msg: dict[str, Any]) -> None:
        try:
            await ws.send(json.dumps(msg, default=str))
        except Exception:  # noqa: BLE001
            pass


_hub = QuoteHub()


async def run_quote_ws_server() -> None:
    settings = get_settings()
    if not settings.quote_ws_enabled:
        log.info("[quote-ws] disabled (QUOTE_WS_ENABLED=false)")
        await asyncio.Future()
        return
    if serve is None:
        log.error("[quote-ws] websockets package missing — idle")
        await asyncio.Future()
        return

    port = int(settings.quote_ws_port or 3001)
    await _hub.start_poll()

    async def handler(ws: Any) -> None:
        await _hub.attach(ws)

    log.info("[quote-ws] listening ws://0.0.0.0:%s/ws/quotes", port)
    async with serve(handler, "0.0.0.0", port):
        await asyncio.Future()
