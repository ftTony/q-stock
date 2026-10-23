"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AiBusyLabel } from "@/components/ai/ai-busy-label";
import { AiLoginGate } from "@/components/ai/ai-login-gate";
import { useMounted } from "@/hooks/use-mounted";

export type AiTrendAnalysis = {
  bias: "bullish" | "neutral" | "bearish";
  confidence: number;
  horizon: "short" | "medium";
  summary: string;
  drivers: string[];
  risks: string[];
  sourcesUsed?: {
    news: number;
    earnings: number;
    metrics: number;
    hasQuote: boolean;
  };
};

export function AiAnalysisPanel(props: {
  available: boolean | null;
  message?: string | null;
  analysis: AiTrendAnalysis | null;
  disclaimer?: string | null;
  cached?: boolean;
  degraded?: boolean;
  loading?: boolean;
}) {
  const t = useTranslations("ai");
  const tCommon = useTranslations("common");
  const { status } = useSession();
  const mounted = useMounted();
  const { available, message, analysis, disclaimer, cached, degraded, loading } =
    props;

  if (loading || !mounted || status === "loading") {
    return <AiBusyLabel />;
  }

  if (status === "unauthenticated") {
    return <AiLoginGate />;
  }

  if (available === false) {
    return (
      <div className="space-y-2 text-sm">
        <p className="text-[var(--muted)]">{message || t("unavailable")}</p>
        {disclaimer && (
          <p className="aw-metric-label">{disclaimer}</p>
        )}
      </div>
    );
  }

  if (!analysis) {
    if (!message) return null;
    return (
      <p className="text-sm text-[var(--muted)]">
        {message || tCommon("degraded")}
      </p>
    );
  }

  const biasClass =
    analysis.bias === "bullish"
      ? "text-[var(--up)]"
      : analysis.bias === "bearish"
        ? "text-[var(--down)]"
        : "text-[var(--muted)]";

  const biasLabel =
    analysis.bias === "bullish"
      ? t("biasBullish")
      : analysis.bias === "bearish"
        ? t("biasBearish")
        : t("biasNeutral");

  const horizonLabel =
    analysis.horizon === "medium" ? t("horizonMedium") : t("horizonShort");

  const confPct = Math.round(analysis.confidence * 100);
  const src = analysis.sourcesUsed;

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <div>
          <span className="aw-metric-label">{t("bias")}</span>
          <p className={`text-lg font-semibold ${biasClass}`}>{biasLabel}</p>
        </div>
        <div>
          <span className="aw-metric-label">{t("confidence")}</span>
          <p className="font-medium">{confPct}%</p>
        </div>
        <div>
          <span className="aw-metric-label">{t("horizon")}</span>
          <p className="font-medium">{horizonLabel}</p>
        </div>
        {(cached || degraded) && (
          <div className="aw-metric-label">
            {cached ? t("cached") : null}
            {cached && degraded ? " · " : null}
            {degraded ? tCommon("degraded") : null}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-1 aw-metric-label font-medium">
          {t("summary")}
        </h3>
        <p className="leading-relaxed whitespace-pre-wrap">{analysis.summary}</p>
      </div>

      {analysis.drivers.length > 0 && (
        <div>
          <h3 className="mb-1 aw-metric-label font-medium">
            {t("drivers")}
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            {analysis.drivers.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.risks.length > 0 && (
        <div>
          <h3 className="mb-1 aw-metric-label font-medium">
            {t("risks")}
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            {analysis.risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {src && (
        <p className="aw-metric-label">
          {t("sources", {
            news: src.news,
            earnings: src.earnings,
            metrics: src.metrics,
          })}
          {src.hasQuote ? ` · ${t("withQuote")}` : ""}
        </p>
      )}

      <p className="aw-metric-label border-t border-[var(--border)] pt-3">
        {disclaimer || t("disclaimer")}
      </p>
    </div>
  );
}
