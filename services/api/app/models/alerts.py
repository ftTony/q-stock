from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.enums import AlertCondition, AlertFrequency, AlertStatus, AssetType


class PriceAlert(Base):
    __tablename__ = "PriceAlert"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    assetType: Mapped[str] = mapped_column(AssetType, nullable=False)
    condition: Mapped[str] = mapped_column(AlertCondition, nullable=False)
    triggerPrice: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    frequency: Mapped[str] = mapped_column(AlertFrequency, default="always")
    status: Mapped[str] = mapped_column(AlertStatus, default="active")
    triggeredAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class AlertDeliveryLog(Base):
    __tablename__ = "AlertDeliveryLog"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    alertId: Mapped[str] = mapped_column(
        String, ForeignKey("PriceAlert.id", ondelete="CASCADE")
    )
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    email: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class WatchlistDigestLog(Base):
    __tablename__ = "WatchlistDigestLog"
    __table_args__ = (
        UniqueConstraint("userId", "tradeDate", name="WatchlistDigestLog_userId_tradeDate_key"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    tradeDate: Mapped[str] = mapped_column(String, nullable=False)
    itemCount: Mapped[int] = mapped_column(Integer, default=0)
    sentAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class WatchlistClosePushLog(Base):
    __tablename__ = "WatchlistClosePushLog"
    __table_args__ = (
        UniqueConstraint(
            "userId", "tradeDate", name="WatchlistClosePushLog_userId_tradeDate_key"
        ),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    tradeDate: Mapped[str] = mapped_column(String, nullable=False)
    itemCount: Mapped[int] = mapped_column(Integer, default=0)
    sentAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
