"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import type { AssetType } from "@/lib/types";

type ChartReadPayload = {
  structure: string;
  keyLevels: number[];
  whatWouldChangeMind: string;
  notes: string[];
  features?: { barCount?: number; structure?: string };
  disclaimer?: string;
  cached?: boolean;
  degraded?: boolean;
  error?: string;
};

export function AiChartReadPanel(props: {
  symbol: string;
  assetType: AssetType;
  /** `page` = dedicated AI desk (no top border). */
  layout?: "embed" | "page";
}) {
  const t = useTranslations("aiChart");
  const tAi = useTranslations("ai");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [data, setData] = useState<ChartReadPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const page = props.layout === "page";

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/chart-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: props.symbol,
          assetType: props.assetType,
          locale,
        }),
      });
      const json = (await res.json()) as ChartReadPayload;
      if (!res.ok) throw new Error(json.error || t("error"));
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={
        page
          ? "space-y-3"
          : "mt-6 space-y-3 border-t border-[var(--border)] pt-4"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{t("title")}</h3>
          <p className="text-xs text-[var(--muted)]">{t("subtitle")}</p>
        </div>
        <SubmitButton
          type="button"
          loading={busy}
          loadingLabel={tAi("loading")}
          onClick={() => void run()}
          className="qt-btn-ghost border border-[var(--border)] px-3 py-1.5 text-sm"
        >
          {t("run")}
        </SubmitButton>
      </div>

      {error && <p className="text-xs text-[var(--down)]">{error}</p>}

      {data && (
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="text-xs text-[var(--muted)]">{t("structure")}</h4>
            <p className="mt-0.5 whitespace-pre-wrap">{data.structure}</p>
          </div>
          {data.keyLevels?.length > 0 && (
            <div>
              <h4 className="text-xs text-[var(--muted)]">{t("keyLevels")}</h4>
              <p className="mt-0.5 tabular-nums">
                {data.keyLevels.map((n) => n.toFixed(2)).join(" · ")}
              </p>
            </div>
          )}
          <div>
            <h4 className="text-xs text-[var(--muted)]">{t("invalidation")}</h4>
            <p className="mt-0.5 whitespace-pre-wrap">
              {data.whatWouldChangeMind}
            </p>
          </div>
          {data.notes?.length > 0 && (
            <ul className="list-disc space-y-1 pl-5">
              {data.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
          <p className="text-xs text-[var(--muted)]">
            {data.features?.barCount != null
              ? t("bars", { count: data.features.barCount })
              : null}
            {data.cached ? ` · ${tAi("cached")}` : null}
            {data.degraded ? ` · ${tCommon("degraded")}` : null}
          </p>
          <p className="text-[11px] text-[var(--muted)]">
            {data.disclaimer || tAi("disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}
