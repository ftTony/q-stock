from __future__ import annotations

import time
from typing import Any

import redis.asyncio as redis

from app.core.settings import get_settings

_redis: redis.Redis | None = None
_memory: dict[str, tuple[Any, float]] = {}


def _trim_memory() -> None:
    max_entries = get_settings().cache_memory_max
    now = time.time()
    expired = [k for k, (_, exp) in _memory.items() if exp <= now]
    for k in expired:
        _memory.pop(k, None)
    while len(_memory) > max_entries:
        _memory.pop(next(iter(_memory)), None)


async def get_redis() -> redis.Redis | None:
    global _redis
    settings = get_settings()
    if _redis is None:
        try:
            client = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=1.5,
                socket_timeout=1.5,
            )
            await client.ping()
            _redis = client
        except Exception:
            _redis = None
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


async def cache_get(key: str) -> str | None:
    client = await get_redis()
    if client is not None:
        try:
            return await client.get(key)
        except Exception:
            pass
    entry = _memory.get(key)
    if not entry:
        return None
    value, exp = entry
    if exp <= time.time():
        _memory.pop(key, None)
        return None
    return value if isinstance(value, str) else str(value)


async def cache_set(key: str, value: str, ttl_seconds: int) -> None:
    client = await get_redis()
    if client is not None:
        try:
            await client.set(key, value, ex=max(1, ttl_seconds))
            return
        except Exception:
            pass
    _memory[key] = (value, time.time() + max(1, ttl_seconds))
    _trim_memory()


async def cache_delete(key: str) -> None:
    client = await get_redis()
    if client is not None:
        try:
            await client.delete(key)
        except Exception:
            pass
    _memory.pop(key, None)


async def rate_limit(key: str, limit: int, window_seconds: int = 60) -> bool:
    """Return True if allowed; fail soft (allow) when Redis is down."""
    client = await get_redis()
    if client is None:
        return True
    try:
        pipe = client.pipeline()
        pipe.incr(key)
        pipe.expire(key, window_seconds, nx=True)
        count, _ = await pipe.execute()
        return int(count) <= limit
    except Exception:
        return True
