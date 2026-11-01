"use client";

import { QtSelect } from "@/components/ui/qt-select";
import { formatNumber } from "@/lib/format-number";
import type { PricedLeg, StrategyLeg } from "../option-strategy-utils";
import { FIELD_CLS, QT_TRIGGER } from "./drawer-ui";

/**
 * Editable legs table: side / type / strike / qty / traded premium.
 * Row separators are intentionally omitted — the header hairline is the only
 * line, matching the drawer's low-chrome styling.
 */
export function StrategyLegsTable({
  legs,
  strikes,
  farStrikes,
  needsFar,
  farExpiry,
  onChange,
  t,
}: {
  legs: PricedLeg[];
  strikes: number[];
  farStrikes: number[];
  needsFar: boolean;
  farExpiry: string;
  onChange: (i: number, patch: Partial<StrategyLeg>) => void;
  t: (k: string) => string;
}) {
  const pick = (
    value: string,
    onPick: (v: string) => void,
    options: { value: string; label: string }[],
    aria: string,
  ) => (
    <QtSelect
      value={value}
      onChange={onPick}
      options={options}
      triggerClassName={QT_TRIGGER}
      aria-label={aria}
    />
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse whitespace-nowrap text-[12px]">
        <thead>
          <tr className="border-b border-[var(--aw-hairline,var(--border))] text-[var(--muted)]">
            <th className="px-1.5 py-1.5 text-left font-medium">
              {t("colAction")}
            </th>
            <th className="px-1.5 py-1.5 text-left font-medium">
              {t("colType")}
            </th>
            <th className="px-1.5 py-1.5 text-left font-medium">
              {t("colStrike")}
            </th>
            <th className="px-1.5 py-1.5 text-left font-medium">
              {t("colQty")}
            </th>
            <th className="px-1.5 py-1.5 text-right font-medium">
              {t("colPremium")}
            </th>
          </tr>
        </thead>
        <tbody>
          {legs.map((leg, i) => {
            const isFar = needsFar && leg.expiry === farExpiry;
            const opts = isFar ? farStrikes : strikes;
            return (
              <tr key={i}>
                <td className="px-1.5 py-1">
                  {pick(
                    leg.action,
                    (v) => onChange(i, { action: v as "long" | "short" }),
                    [
                      { value: "long", label: t("legBuy") },
                      { value: "short", label: t("legSell") },
                    ],
                    "leg side",
                  )}
                </td>
                <td className="px-1.5 py-1">
                  {leg.kind === "stock" ? (
                    <span className="text-[var(--muted)]">{t("stock")}</span>
                  ) : (
                    <span>
                      {leg.kind === "call" ? t("callOpt") : t("putOpt")}
                      {isFar ? (
                        <span className="ml-1 text-[10px] text-[var(--muted)]">
                          {t("farTag")}
                        </span>
                      ) : null}
                    </span>
                  )}
                </td>
                <td className="px-1.5 py-1">
                  {leg.kind === "stock" ? (
                    <span className="text-[var(--muted)]">—</span>
                  ) : (
                    pick(
                      String(leg.strike ?? ""),
                      (v) => onChange(i, { strike: Number(v) }),
                      opts.map((s) => ({
                        value: String(s),
                        label: formatNumber(s, { maximumFractionDigits: 3 }),
                      })),
                      "leg strike",
                    )
                  )}
                </td>
                <td className="px-1.5 py-1">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={leg.qty}
                    onChange={(e) =>
                      onChange(i, {
                        qty: Math.max(1, Math.min(99, Number(e.target.value) || 1)),
                      })
                    }
                    className={`${FIELD_CLS} w-14 tabular-nums`}
                  />
                </td>
                <td className="px-1.5 py-1 text-right tabular-nums">
                  {leg.kind === "stock"
                    ? "—"
                    : leg.premium != null
                      ? formatNumber(leg.premium, { maximumFractionDigits: 3 })
                      : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
