from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    name: str | None = Field(default=None, min_length=1, max_length=64)
    locale: str | None = None
    inviteCode: str | None = Field(default=None, min_length=6, max_length=32)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class TokenResponse(BaseModel):
    accessToken: str
    # Also HttpOnly cookie; body copy is sessionStorage fallback if rewrite drops Set-Cookie.
    refreshToken: str
    tokenType: str = "bearer"
    expiresIn: int
    user: "UserPublic"


class UserPublic(BaseModel):
    id: str
    email: str
    name: str | None = None
    locale: str | None = None
    theme: str | None = None
    plan: str | None = None


class MeResponse(BaseModel):
    user: UserPublic


TokenResponse.model_rebuild()
