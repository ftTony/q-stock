from __future__ import annotations

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, get_refresh_token, require_user
from app.core.db import get_db
from app.core.settings import get_settings
from app.models.user import User
from app.schemas.auth import LoginRequest, MeResponse, RegisterRequest, TokenResponse
from app.services import auth_service

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])


# Path must cover refresh via Next rewrite; keep scoped under /api/v1.
_REFRESH_COOKIE_PATH = "/api/v1"


def _set_refresh_cookie(response: Response, refresh: str, max_age: int) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=refresh,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,  # type: ignore[arg-type]
        max_age=max_age,
        path=_REFRESH_COOKIE_PATH,
    )


def _clear_refresh_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path=_REFRESH_COOKIE_PATH,
    )
    # Also clear legacy path from earlier builds
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path="/api/v1/auth",
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    user = await auth_service.register_user(
        db,
        email=body.email,
        password=body.password,
        name=body.name,
        locale=body.locale,
        invite_code=body.inviteCode,
    )
    access, refresh, access_ttl, refresh_ttl = await auth_service.issue_tokens(user)
    _set_refresh_cookie(response, refresh, refresh_ttl)
    return TokenResponse(
        accessToken=access,
        refreshToken=refresh,
        expiresIn=access_ttl,
        user=auth_service.user_public(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    user = await auth_service.authenticate(db, email=body.email, password=body.password)
    access, refresh, access_ttl, refresh_ttl = await auth_service.issue_tokens(user)
    _set_refresh_cookie(response, refresh, refresh_ttl)
    return TokenResponse(
        accessToken=access,
        refreshToken=refresh,
        expiresIn=access_ttl,
        user=auth_service.user_public(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Depends(get_refresh_token),
) -> TokenResponse:
    from app.core.errors import AppError

    if not refresh_token:
        raise AppError("Missing refresh token", code="INVALID_REFRESH", status_code=401)
    user, access, new_refresh, access_ttl, refresh_ttl = await auth_service.rotate_refresh(
        db, refresh_token
    )
    _set_refresh_cookie(response, new_refresh, refresh_ttl)
    return TokenResponse(
        accessToken=access,
        refreshToken=new_refresh,
        expiresIn=access_ttl,
        user=auth_service.user_public(user),
    )


@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str | None = Depends(get_refresh_token),
    user: User = Depends(require_user),
) -> dict:
    await auth_service.revoke_refresh(refresh_token)
    await auth_service.bump_token_version(user.id)
    _clear_refresh_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=MeResponse)
async def me(user: User = Depends(require_user)) -> MeResponse:
    return MeResponse(user=auth_service.user_public(user))
