"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { CandleResolution } from "@/lib/types";
import type {
  MultiChartLayoutSize,
  MultiChartLeg,
} from "@/components/multi-chart/use-multi-chart-layout";

type Props = {
  layout: MultiChartLayoutSize;
  onLayoutChange: (layout: MultiChartLayoutSize) => void;
  resolution: CandleResolution;
  resolutions: CandleResolution[];
  resolutionLabels: Record<string, string>;
  onResolutionChange: (r: CandleResolution) => void;
  legs: Array<MultiChartLeg | null>;
  showMa: boolean;
  showMacd: boolean;
  onToggleMa: () => void;
  onToggleMacd: () => void;
};

export function MultiChartToolbar({
  layout,
  onLayoutChange,
  resolution,
  resolutions,
  resolutionLabels,
  onResolutionChange,
  legs,
  showMa,
  showMacd,
  onToggleMa,
  onToggleMacd,
}: Props) {
  const t = useTranslations("multiChart");
  const filled = legs.filter((l): l is MultiChartLeg => Boolean(l));
  const summary =
    filled.length > 0
      ? filled.map((l) => l.symbol).join(" · ")
      : t("summaryEmpty");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Link
          href="/analysis"
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--brand-text)]"
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t("backAnalysis")}
        </Link>
        <span
          className="hidden h-4 w-px shrink-0 bg-[var(--border)] sm:block"
          aria-hidden
        />
        <h1 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">
          {t("title")}
        </h1>
        <span className="min-w-0 max-w-[min(100%,28rem)] truncate text-[11px] tabular-nums text-[var(--muted)]">
          {summary}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SegmentedControl
            value={String(layout)}
            onChange={(v) => onLayoutChange(Number(v) as MultiChartLayoutSize)}
            className="h-8 w-fit items-stretch rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5"
            buttonClassName="inline-flex min-w-8 items-center justify-center px-2.5 text-[12px] font-medium leading-none tabular-nums"
            options={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "4", label: "4" },
            ]}
          />
          <SegmentedControl
            value={resolution}
            onChange={(v) => onResolutionChange(v as CandleResolution)}
            className="h-8 w-fit max-w-full items-stretch overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5"
            buttonClassName="inline-flex items-center px-2.5 text-[12px] font-medium leading-none"
            options={resolutions.map((r) => ({
              value: r,
              label: resolutionLabels[r] ?? r,
            }))}
          />
          <div className="flex h-8 items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5">
            <button
              type="button"
              onClick={onToggleMa}
              className={`h-full rounded-md px-2.5 text-[12px] font-medium leading-none ${
                showMa
                  ? "bg-[var(--brand-soft)] text-[var(--brand-text)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              MA
            </button>
            <button
              type="button"
              onClick={onToggleMacd}
              className={`h-full rounded-md px-2.5 text-[12px] font-medium leading-none ${
                showMacd
                  ? "bg-[var(--brand-soft)] text-[var(--brand-text)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              MACD
            </button>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[var(--muted)]">{t("syncHint")}</p>
    </div>
  );
}
