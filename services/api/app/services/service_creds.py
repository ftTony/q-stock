"""Load / merge / status for encrypted user service (email/AI/webhook) credentials."""

from __future__ import annotations

import logging
import time
from typing import Any
from urllib.parse import urlparse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.secret_box import decrypt_json
from app.models.user import UserServiceCredential

log = logging.getLogger(__name__)

CACHE_TTL_S = 60
_CACHE_MAX = 200
_cache: dict[str, tuple[dict[str, Any], float]] = {}

AI_VENDORS = frozenset(
    {"deepseek", "openai", "openai_compat", "gemini", "anthropic"}
)
OVERSEAS_PLATFORMS = frozenset({"slack", "discord", "telegram", "generic"})


def invalidate_user_service_creds_cache(user_id: str) -> None:
    _cache.pop(user_id, None)


def _trim_cache() -> None:
    now = time.time()
    expired = [k for k, (_, exp) in _cache.items() if exp <= now]
    for k in expired:
        _cache.pop(k, None)
    while len(_cache) > _CACHE_MAX:
        _cache.pop(next(iter(_cache)), None)


def _parse_email(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    channel = str(raw.get("channel") or "").lower()
    from_addr = str(raw.get("from") or "").strip()
    if not from_addr:
        return None
    if channel == "resend":
        key = str(raw.get("resendApiKey") or "").strip()
        if not key:
            return None
        return {"channel": "resend", "from": from_addr, "resendApiKey": key}
    if channel == "smtp":
        host = str(raw.get("smtpHost") or "").strip()
        if not host:
            return None
        return {
            "channel": "smtp",
            "from": from_addr,
            "smtpHost": host,
            "smtpPort": int(raw.get("smtpPort") or 587),
            "smtpUser": str(raw.get("smtpUser") or "").strip() or None,
            "smtpPass": str(raw.get("smtpPass") or "").strip() or None,
            "smtpSecure": raw.get("smtpSecure") is True
            or raw.get("smtpSecure") == "true",
        }
    return None


def _parse_ai(raw: Any) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    vendor = str(raw.get("vendor") or "").lower()
    api_key = str(raw.get("apiKey") or "").strip()
    model = str(raw.get("model") or "").strip()
    if not api_key or not model or vendor not in AI_VENDORS:
        return None
    base_url = str(raw.get("baseUrl") or "").strip().rstrip("/") or None
    if vendor == "openai_compat" and not base_url:
        return None
    return {"vendor": vendor, "apiKey": api_key, "model": model, "baseUrl": base_url}


def _parse_notify_webhook(raw: Any, *, require_platform: bool) -> dict[str, Any] | None:
    if not isinstance(raw, dict):
        return None
    webhook_url = str(raw.get("webhookUrl") or "").strip()
    if not webhook_url or not webhook_url.lower().startswith("https://"):
        return None
    if require_platform:
        platform = str(raw.get("platform") or "").strip().lower()
        if platform not in OVERSEAS_PLATFORMS:
            return None
        return {"webhookUrl": webhook_url, "platform": platform}
    return {"webhookUrl": webhook_url}


def _webhook_status(creds: dict[str, Any] | None) -> dict[str, Any]:
    if not creds or not creds.get("webhookUrl"):
        return {"configured": False}
    host_hint: str | None = None
    try:
        host_hint = urlparse(str(creds["webhookUrl"])).hostname or None
    except Exception:
        host_hint = None
    out: dict[str, Any] = {"configured": True, "hostHint": host_hint}
    if creds.get("platform"):
        out["platform"] = creds["platform"]
    return out


async def load_user_service_creds(db: AsyncSession, user_id: str) -> dict[str, Any]:
    hit = _cache.get(user_id)
    if hit and hit[1] > time.time():
        return hit[0]

    rows = (
        await db.execute(
            select(UserServiceCredential).where(UserServiceCredential.userId == user_id)
        )
    ).scalars().all()

    store: dict[str, Any] = {"userId": user_id}
    for row in rows:
        try:
            parsed = decrypt_json(row.payload)
            if row.provider == "email":
                store["email"] = _parse_email(parsed)
            elif row.provider == "ai":
                store["ai"] = _parse_ai(parsed)
            elif row.provider == "feishu":
                store["feishu"] = _parse_notify_webhook(parsed, require_platform=False)
            elif row.provider == "notify_webhook":
                store["notifyWebhook"] = _parse_notify_webhook(
                    parsed, require_platform=True
                )
        except Exception as exc:
            log.error(
                "service-creds decrypt failed user=%s provider=%s: %s",
                user_id,
                row.provider,
                exc,
            )

    _cache[user_id] = (store, time.time() + CACHE_TTL_S)
    _trim_cache()
    return store


async def get_user_service_creds_status(db: AsyncSession, user_id: str) -> dict[str, Any]:
    store = await load_user_service_creds(db, user_id)
    email = store.get("email")
    ai = store.get("ai")
    return {
        "email": (
            {
                "configured": True,
                "channel": email["channel"],
                "from": email["from"],
            }
            if email
            else {"configured": False}
        ),
        "ai": (
            {
                "configured": True,
                "vendor": ai["vendor"],
                "model": ai["model"],
                "baseUrl": ai.get("baseUrl"),
            }
            if ai
            else {"configured": False}
        ),
        "feishu": _webhook_status(store.get("feishu")),
        "notifyWebhook": _webhook_status(store.get("notifyWebhook")),
    }


def merge_email_creds(
    incoming: dict[str, Any], existing: dict[str, Any] | None
) -> dict[str, Any] | None:
    from_addr = str(incoming.get("from") or "").strip()
    if not from_addr:
        return None
    channel = incoming.get("channel")
    if channel == "resend":
        key = (
            str(incoming.get("resendApiKey") or "").strip()
            or (existing or {}).get("resendApiKey")
            or ""
        )
        if not key:
            return None
        return {"channel": "resend", "from": from_addr, "resendApiKey": key}
    host = (
        str(incoming.get("smtpHost") or "").strip()
        or (existing or {}).get("smtpHost")
        or ""
    )
    if not host:
        return None
    smtp_pass = (
        str(incoming.get("smtpPass") or "").strip()
        or (existing or {}).get("smtpPass")
        or None
    )
    return {
        "channel": "smtp",
        "from": from_addr,
        "smtpHost": host,
        "smtpPort": incoming.get("smtpPort")
        if incoming.get("smtpPort") is not None
        else (existing or {}).get("smtpPort", 587),
        "smtpUser": (
            str(incoming.get("smtpUser") or "").strip()
            or (existing or {}).get("smtpUser")
            or None
        ),
        "smtpPass": smtp_pass,
        "smtpSecure": (
            incoming["smtpSecure"]
            if "smtpSecure" in incoming and incoming["smtpSecure"] is not None
            else (existing or {}).get("smtpSecure", False)
        ),
    }


def merge_ai_creds(
    incoming: dict[str, Any], existing: dict[str, Any] | None
) -> dict[str, Any] | None:
    model = str(incoming.get("model") or "").strip()
    if not model:
        return None
    api_key = (
        str(incoming.get("apiKey") or "").strip()
        or (existing or {}).get("apiKey")
        or ""
    )
    if not api_key:
        return None
    vendor = incoming["vendor"]
    base_url = str(incoming.get("baseUrl") or "").strip().rstrip("/") or (
        (existing or {}).get("baseUrl") if vendor == (existing or {}).get("vendor") else None
    )
    if vendor == "openai_compat" and not base_url:
        return None
    return {
        "vendor": vendor,
        "apiKey": api_key,
        "model": model,
        "baseUrl": None if vendor == "openai" else base_url,
    }


def merge_notify_webhook_creds(
    incoming: dict[str, Any],
    existing: dict[str, Any] | None,
    *,
    require_platform: bool = False,
) -> dict[str, Any] | None:
    webhook_url = (
        str(incoming.get("webhookUrl") or "").strip()
        or (existing or {}).get("webhookUrl")
        or ""
    )
    if not webhook_url or not str(webhook_url).lower().startswith("https://"):
        return None
    if require_platform:
        platform = incoming.get("platform") or (existing or {}).get("platform")
        if not platform or platform not in OVERSEAS_PLATFORMS:
            return None
        return {"webhookUrl": webhook_url, "platform": platform}
    return {"webhookUrl": webhook_url}
