from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models.enums import (
    ChangeColorScheme,
    CryptoMarketVendor,
    EquityMarketVendor,
    LocaleCode,
    MarketCredentialProvider,
    ServiceCredentialProvider,
    ThemeMode,
    UserPlan,
)


class User(Base):
    __tablename__ = "User"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    passwordHash: Mapped[str | None] = mapped_column(String, nullable=True)
    # Bcrypt hash of the 6-digit trade PIN; null means no trade password set.
    tradePasswordHash: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    locale: Mapped[str] = mapped_column(LocaleCode, default="zh_CN")
    theme: Mapped[str] = mapped_column(ThemeMode, default="system")
    changeColorScheme: Mapped[str] = mapped_column(ChangeColorScheme, default="cn")
    equityVendor: Mapped[str] = mapped_column(EquityMarketVendor, default="longbridge")
    cryptoVendor: Mapped[str] = mapped_column(CryptoMarketVendor, default="binance")
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=func.now(),
        onupdate=func.now(),
    )
    aiUsageCount: Mapped[int] = mapped_column(Integer, default=0)
    aiUsageLimit: Mapped[int] = mapped_column(Integer, default=5)
    plan: Mapped[str] = mapped_column(UserPlan, default="free")
    planExpiresAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    stripeCustomerId: Mapped[str | None] = mapped_column(String, unique=True)
    stripeSubscriptionId: Mapped[str | None] = mapped_column(String, unique=True)
    aiUsagePeriod: Mapped[str | None] = mapped_column(String)
    aiPeriodUsageCount: Mapped[int] = mapped_column(Integer, default=0)

    market_credentials: Mapped[list[UserMarketCredential]] = relationship(
        back_populates="user"
    )


class InviteCode(Base):
    __tablename__ = "InviteCode"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    ownerId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    usedById: Mapped[str | None] = mapped_column(
        String, ForeignKey("User.id", ondelete="SET NULL"), unique=True
    )
    usedAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class UserMarketCredential(Base):
    __tablename__ = "UserMarketCredential"
    __table_args__ = (
        UniqueConstraint("userId", "provider", name="UserMarketCredential_userId_provider_key"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(MarketCredentialProvider, nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped[User] = relationship(back_populates="market_credentials")


class UserServiceCredential(Base):
    __tablename__ = "UserServiceCredential"
    __table_args__ = (
        UniqueConstraint(
            "userId", "provider", name="UserServiceCredential_userId_provider_key"
        ),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(ServiceCredentialProvider, nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
