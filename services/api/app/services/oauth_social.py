from __future__ import annotations

import hashlib
import secrets
from typing import Any
from urllib.parse import urlencode

import httpx

from app.core.errors import AppError
from app.core.redis_client import cache_get, cache_set
from app.core.settings import get_settings

GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN = "https://oauth2.googleapis.com/token"
GOOGLE_JWKS = "https://www.googleapis.com/oauth2/v3/certs"
GITHUB_AUTH = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN = "https://github.com/login/oauth/access_token"
GITHUB_USER = "https://api.github.com/user"
GITHUB_EMAILS = "https://api.github.com/user/emails"


def _pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    challenge = (
        hashlib.sha256(verifier.encode("ascii")).digest()
    )
    import base64

    challenge_b64 = base64.urlsafe_b64encode(challenge).decode("ascii").rstrip("=")
    return verifier, challenge_b64


async def store_oauth_state(*, provider: str, verifier: str, callback_url: str) -> str:
    state = secrets.token_urlsafe(24)
    await cache_set(
        f"oauth:state:{state}",
        f"{provider}|{verifier}|{callback_url}",
        600,
    )
    return state


async def pop_oauth_state(state: str) -> tuple[str, str, str]:
    raw = await cache_get(f"oauth:state:{state}")
    from app.core.redis_client import cache_delete

    await cache_delete(f"oauth:state:{state}")
    if not raw or "|" not in raw:
        raise AppError("Invalid OAuth state", code="OAUTH_STATE", status_code=400)
    provider, verifier, callback_url = raw.split("|", 2)
    return provider, verifier, callback_url


def google_configured() -> bool:
    s = get_settings()
    return bool(s.auth_google_id.strip() and s.auth_google_secret.strip())


def github_configured() -> bool:
    s = get_settings()
    return bool(s.auth_github_id.strip() and s.auth_github_secret.strip())


def onetap_configured() -> bool:
    return bool(get_settings().auth_google_id.strip())


async def build_authorize_url(provider: str, callback_url: str) -> str:
    settings = get_settings()
    verifier, challenge = _pkce_pair()
    state = await store_oauth_state(
        provider=provider, verifier=verifier, callback_url=callback_url
    )
    redirect_uri = f"{settings.oauth_callback_base}/{provider}/callback"

    if provider == "google":
        if not google_configured():
            raise AppError("Google OAuth not configured", code="OAUTH_OFF", status_code=503)
        q = urlencode(
            {
                "client_id": settings.auth_google_id,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "state": state,
                "code_challenge": challenge,
                "code_challenge_method": "S256",
                "access_type": "online",
                "prompt": "select_account",
            }
        )
        return f"{GOOGLE_AUTH}?{q}"

    if provider == "github":
        if not github_configured():
            raise AppError("GitHub OAuth not configured", code="OAUTH_OFF", status_code=503)
        q = urlencode(
            {
                "client_id": settings.auth_github_id,
                "redirect_uri": redirect_uri,
                "scope": "read:user user:email",
                "state": state,
            }
        )
        # GitHub does not require PKCE for confidential clients; still store verifier unused.
        return f"{GITHUB_AUTH}?{q}"

    raise AppError("Unknown provider", code="OAUTH_PROVIDER", status_code=400)


async def exchange_google_code(code: str, verifier: str) -> dict[str, Any]:
    settings = get_settings()
    redirect_uri = f"{settings.oauth_callback_base}/google/callback"
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(
            GOOGLE_TOKEN,
            data={
                "code": code,
                "client_id": settings.auth_google_id,
                "client_secret": settings.auth_google_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
                "code_verifier": verifier,
            },
        )
        res.raise_for_status()
        tokens = res.json()
        # id_token preferred
        id_token = tokens.get("id_token")
        if id_token:
            claims = await verify_google_id_token(id_token)
            return claims
        access = tokens.get("access_token")
        u = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access}"},
        )
        u.raise_for_status()
        info = u.json()
        email = (info.get("email") or "").lower()
        if not email:
            raise AppError("Google account has no email", code="OAUTH_EMAIL", status_code=400)
        return {
            "email": email,
            "name": info.get("name"),
            "emailVerified": bool(info.get("email_verified")),
        }


async def exchange_github_code(code: str) -> dict[str, Any]:
    settings = get_settings()
    redirect_uri = f"{settings.oauth_callback_base}/github/callback"
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.post(
            GITHUB_TOKEN,
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.auth_github_id,
                "client_secret": settings.auth_github_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
        )
        res.raise_for_status()
        tokens = res.json()
        access = tokens.get("access_token")
        if not access:
            raise AppError("GitHub token exchange failed", code="OAUTH_TOKEN", status_code=400)
        headers = {
            "Authorization": f"Bearer {access}",
            "Accept": "application/vnd.github+json",
        }
        u = await client.get(GITHUB_USER, headers=headers)
        u.raise_for_status()
        info = u.json()
        email = (info.get("email") or "").lower()
        if not email:
            em = await client.get(GITHUB_EMAILS, headers=headers)
            em.raise_for_status()
            for row in em.json():
                if row.get("primary") and row.get("email"):
                    email = str(row["email"]).lower()
                    break
        if not email:
            raise AppError("GitHub account has no email", code="OAUTH_EMAIL", status_code=400)
        return {
            "email": email,
            "name": info.get("name") or info.get("login"),
            "emailVerified": True,
        }


async def verify_google_id_token(credential: str) -> dict[str, Any]:
    """Verify Google One Tap / OIDC id_token (JWKS)."""
    from jose import jwt
    from jose.exceptions import JWTError

    settings = get_settings()
    client_id = settings.auth_google_id.strip()
    if not client_id:
        raise AppError("Google not configured", code="OAUTH_OFF", status_code=503)

    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            jwks = (await client.get(GOOGLE_JWKS)).json()
        except Exception as exc:  # noqa: BLE001
            raise AppError("Cannot fetch Google JWKS", code="OAUTH_JWKS", status_code=502) from exc

    try:
        claims = jwt.decode(
            credential,
            jwks,
            algorithms=["RS256"],
            audience=client_id,
            issuer=["https://accounts.google.com", "accounts.google.com"],
            options={"verify_at_hash": False},
        )
    except JWTError as exc:
        raise AppError("Invalid Google ID token", code="OAUTH_TOKEN", status_code=401) from exc

    email = (claims.get("email") or "").lower()
    if not email:
        raise AppError("Google token missing email", code="OAUTH_EMAIL", status_code=400)
    return {
        "email": email,
        "name": claims.get("name"),
        "emailVerified": bool(claims.get("email_verified")),
    }
