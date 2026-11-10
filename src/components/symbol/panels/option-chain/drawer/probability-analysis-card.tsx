"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { QtSelect } from "@/components/ui/qt-select";
import { formatNumber } from "@/lib/format-number";
import { FIELD_CLS, QT_TRIGGER } from "./drawer-ui";
import { ProbabilityChart } from "./probability-chart";
import {
  buildProbabilityCone,
  expectedMovePct,
  type ProbMode,
} from "./probability-math";

type Props = {
  spot: number;
  ivPct: number | null;
  daysToExpiry: number;
  ratePct: number;
  strikeMarks: number[];
};

const CONF_PRESETS = [50, 68, 90, 95];

export function ProbabilityAnalysisCard({
  spot,
  ivPct,
  daysToExpiry,
  ratePct,
  strikeMarks,
}: Props) {
  const t = useTranslations("symbol.optTool");
  const [mode, setMode] = useState<ProbMode>("inside");
  const [confRaw, setConfRaw] = useState("68");

  const confPct = useMemo(() => {
    const n = Number(confRaw);
    if (!Number.isFinite(n)) return 68;
    return Math.min(99, Math.max(1, n));
  }, [confRaw]);

  const sigmaPct = ivPct != null && ivPct > 0 ? ivPct : 30;

  const cone = useMemo(
    () =>
      buildProbabilityCone({
        spot,
        ivPct: sigmaPct,
        daysToExpiry,
        ratePct,
        confPct,
        steps: 56,
      }),
    [spot, sigmaPct, daysToExpiry, ratePct, confPct],
  );

  const movePct = useMemo(
    () => expectedMovePct(spot, sigmaPct, daysToExpiry, confPct, ratePct),
    [spot, sigmaPct, daysToExpiry, confPct, ratePct],
  );

  if (!(spot > 0) || daysToExpiry < 0) {
    return (
      <p className="text-[11px] text-[var(--muted)]">{t("probUnavailable")}</p>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="space-y-2">
        <div className="text-[12px] font-medium text-[var(--foreground)]">
          {t("probTitle")}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <span className="shrink-0">{t("probMode")}</span>
            <QtSelect
              value={mode}
              onChange={(v) => setMode(v as ProbMode)}
              options={[
                { value: "inside", label: t("probModeInside") },
                { value: "above", label: t("probModeAbove") },
                { value: "below", label: t("probModeBelow") },
              ]}
              triggerClassName={QT_TRIGGER}
              aria-label={t("probMode")}
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <span className="shrink-0">{t("probRange")}</span>
            <input
              className={`${FIELD_CLS} w-14`}
              inputMode="decimal"
              value={confRaw}
              list="opt-prob-conf"
              onChange={(e) => setConfRaw(e.target.value)}
              aria-label={t("probRange")}
            />
            <datalist id="opt-prob-conf">
              {CONF_PRESETS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <span className="inline-flex h-7 min-w-[4.25rem] items-center justify-center border border-[var(--border)] px-1.5 text-[11px] font-semibold tabular-nums text-[var(--foreground)]">
              {movePct == null
                ? "—"
                : `${formatNumber(movePct, { maximumFractionDigits: 2 })} %`}
            </span>
          </label>
        </div>
      </div>

      <ProbabilityChart
        cone={cone}
        spot={spot}
        ivPct={sigmaPct}
        ratePct={ratePct}
        strikeMarks={strikeMarks}
        labels={{
          above: t("probGreater"),
          below: t("probLess"),
        }}
      />

      <p className="text-[11px] leading-relaxed text-[var(--muted)]">
        {t("probFootnote", {
          conf: confPct,
          iv: formatNumber(sigmaPct, { maximumFractionDigits: 1 }),
        })}
      </p>
    </div>
  );
}
