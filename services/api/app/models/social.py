"""Comments + research cards (Prisma parity)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.enums import AssetType, UserPlan


class Comment(Base):
    __tablename__ = "Comment"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    assetType: Mapped[str] = mapped_column(AssetType, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    deletedAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ResearchCard(Base):
    __tablename__ = "ResearchCard"
    __table_args__ = (
        UniqueConstraint(
            "userId", "symbol", "assetType", name="ResearchCard_userId_symbol_assetType_key"
        ),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    assetType: Mapped[str] = mapped_column(AssetType, nullable=False)
    whyWatch: Mapped[str] = mapped_column(Text, default="")
    question: Mapped[str] = mapped_column(Text, default="")
    watchConditions: Mapped[str] = mapped_column(Text, default="")
    risks: Mapped[str] = mapped_column(Text, default="")
    reviewAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class RedeemCode(Base):
    __tablename__ = "RedeemCode"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(UserPlan, default="pro")
    days: Mapped[int] = mapped_column(default=30)
    maxRedemptions: Mapped[int] = mapped_column(default=1)
    redemptionCount: Mapped[int] = mapped_column(default=0)
    expiresAt: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    note: Mapped[str | None] = mapped_column(String)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class RedeemRedemption(Base):
    __tablename__ = "RedeemRedemption"
    __table_args__ = (
        UniqueConstraint("codeId", "userId", name="RedeemRedemption_codeId_userId_key"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    codeId: Mapped[str] = mapped_column(
        String, ForeignKey("RedeemCode.id", ondelete="CASCADE")
    )
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class EntitlementGrant(Base):
    __tablename__ = "EntitlementGrant"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    plan: Mapped[str] = mapped_column(UserPlan, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)
    days: Mapped[int | None] = mapped_column()
    note: Mapped[str | None] = mapped_column(String)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
