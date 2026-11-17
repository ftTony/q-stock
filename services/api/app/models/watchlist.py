from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.enums import AssetType


class WatchlistItem(Base):
    __tablename__ = "WatchlistItem"
    __table_args__ = (
        UniqueConstraint("userId", "symbol", "assetType", name="WatchlistItem_userId_symbol_assetType_key"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    symbol: Mapped[str] = mapped_column(String, nullable=False)
    assetType: Mapped[str] = mapped_column(AssetType, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class WatchlistGroup(Base):
    __tablename__ = "WatchlistGroup"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    sortOrder: Mapped[int] = mapped_column(Integer, default=0)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class WatchlistGroupMember(Base):
    __tablename__ = "WatchlistGroupMember"
    __table_args__ = (
        UniqueConstraint("groupId", "itemId", name="WatchlistGroupMember_groupId_itemId_key"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    groupId: Mapped[str] = mapped_column(
        String, ForeignKey("WatchlistGroup.id", ondelete="CASCADE")
    )
    itemId: Mapped[str] = mapped_column(
        String, ForeignKey("WatchlistItem.id", ondelete="CASCADE")
    )
