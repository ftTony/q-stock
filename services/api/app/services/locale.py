def to_db_locale(locale: str | None) -> str:
    if not locale:
        return "en"
    normalized = locale.replace("-", "_")
    if normalized in {"zh_CN", "zh_TW", "en"}:
        return normalized
    if locale.startswith("zh"):
        return "zh_CN" if "TW" not in locale.upper() and "HK" not in locale.upper() else "zh_TW"
    return "en"


def from_db_locale(locale: str | None) -> str:
    if locale == "zh_CN":
        return "zh-CN"
    if locale == "zh_TW":
        return "zh-TW"
    return "en"
