from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models.enums import FeatureSuggestionStatus


class FeatureSuggestion(Base):
    __tablename__ = "FeatureSuggestion"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    userId: Mapped[str | None] = mapped_column(
        String, ForeignKey("User.id", ondelete="SET NULL"), nullable=True
    )
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    imageData: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(FeatureSuggestionStatus, default="open")
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
