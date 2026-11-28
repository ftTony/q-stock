import type { AccountType } from "@prisma/client";
import { MARGIN_LEVERAGE } from "@/lib/trading/account";

/** Shared buying-power math for cash vs margin paper accounts.
 * Cash book: buying power = cash. Margin book: total exposure may reach
 * 2x equity, so remaining buying power = 2x equity - current gross exposure. */
export function accountMetrics(params: {
  accountType: AccountType;
  cash: number;
  gross: number;
  borrowed: number;
  interest: number;
}) {
  const { accountType, cash, gross, borrowed, interest } = params;
  const equity = cash + gross - borrowed - interest;
  const leverage = accountType === "margin" ? MARGIN_LEVERAGE : 1;
  const maxExposure = equity * leverage;
  // Cash cannot go negative: buying power is capped by cash on cash book.
  const buyingPower =
    accountType === "margin"
      ? Math.max(0, maxExposure - gross)
      : Math.max(0, cash);
  return { equity, leverage, maxExposure, buyingPower };
}
