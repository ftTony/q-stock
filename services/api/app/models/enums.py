"""Postgres enums created by Prisma — do not recreate (create_type=False)."""

from __future__ import annotations

from sqlalchemy import Enum as SAEnum


def pg_enum(*values: str, name: str) -> SAEnum:
    return SAEnum(
        *values,
        name=name,
        create_type=False,
        validate_strings=True,
    )


LocaleCode = pg_enum("zh_CN", "zh_TW", "en", name="LocaleCode")
ThemeMode = pg_enum("light", "dark", "system", name="ThemeMode")
ChangeColorScheme = pg_enum("cn", "us", name="ChangeColorScheme")
EquityMarketVendor = pg_enum("longbridge", "futu", name="EquityMarketVendor")
CryptoMarketVendor = pg_enum("binance", "okx", name="CryptoMarketVendor")
UserPlan = pg_enum("free", "pro", name="UserPlan")
AssetType = pg_enum("stock", "hk", "crypto", "cn", name="AssetType")
OrderSide = pg_enum("buy", "sell", name="OrderSide")
OrderType = pg_enum("market", "limit", "stop", name="OrderType")
OrderStatus = pg_enum("pending", "filled", "cancelled", "rejected", name="OrderStatus")
AccountType = pg_enum("cash", "margin", name="AccountType")
MarketCredentialProvider = pg_enum(
    "longbridge", "futu", "binance", "okx", "fuyao", name="MarketCredentialProvider"
)
ServiceCredentialProvider = pg_enum(
    "email", "ai", "feishu", "notify_webhook", name="ServiceCredentialProvider"
)
AlertCondition = pg_enum("gte", "lte", name="AlertCondition")
AlertStatus = pg_enum("active", "triggered", "disabled", name="AlertStatus")
AlertFrequency = pg_enum("once", "daily", "always", name="AlertFrequency")
FeatureSuggestionStatus = pg_enum("open", "reviewed", name="FeatureSuggestionStatus")
