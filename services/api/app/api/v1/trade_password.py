"""Trade-password endpoints: status / set / disable / forgot-PIN reset.

Mirrors the Next.js contract the frontend was built against:
- GET    /trading/trade-password            → {enabled}
- POST   /trading/trade-password            → set / replace (currentPin required when replacing)
- DELETE /trading/trade-password            → disable (requires current pin)
- POST   /trading/trade-password/reset      → forgot-PIN reset via login password
- POST   /trading/trade-password/verify-login → forgot-PIN step 1 (verify login password)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.deps import enforce_rate_limit, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.models.user import User
from app.services import trade_password as tp
from app.services.trade_password import TRADE_PIN_LENGTH

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])


class SetPinBody(BaseModel):
    pin: str = Field(pattern=rf"^\d{{{TRADE_PIN_LENGTH}}}$")
    # Required when replacing an existing trade password.
    currentPin: str | None = None


class DisablePinBody(BaseModel):
    pin: str = Field(pattern=rf"^\d{{{TRADE_PIN_LENGTH}}}$")


class ResetPinBody(BaseModel):
    # Login password — proves identity when the trade PIN is forgotten.
    loginPassword: str = Field(min_length=1)
    pin: str = Field(pattern=rf"^\d{{{TRADE_PIN_LENGTH}}}$")


class VerifyLoginBody(BaseModel):
    loginPassword: str = Field(min_length=1)


@router.get("/trade-password")
async def get_trade_password(
    db=Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    return {"enabled": await tp.has_trade_password(db, user.id)}


@router.post("/trade-password")
async def set_trade_password(
    body: SetPinBody,
    db=Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if not tp.is_valid_trade_pin(body.pin):
        raise AppError("Invalid pin", code="VALIDATION_ERROR", status_code=400)
    await tp.set_trade_password(db, user.id, body.pin, body.currentPin)
    return {"enabled": True}


@router.delete("/trade-password")
async def disable_trade_password(
    body: DisablePinBody,
    db=Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    enabled = await tp.disable_trade_password(db, user.id, body.pin)
    return {"enabled": enabled}


@router.post("/trade-password/reset")
async def reset_trade_password(
    body: ResetPinBody,
    db=Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if not tp.is_valid_trade_pin(body.pin):
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    await tp.reset_trade_password(db, user.id, body.loginPassword, body.pin)
    return {"enabled": True}


@router.post("/trade-password/verify-login")
async def verify_login_password(
    body: VerifyLoginBody,
    db=Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    await tp.verify_login_password(db, user.id, body.loginPassword)
    return {"ok": True}
