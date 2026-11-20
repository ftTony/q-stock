"""Minimal SMTP send for alert / digest emails."""

from __future__ import annotations

import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.core.settings import get_settings

log = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool((get_settings().smtp_host or "").strip())


def _send_sync(*, to: str, subject: str, body: str) -> None:
    settings = get_settings()
    host = (settings.smtp_host or "").strip()
    if not host:
        raise RuntimeError("SMTP_HOST not configured")

    msg = EmailMessage()
    msg["From"] = settings.email_from or "alerts@example.com"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    port = int(settings.smtp_port or 587)
    if settings.smtp_secure:
        with smtplib.SMTP_SSL(host, port, timeout=20) as smtp:
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_pass or "")
            smtp.send_message(msg)
    else:
        with smtplib.SMTP(host, port, timeout=20) as smtp:
            smtp.ehlo()
            try:
                smtp.starttls()
            except smtplib.SMTPException:
                pass
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_pass or "")
            smtp.send_message(msg)


async def send_email(*, to: str, subject: str, body: str) -> bool:
    """Send email. Returns False when SMTP unset (logged skip)."""
    if not smtp_configured():
        log.warning("[mail] SMTP unset — skip send to %s subject=%s", to, subject)
        return False
    await asyncio.to_thread(_send_sync, to=to, subject=subject, body=body)
    return True


async def send_alert_email(
    *,
    to: str,
    symbol: str,
    asset_type: str,
    condition: str,
    trigger_price: float,
    current_price: float,
) -> bool:
    subject = f"[q-stock] {symbol} alert {condition} {trigger_price}"
    body = (
        f"Symbol: {symbol} ({asset_type})\n"
        f"Condition: {condition} {trigger_price}\n"
        f"Current price: {current_price}\n"
    )
    return await send_email(to=to, subject=subject, body=body)
