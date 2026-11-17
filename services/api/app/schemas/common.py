from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

AssetType = Literal["stock", "hk", "crypto", "cn"]


class OkResponse(BaseModel):
    ok: bool = True


class SymbolRef(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    assetType: AssetType
