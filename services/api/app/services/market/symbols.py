from __future__ import annotations

POPULAR_STOCKS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "AMD"]
POPULAR_HK = ["00700", "09988", "03690", "01810", "09618"]
POPULAR_CN = ["600519.SH", "000001.SZ", "300750.SZ", "601318.SH"]
POPULAR_CRYPTO = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"]

INDEX_LONGBRIDGE: dict[str, str] = {
    "SPX": ".SPX.US",
    "IXIC": ".IXIC.US",
    "DJI": ".DJI.US",
    "HSI": "HSI.HK",
    "HSTECH": "HSTECH.HK",
    "HSCEI": "HSCEI.HK",
    "SSEC": "000001.SH",
    "SZI": "399001.SZ",
    "CHINEXT": "399006.SZ",
    "000001.SH": "000001.SH",
    "399001.SZ": "399001.SZ",
    "399006.SZ": "399006.SZ",
}

CN_INDEX_THSCODES = {"000001.SH", "399001.SZ", "399006.SZ"}

US_INDICES = [
    {"id": "SPX", "symbol": "SPX", "assetType": "stock", "nameKey": "indexSpx"},
    {"id": "IXIC", "symbol": "IXIC", "assetType": "stock", "nameKey": "indexIxic"},
    {"id": "DJI", "symbol": "DJI", "assetType": "stock", "nameKey": "indexDji"},
]
HK_INDICES = [
    {"id": "HSI", "symbol": "HSI", "assetType": "hk", "nameKey": "indexHsi"},
    {"id": "HSTECH", "symbol": "HSTECH", "assetType": "hk", "nameKey": "indexHstech"},
    {"id": "HSCEI", "symbol": "HSCEI", "assetType": "hk", "nameKey": "indexHscei"},
]
CN_INDICES = [
    {"id": "SSEC", "symbol": "000001.SH", "assetType": "cn", "nameKey": "indexSsec"},
    {"id": "SZI", "symbol": "399001.SZ", "assetType": "cn", "nameKey": "indexSzi"},
    {"id": "CHINEXT", "symbol": "399006.SZ", "assetType": "cn", "nameKey": "indexChinext"},
]


def is_cn_index_thscode(symbol: str) -> bool:
    return symbol.upper().strip() in CN_INDEX_THSCODES


def infer_cn_exchange(code: str) -> str:
    digits = "".join(c for c in code if c.isdigit())
    if digits.startswith(("6", "9")):
        return "SH"
    if digits.startswith(("4", "8")):
        return "BJ"
    return "SZ"


def normalize_cn_thscode(symbol: str) -> str:
    s = symbol.upper().strip()
    for prefix in ("SH.", "SZ.", "BJ."):
        if s.startswith(prefix):
            s = s[len(prefix) :]
            break
    import re

    m = re.match(r"^(\d{6})\.(SH|SZ|BJ)$", s)
    if m:
        return f"{m.group(1)}.{m.group(2)}"
    digits = "".join(c for c in s if c.isdigit())
    if len(digits) >= 6:
        code = digits[-6:]
        return f"{code}.{infer_cn_exchange(code)}"
    if digits:
        code = digits.zfill(6)
        return f"{code}.{infer_cn_exchange(code)}"
    return s


def _index_code(symbol: str) -> str:
    s = symbol.upper().strip()
    if s.startswith("."):
        s = s[1:]
    for suf in (".US", ".HK", ".SH", ".SZ", ".BJ"):
        if s.endswith(suf):
            s = s[: -len(suf)]
            break
    for pref in ("US.", "HK.", "SH.", "SZ.", "BJ."):
        if s.startswith(pref):
            s = s[len(pref) :]
            break
    return s


def normalize_symbol(symbol: str, asset_type: str) -> str:
    s = symbol.strip().upper()
    if asset_type == "crypto":
        s = s.replace("BINANCE:", "").replace("/", "").replace("-", "")
        if s.endswith("USDT") or s.endswith("USD"):
            return s
        if s in {"BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"}:
            return f"{s}USDT"
        return s
    if asset_type == "hk":
        raw = (
            s.replace("HK.", "")
            .replace(".HK", "")
        )
        digits = "".join(c for c in raw if c.isdigit())
        if not digits:
            return s
        return digits.zfill(5)
    if asset_type == "cn":
        return normalize_cn_thscode(s)
    return s.replace(".US", "").removeprefix("US.")


def to_longbridge_symbol(symbol: str, asset_type: str) -> str:
    """Mirror src/lib/market/symbols.ts toLongbridgeSymbol."""
    upper = symbol.upper().strip()
    if is_cn_index_thscode(upper):
        return upper
    code = _index_code(symbol)
    if code in INDEX_LONGBRIDGE:
        return INDEX_LONGBRIDGE[code]
    if upper in INDEX_LONGBRIDGE:
        return INDEX_LONGBRIDGE[upper]
    s = normalize_symbol(symbol, asset_type)
    if asset_type == "crypto":
        return f"{s}.US"
    if asset_type == "hk":
        bare = s.lstrip("0") or "0"
        return f"{bare}.HK"
    if asset_type == "cn":
        return normalize_cn_thscode(s)
    if s.endswith((".US", ".HK", ".SH", ".SZ", ".BJ")):
        return s
    return f"{s}.US"


def indices_for_market(asset_type: str) -> list[dict[str, str]]:
    if asset_type == "hk":
        return list(HK_INDICES)
    if asset_type == "stock":
        return list(US_INDICES)
    if asset_type == "cn":
        return list(CN_INDICES)
    return []
