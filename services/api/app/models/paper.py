from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Float,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.enums import AssetType, OrderSide, OrderStatus, OrderType


class PaperAccount(Base):
    __tablename__ = "PaperAccount"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(
        String, ForeignKey("User.id", ondelete="CASCADE"), unique=True
    )
    cashBalance: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    currency: Mapped[str] = mapped_column(String, default="USD")
    dayStartEquity: Mapped[Decimal | None] = mapped_column(Numeric(18, 4))
    dayStartDate: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PaperRiskSettings(Base):
    __tablename__ = "PaperRiskSettings"

    userId: Mapped[str] = mapped_column(
        String, ForeignKey("User.id", ondelete="CASCADE"), primary_key=True
    )
    maxPositionPctPerSymbol: Mapped[float] = mapped_column(Float, default=20)
    maxGrossExposurePct: Mapped[float] = mapped_column(Float, default=80)
    maxDailyLossPct: Mapped[float] = mapped_column(Float, default=5)
    maxOrderNotionalPct: Mapped[float | None] = mapped_column(Float)
    softOnly: Mapped[bool] = mapped_column(Boolean, default=True)
    requireEmotionCheck: Mapped[bool] = mapped_column(Boolean, default=False)
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PaperPosition(Base):
    __tablename__ = "PaperPosition"
    __table_args__ = (
        UniqueConstraint(
            "userId", "symbol", "assetType", name="PaperPosition_userId_symbol_assetType_key"
        ),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    assetType: Mapped[str] = mapped_column(AssetType, nullable=False)
    qty: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    avgCost: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PaperOrder(Base):
    __tablename__ = "PaperOrder"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    assetType: Mapped[str] = mapped_column(AssetType, nullable=False)
    side: Mapped[str] = mapped_column(OrderSide, nullable=False)
    type: Mapped[str] = mapped_column(OrderType, nullable=False)
    qty: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    limitPrice: Mapped[Decimal | None] = mapped_column(Numeric(18, 8))
    stopPrice: Mapped[Decimal | None] = mapped_column(Numeric(18, 8))
    status: Mapped[str] = mapped_column(OrderStatus, default="pending")
    filledPrice: Mapped[Decimal | None] = mapped_column(Numeric(18, 8))
    filledAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    rejectReason: Mapped[str | None] = mapped_column(String)
    emotionTags: Mapped[list[str] | None] = mapped_column(ARRAY(Text), default=list)
    invalidationNote: Mapped[str | None] = mapped_column(String)
    strategyId: Mapped[str | None] = mapped_column(
        String, ForeignKey("Strategy.id", ondelete="SET NULL")
    )
    riskSnapshot: Mapped[dict | None] = mapped_column(JSONB)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
