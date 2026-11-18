"""User market + service BYOK credential endpoints."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field, field_validator, model_validator
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, get_optional_user, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.core.ids import new_id
from app.core.secret_box import encrypt_json
from app.models.user import User, UserMarketCredential, UserServiceCredential
from app.services import market_creds as market_svc
from app.services import service_creds as service_svc

log = logging.getLogger(__name__)

router = APIRouter(prefix="/user", dependencies=[Depends(enforce_rate_limit)])

MARKET_PROVIDERS = frozenset({"longbridge", "futu", "binance", "okx", "fuyao"})
SERVICE_PROVIDERS = frozenset({"email", "ai", "feishu", "notify_webhook"})


class LongbridgeBody(BaseModel):
    appKey: str = Field(min_length=1, max_length=512)
    appSecret: str = Field(min_length=1, max_length=512)
    accessToken: str = Field(min_length=1, max_length=16_384)


class FutuBearerBody(BaseModel):
    mode: Literal["bearer"]
    accessToken: str = Field(min_length=1, max_length=16_384)


class FutuAppKeyBody(BaseModel):
    mode: Literal["appkey"]
    appKey: str = Field(min_length=1, max_length=512)
    privateKey: str = Field(min_length=1, max_length=65_536)
    signAlg: Literal["ed25519", "rsa-sha256", "rsa"] | None = None


class BinanceBody(BaseModel):
    apiKey: str = Field(min_length=1, max_length=256)
    apiSecret: str | None = Field(default=None, max_length=256)


class OkxBody(BaseModel):
    apiKey: str = Field(min_length=1, max_length=256)
    apiSecret: str | None = Field(default=None, max_length=256)
    passphrase: str | None = Field(default=None, max_length=256)


class FuyaoBody(BaseModel):
    apiKey: str = Field(min_length=1, max_length=512)


class MarketPutBody(BaseModel):
    longbridge: LongbridgeBody | None = None
    futu: FutuBearerBody | FutuAppKeyBody | None = None
    binance: BinanceBody | None = None
    okx: OkxBody | None = None
    fuyao: FuyaoBody | None = None
    equityVendor: Literal["longbridge", "futu"] | None = None
    cryptoVendor: Literal["binance", "okx"] | None = None

    @model_validator(mode="after")
    def _at_least_one(self) -> MarketPutBody:
        if not any(
            [
                self.longbridge,
                self.futu,
                self.binance,
                self.okx,
                self.fuyao,
                self.equityVendor,
                self.cryptoVendor,
            ]
        ):
            raise ValueError("Provide credentials and/or vendor preference")
        return self


class EmailPutBody(BaseModel):
    channel: Literal["resend", "smtp"]
    from_: str = Field(alias="from", max_length=320)
    resendApiKey: str | None = Field(default=None, max_length=512)
    smtpHost: str | None = Field(default=None, max_length=256)
    smtpPort: int | None = Field(default=None, ge=1, le=65535)
    smtpUser: str | None = Field(default=None, max_length=320)
    smtpPass: str | None = Field(default=None, max_length=512)
    smtpSecure: bool | None = None

    model_config = {"populate_by_name": True}

    @field_validator("from_")
    @classmethod
    def _email_like(cls, v: str) -> str:
        if "@" not in v or len(v) < 3:
            raise ValueError("Invalid email")
        return v


class AiPutBody(BaseModel):
    vendor: Literal["deepseek", "openai", "openai_compat", "gemini", "anthropic"]
    apiKey: str | None = Field(default=None, max_length=512)
    model: str = Field(min_length=1, max_length=128)
    baseUrl: str | None = Field(default=None, max_length=512)


class FeishuPutBody(BaseModel):
    webhookUrl: str | None = Field(default=None, max_length=2048)


class NotifyWebhookPutBody(BaseModel):
    webhookUrl: str | None = Field(default=None, max_length=2048)
    platform: Literal["slack", "discord", "telegram", "generic"]


class ServicePutBody(BaseModel):
    email: EmailPutBody | None = None
    ai: AiPutBody | None = None
    feishu: FeishuPutBody | None = None
    notifyWebhook: NotifyWebhookPutBody | None = None

    @model_validator(mode="after")
    def _at_least_one(self) -> ServicePutBody:
        if not any([self.email, self.ai, self.feishu, self.notifyWebhook]):
            raise ValueError(
                "Provide email, ai, feishu, and/or notifyWebhook credentials"
            )
        return self


def _enc_error(exc: Exception) -> AppError:
    msg = str(exc) or "Save failed"
    if "CREDENTIALS_ENCRYPTION_KEY" in msg:
        return AppError(
            "Server missing CREDENTIALS_ENCRYPTION_KEY — add it to .env and restart",
            code="ENCRYPTION_KEY_MISSING",
            status_code=503,
        )
    return AppError(msg, code="SAVE_FAILED", status_code=500)


async def _upsert_market(
    db: AsyncSession, user_id: str, provider: str, payload: str
) -> None:
    res = await db.execute(
        select(UserMarketCredential).where(
            UserMarketCredential.userId == user_id,
            UserMarketCredential.provider == provider,
        )
    )
    row = res.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if row:
        row.payload = payload
        row.updatedAt = now
    else:
        db.add(
            UserMarketCredential(
                id=new_id(),
                userId=user_id,
                provider=provider,
                payload=payload,
                createdAt=now,
                updatedAt=now,
            )
        )


async def _upsert_service(
    db: AsyncSession, user_id: str, provider: str, payload: str
) -> None:
    res = await db.execute(
        select(UserServiceCredential).where(
            UserServiceCredential.userId == user_id,
            UserServiceCredential.provider == provider,
        )
    )
    row = res.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if row:
        row.payload = payload
        row.updatedAt = now
    else:
        db.add(
            UserServiceCredential(
                id=new_id(),
                userId=user_id,
                provider=provider,
                payload=payload,
                createdAt=now,
                updatedAt=now,
            )
        )


@router.get("/market-credentials")
async def get_market_credentials(
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    """Anonymous: env/platform vendor status only. Authed: merge user BYOK."""
    if user is None:
        return market_svc.get_anon_market_creds_status()
    return await market_svc.get_user_market_creds_status(db, user.id)


@router.put("/market-credentials")
async def put_market_credentials(
    body: MarketPutBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    try:
        if body.equityVendor or body.cryptoVendor:
            if body.equityVendor:
                user.equityVendor = body.equityVendor
            if body.cryptoVendor:
                user.cryptoVendor = body.cryptoVendor

        if body.longbridge:
            await _upsert_market(
                db, user.id, "longbridge", encrypt_json(body.longbridge.model_dump())
            )
        if body.futu:
            await _upsert_market(
                db, user.id, "futu", encrypt_json(body.futu.model_dump(exclude_none=True))
            )
        if body.binance:
            await _upsert_market(
                db,
                user.id,
                "binance",
                encrypt_json(
                    {
                        "apiKey": body.binance.apiKey,
                        "apiSecret": (body.binance.apiSecret or "").strip() or None,
                    }
                ),
            )
        if body.okx:
            await _upsert_market(
                db,
                user.id,
                "okx",
                encrypt_json(
                    {
                        "apiKey": body.okx.apiKey,
                        "apiSecret": (body.okx.apiSecret or "").strip() or None,
                        "passphrase": (body.okx.passphrase or "").strip() or None,
                    }
                ),
            )
        if body.fuyao:
            await _upsert_market(
                db, user.id, "fuyao", encrypt_json({"apiKey": body.fuyao.apiKey})
            )
        await db.commit()
    except AppError:
        raise
    except Exception as exc:
        log.error("market-credentials save failed: %s", exc)
        await db.rollback()
        raise _enc_error(exc) from exc

    market_svc.invalidate_user_market_creds_cache(user.id)
    return await market_svc.get_user_market_creds_status(db, user.id)


@router.delete("/market-credentials")
async def delete_market_credentials(
    provider: str = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if provider not in MARKET_PROVIDERS:
        raise AppError(
            "provider must be longbridge, futu, binance, okx, or fuyao",
            code="VALIDATION_ERROR",
            status_code=400,
        )
    await db.execute(
        delete(UserMarketCredential).where(
            UserMarketCredential.userId == user.id,
            UserMarketCredential.provider == provider,
        )
    )
    await db.commit()
    market_svc.invalidate_user_market_creds_cache(user.id)
    return await market_svc.get_user_market_creds_status(db, user.id)


@router.get("/service-credentials")
async def get_service_credentials(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    return await service_svc.get_user_service_creds_status(db, user.id)


@router.put("/service-credentials")
async def put_service_credentials(
    body: ServicePutBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    try:
        existing = await service_svc.load_user_service_creds(db, user.id)

        if body.email:
            merged = service_svc.merge_email_creds(
                body.email.model_dump(by_alias=True), existing.get("email")
            )
            if not merged:
                raise AppError(
                    "Email credentials incomplete — provide API key / SMTP host (or keep existing)",
                    code="VALIDATION_ERROR",
                    status_code=400,
                )
            await _upsert_service(db, user.id, "email", encrypt_json(merged))

        if body.ai:
            merged = service_svc.merge_ai_creds(
                body.ai.model_dump(), existing.get("ai")
            )
            if not merged:
                raise AppError(
                    "AI credentials incomplete — provide API key and model (compat needs Base URL)",
                    code="VALIDATION_ERROR",
                    status_code=400,
                )
            await _upsert_service(db, user.id, "ai", encrypt_json(merged))

        if body.feishu:
            merged = service_svc.merge_notify_webhook_creds(
                body.feishu.model_dump(exclude_none=True),
                existing.get("feishu"),
            )
            if not merged:
                raise AppError(
                    "Feishu webhook incomplete — provide an https:// incoming webhook URL",
                    code="VALIDATION_ERROR",
                    status_code=400,
                )
            await _upsert_service(db, user.id, "feishu", encrypt_json(merged))

        if body.notifyWebhook:
            merged = service_svc.merge_notify_webhook_creds(
                body.notifyWebhook.model_dump(exclude_none=True),
                existing.get("notifyWebhook"),
                require_platform=True,
            )
            if not merged:
                raise AppError(
                    "Notify webhook incomplete — provide platform + https:// webhook URL",
                    code="VALIDATION_ERROR",
                    status_code=400,
                )
            await _upsert_service(
                db, user.id, "notify_webhook", encrypt_json(merged)
            )

        await db.commit()
    except AppError:
        raise
    except Exception as exc:
        log.error("service-credentials save failed: %s", exc)
        await db.rollback()
        raise _enc_error(exc) from exc

    service_svc.invalidate_user_service_creds_cache(user.id)
    return await service_svc.get_user_service_creds_status(db, user.id)


@router.delete("/service-credentials")
async def delete_service_credentials(
    provider: str = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if provider not in SERVICE_PROVIDERS:
        raise AppError(
            "provider must be email, ai, feishu, or notify_webhook",
            code="VALIDATION_ERROR",
            status_code=400,
        )
    await db.execute(
        delete(UserServiceCredential).where(
            UserServiceCredential.userId == user.id,
            UserServiceCredential.provider == provider,
        )
    )
    await db.commit()
    service_svc.invalidate_user_service_creds_cache(user.id)
    return await service_svc.get_user_service_creds_status(db, user.id)
