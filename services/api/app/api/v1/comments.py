"""Symbol comments CRUD."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import enforce_rate_limit, get_optional_user, require_user
from app.core.db import get_db
from app.core.errors import AppError
from app.core.ids import new_id
from app.models.social import Comment
from app.models.user import User
from app.services.market.symbols import normalize_symbol

router = APIRouter(dependencies=[Depends(enforce_rate_limit)])


class CreateComment(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    assetType: str
    content: str = Field(min_length=1, max_length=2000)


@router.get("/comments")
async def list_comments(
    symbol: str = Query(...),
    assetType: str | None = None,
    db: AsyncSession = Depends(get_db),
    _user: User | None = Depends(get_optional_user),
) -> dict:
    asset = assetType if assetType in {"stock", "hk", "crypto", "cn"} else "stock"
    sym = normalize_symbol(symbol, asset)
    res = await db.execute(
        select(Comment, User.name, User.email)
        .join(User, User.id == Comment.userId)
        .where(
            Comment.symbol == sym,
            Comment.assetType == asset,
            Comment.deletedAt.is_(None),
        )
        .order_by(desc(Comment.createdAt))
        .limit(50)
    )
    comments = []
    for c, name, email in res.all():
        author = name or (email.split("@")[0] if email else "user")
        comments.append(
            {
                "id": c.id,
                "content": c.content,
                "createdAt": c.createdAt,
                "userId": c.userId,
                "author": author,
            }
        )
    return {"comments": comments}


@router.post("/comments", status_code=201)
async def create_comment(
    body: CreateComment,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    if body.assetType not in {"stock", "hk", "crypto", "cn"}:
        raise AppError("Invalid input", code="VALIDATION_ERROR", status_code=400)
    sym = normalize_symbol(body.symbol, body.assetType)
    now = datetime.now(timezone.utc)
    comment = Comment(
        id=new_id(),
        userId=user.id,
        symbol=sym,
        assetType=body.assetType,
        content=body.content.strip(),
        createdAt=now,
        updatedAt=now,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return {
        "comment": {
            "id": comment.id,
            "userId": comment.userId,
            "symbol": comment.symbol,
            "assetType": comment.assetType,
            "content": comment.content,
            "createdAt": comment.createdAt,
            "updatedAt": comment.updatedAt,
        }
    }


@router.delete("/comments")
async def delete_comment(
    id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_user),
) -> dict:
    res = await db.execute(select(Comment).where(Comment.id == id))
    existing = res.scalar_one_or_none()
    if not existing or existing.userId != user.id:
        raise AppError("Not found", code="NOT_FOUND", status_code=404)
    existing.deletedAt = datetime.now(timezone.utc)
    await db.commit()
    return {"ok": True}
