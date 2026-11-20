from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_PROXY_KEYS = (
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "http_proxy",
    "https_proxy",
    "all_proxy",
)


def _repo_root() -> Path:
    # services/api/app/core/settings.py → q-stock/
    return Path(__file__).resolve().parents[4]


def env_file_paths() -> tuple[str, ...]:
    """Prefer monorepo root `.env` / `.env.local` (Next + API share keys)."""
    root = _repo_root()
    files: list[str] = []
    for name in (".env", ".env.local"):
        path = root / name
        if path.is_file():
            files.append(str(path))
    cwd_env = Path.cwd() / ".env"
    if cwd_env.is_file() and str(cwd_env.resolve()) not in {
        str(Path(p).resolve()) for p in files
    }:
        files.append(str(cwd_env))
    return tuple(files)


def load_repo_env() -> None:
    """Populate os.environ for modules that read env directly (Longbridge, Adanos).

    Strips HTTP(S)_PROXY from `.env.local` — that proxy is for browser/Node OAuth,
    and breaks FastAPI → Finnhub / Longbridge / Adanos outbound calls.
    """
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    for path in env_file_paths():
        load_dotenv(path, override=False)
    for key in _PROXY_KEYS:
        os.environ.pop(key, None)


load_repo_env()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_file_paths() or (".env",),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "q-stock-api"
    api_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://qstock:qstock@localhost:5432/qstock"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = ""
    auth_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    refresh_token_days: int = 14
    cors_origins: str = "http://localhost:3000"
    credentials_encryption_key: str = ""
    finnhub_api_key: str = ""
    binance_api_url: str = "https://data-api.binance.vision"
    market_data_providers: str = "finnhub,binance"
    cache_memory_max: int = 250
    rate_limit_per_minute: int = 120
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    refresh_cookie_name: str = "qstock_refresh"
    # PEM RSA private key for login/register passwordCipher (OAEP-SHA256).
    # Multiline: use literal newlines or \n escapes. Empty → ephemeral dev key.
    auth_password_rsa_private_key: str = ""
    app_url: str = "http://localhost:3000"
    auth_google_id: str = ""
    auth_google_secret: str = ""
    auth_github_id: str = ""
    auth_github_secret: str = ""
    # Public OAuth redirect (usually same-origin via Next rewrite)
    oauth_redirect_base: str = ""

    @property
    def oauth_callback_base(self) -> str:
        base = (self.oauth_redirect_base or self.app_url).rstrip("/")
        return f"{base}/api/v1/auth/oauth"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def signing_secret(self) -> str:
        return (self.jwt_secret or self.auth_secret or "dev-change-me").strip()

    @property
    def sqlalchemy_url(self) -> str:
        url = self.database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        # Prisma-style query params are not valid for asyncpg
        if "?" in url:
            base, _, qs = url.partition("?")
            parts = [
                p
                for p in qs.split("&")
                if not p.startswith("schema=") and p
            ]
            url = base if not parts else f"{base}?{'&'.join(parts)}"
        return url


@lru_cache
def get_settings() -> Settings:
    load_repo_env()
    return Settings()
