/** Map API / TradingError codes to trading.* i18n keys. */
const CODE_KEYS: Record<string, string> = {
  RISK_EMOTION: "errRiskEmotion",
  RISK_DAILY_LOSS: "errRiskDailyLoss",
  RISK_SYMBOL_CAP: "errRiskSymbolCap",
  RISK_EXPOSURE: "errRiskExposure",
  RISK_ORDER_SIZE: "errRiskOrderSize",
  INSUFFICIENT_CASH: "errInsufficientCash",
  INSUFFICIENT_POSITION: "errInsufficientPosition",
  NO_QUOTE: "errNoQuote",
  INVALID_QTY: "errInvalidQty",
  INVALID_LIMIT: "errInvalidLimit",
  INVALID_STOP: "errInvalidStop",
  NOT_FOUND: "errNotFound",
  NOT_PENDING: "errNotPending",
};

export function tradingErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const code = (err as { code?: unknown }).code;
  return typeof code === "string" && code ? code : undefined;
}

export function tradingErrorMessage(
  err: unknown,
  t: (key: string) => string,
): string {
  const code = tradingErrorCode(err);
  if (code && CODE_KEYS[code]) {
    return t(CODE_KEYS[code]!);
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return t("orderFailed");
}
