"""Daily sitemap precompute (minimal index + day marker)."""

from __future__ import annotations

import logging
from pathlib import Path

from app.core.settings import get_settings
from app.services.market.session import is_us_midnight_window, us_trade_date
from app.worker.config import sitemap_dir

log = logging.getLogger(__name__)

_MARKER = ".seo-sitemap-day"
_LAYOUT = "py1"


async def tick_seo_sitemap() -> None:
    if not is_us_midnight_window():
        return
    day = us_trade_date()
    out = sitemap_dir()
    try:
        out.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        log.error("[seo] cannot create sitemap dir %s: %s", out, exc)
        return

    marker = out / _MARKER
    expected = f"{day}:{_LAYOUT}"
    try:
        if marker.is_file() and marker.read_text(encoding="utf-8").strip() == expected:
            return
    except OSError:
        pass

    origin = (get_settings().app_url or "https://www.q-stock.cn").rstrip("/")
    # Prefer production origin for SEO when APP_URL is localhost.
    if "localhost" in origin or "127.0.0.1" in origin:
        origin = "https://www.q-stock.cn"

    index_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>{origin}/sitemaps/sitemap-static.xml</loc></sitemap>
</sitemapindex>
"""
    static_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{origin}/</loc></url>
  <url><loc>{origin}/en</loc></url>
  <url><loc>{origin}/zh-CN</loc></url>
</urlset>
"""
    try:
        (out / "sitemap.xml").write_text(index_xml, encoding="utf-8")
        (out / "sitemap-static.xml").write_text(static_xml, encoding="utf-8")
        marker.write_text(expected, encoding="utf-8")
        log.info("[seo] sitemap generated for ET day=%s dir=%s", day, out)
    except OSError as exc:
        log.error("[seo] sitemap write failed: %s", exc)
