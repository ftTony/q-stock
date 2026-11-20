"""Worker-facing settings helpers."""

from __future__ import annotations

from pathlib import Path

from app.core.settings import Settings, get_settings


def poll_interval_seconds(settings: Settings | None = None) -> float:
    s = settings or get_settings()
    ms = max(5_000, int(s.alert_poll_interval_ms or 45_000))
    return ms / 1000.0


def parse_hhmm(raw: str, fallback_minutes: int) -> int:
    text = (raw or "").strip()
    if not text:
        return fallback_minutes
    parts = text.split(":")
    if len(parts) != 2:
        return fallback_minutes
    try:
        h = int(parts[0])
        m = int(parts[1])
    except ValueError:
        return fallback_minutes
    if h < 0 or h > 23 or m < 0 or m > 59:
        return fallback_minutes
    return h * 60 + m


def digest_window_minutes(settings: Settings | None = None) -> tuple[int, int]:
    s = settings or get_settings()
    return (
        parse_hhmm(s.watchlist_digest_start_et, 16 * 60),
        parse_hhmm(s.watchlist_digest_end_et, 17 * 60),
    )


def sitemap_dir(settings: Settings | None = None) -> Path:
    s = settings or get_settings()
    raw = (s.sitemap_out_dir or "").strip()
    if raw:
        return Path(raw)
    # monorepo: services/api/app/worker → repo root public/sitemaps
    return Path(__file__).resolve().parents[4] / "public" / "sitemaps"
