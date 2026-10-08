import { formatNumber } from "@/lib/format-number";

export function fmtMoney(n: number): string {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
