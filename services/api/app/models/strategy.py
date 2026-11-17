from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.enums import AssetType


class Strategy(Base):
    __tablename__ = "Strategy"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str | None] = mapped_column(
        String, ForeignKey("User.id", ondelete="CASCADE")
    )
    slug: Mapped[str | None] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False)
    isTemplate: Mapped[bool] = mapped_column(Boolean, default=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class StrategyReplay(Base):
    __tablename__ = "StrategyReplay"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    strategyId: Mapped[str] = mapped_column(
        String, ForeignKey("Strategy.id", ondelete="CASCADE")
    )
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    assetType: Mapped[str] = mapped_column(AssetType, nullable=False)
    rangeFrom: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    rangeTo: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    assumptions: Mapped[dict] = mapped_column(JSONB, nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending")
    result: Mapped[dict | None] = mapped_column(JSONB)
    error: Mapped[str | None] = mapped_column(Text)
    shareToken: Mapped[str | None] = mapped_column(String, unique=True)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
