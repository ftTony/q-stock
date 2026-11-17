from __future__ import annotations

from urllib.parse import quote

from fastapi import APIRouter, Depends, Query, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit
from app.api.v1.auth import _set_refresh_cookie
from app.core.db import get_db
from app.core.errors import AppError
from app.core.settings import get_settings
from app.schemas.auth import TokenResponse
from app.services import auth_service
from app.services import oauth_social

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])


class OneTapBody(BaseModel):
    credential: str = Field(min_length=20)


class ForgotBody(BaseModel):
    email: EmailStr


class ResetBody(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    password: str = Field(min_length=6, max_length=72)


def _safe_callback(url: str | None) -> str:
    settings = get_settings()
    base = settings.app_url.rstrip("/")
    if not url:
        return f"{base}/"
    # Only allow relative paths or same-origin
    if url.startswith("/") and not url.startswith("//"):
        return f"{base}{url}"
    if url.startswith(base):
        return url
    return f"{base}/"


@router.get("/providers")
async def list_providers() -> dict:
    providers = []
    if oauth_social.google_configured():
        providers.append({"id": "google", "name": "Google"})
    if oauth_social.github_configured():
        providers.append({"id": "github", "name": "GitHub"})
    return {
        "providers": providers,
        "onetap": oauth_social.onetap_configured(),
    }


@router.get("/oauth/{provider}/start")
async def oauth_start(
    provider: str,
    callbackUrl: str | None = Query(default=None),
) -> RedirectResponse:
    if provider not in {"google", "github"}:
        raise AppError("Unknown provider", code="OAUTH_PROVIDER", status_code=400)
    cb = _safe_callback(callbackUrl)
    url = await oauth_social.build_authorize_url(provider, cb)
    return RedirectResponse(url, status_code=302)


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> RedirectResponse:
    settings = get_settings()
    if error or not code or not state:
        dest = f"{settings.app_url.rstrip('/')}/login?error=oauth"
        return RedirectResponse(dest, status_code=302)
    if provider not in {"google", "github"}:
        raise AppError("Unknown provider", code="OAUTH_PROVIDER", status_code=400)

    stored_provider, verifier, callback_url = await oauth_social.pop_oauth_state(state)
    if stored_provider != provider:
        raise AppError("OAuth state mismatch", code="OAUTH_STATE", status_code=400)

    try:
        if provider == "google":
            claims = await oauth_social.exchange_google_code(code, verifier)
        else:
            claims = await oauth_social.exchange_github_code(code)
    except AppError:
        dest = f"{settings.app_url.rstrip('/')}/login?error=oauth"
        return RedirectResponse(dest, status_code=302)
    except Exception:  # noqa: BLE001
        dest = f"{settings.app_url.rstrip('/')}/login?error=oauth"
        return RedirectResponse(dest, status_code=302)

    user = await auth_service.upsert_oauth_user(
        db,
        email=claims["email"],
        name=claims.get("name"),
    )
    access, refresh, access_ttl, refresh_ttl = await auth_service.issue_tokens(user)
    # Redirect with tokens in fragment for SPA to pick up (cookie also set).
    dest = _safe_callback(callback_url)
    sep = "&" if "?" in dest else "?"
    # Prefer cookie; also pass one-time access via query for sessionStorage bootstrap.
    redirect = RedirectResponse(
        f"{dest}{sep}accessToken={quote(access)}&expiresIn={access_ttl}",
        status_code=302,
    )
    _set_refresh_cookie(redirect, refresh, refresh_ttl)
    # Body refresh not available on redirect — store refresh only in cookie;
    # client continue page should call /refresh or we append refresh (less ideal).
    # Add refresh to query for bootstrap (HTTPS only in prod; local OK).
    redirect.headers["location"] = (
        f"{dest}{sep}accessToken={quote(access)}"
        f"&refreshToken={quote(refresh)}&expiresIn={access_ttl}"
    )
    return redirect


@router.post("/onetap", response_model=TokenResponse)
async def onetap(
    body: OneTapBody,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    claims = await oauth_social.verify_google_id_token(body.credential)
    user = await auth_service.upsert_oauth_user(
        db,
        email=claims["email"],
        name=claims.get("name"),
    )
    access, refresh, access_ttl, refresh_ttl = await auth_service.issue_tokens(user)
    _set_refresh_cookie(response, refresh, refresh_ttl)
    return TokenResponse(
        accessToken=access,
        refreshToken=refresh,
        expiresIn=access_ttl,
        user=auth_service.user_public(user),
    )


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotBody,
    db: AsyncSession = Depends(get_db),
) -> dict:
    await auth_service.request_password_reset(db, email=body.email)
    return {"ok": True, "message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    body: ResetBody,
    db: AsyncSession = Depends(get_db),
) -> dict:
    await auth_service.reset_password(db, token=body.token, password=body.password)
    return {"ok": True}
