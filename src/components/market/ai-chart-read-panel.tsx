"use client";

import { useTranslations } from "next-intl";
import { AiLoginButton } from "@/components/ai/ai-login-button";
import { SubmitButton } from "@/components/ui/submit-button";
import { TopToast } from "@/components/ui/top-toast";
import {
  useAiChartRead,
  type AiChartReadController,
} from "@/components/market/use-ai-chart-read";
import type { AssetType } from "@/lib/types";

/** Compact run/clear controls for the AI desk drawer header. */
export function AiChartReadHeaderActions(props: {
  chart: AiChartReadController;
}) {
  const t = useTranslations("aiChart");
  const tAi = useTranslations("ai");
  const { chart } = props;

  if (!chart.access.loggedIn) {
    return (
      <AiLoginButton className="aw-ai-pearl-btn inline-flex h-8 items-center justify-center px-3.5 text-[13px] font-semibold" />
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {chart.data ? (
        <button
          type="button"
          onClick={chart.clear}
          disabled={chart.busy}
          className="aw-ai-text-btn text-[11px] disabled:opacity-50"
        >
          {t("clearHistory")}
        </button>
      ) : null}
      <SubmitButton
        type="button"
        loading={chart.busy}
        showElapsed={(s) => tAi("elapsed", { seconds: s })}
        onClick={() => void chart.run()}
        className="aw-ai-pearl-btn"
      >
        {chart.data ? t("rerun") : t("run")}
      </SubmitButton>
    </div>
  );
}

type PanelProps = {
  symbol: string;
  assetType: AssetType;
  /** `page` = dedicated AI desk (no top border). */
  layout?: "embed" | "page";
  /** When set (desk header owns actions), only render toast + results. */
  chart?: AiChartReadController;
};

export function AiChartReadPanel(props: PanelProps) {
  if (props.chart) {
    return (
      <AiChartReadPanelView
        {...props}
        chart={props.chart}
        actionsInHeader
      />
    );
  }
  return <AiChartReadPanelOwned {...props} />;
}

function AiChartReadPanelOwned(props: Omit<PanelProps, "chart">) {
  const chart = useAiChartRead(props.symbol, props.assetType);
  return <AiChartReadPanelView {...props} chart={chart} />;
}

function AiChartReadPanelView(props: {
  symbol: string;
  assetType: AssetType;
  layout?: "embed" | "page";
  chart: AiChartReadController;
  actionsInHeader?: boolean;
}) {
  const t = useTranslations("aiChart");
  const tAi = useTranslations("ai");
  const tCommon = useTranslations("common");
  const { chart } = props;
  const page = props.layout === "page";
  const actionsInHeader = Boolean(props.actionsInHeader);

  // Empty desk strip: hide until there is something to show.
  if (page && actionsInHeader && !chart.data && !chart.error && !chart.busy) {
    return (
      <TopToast
        key={chart.access.toastKey}
        message={chart.access.toastMsg}
        tone={chart.access.toastTone}
        onDismiss={chart.access.dismissToast}
      />
    );
  }

  return (
    <section
      className={
        page
          ? "aw-ai-section aw-ai-chart space-y-2.5"
          : "mt-6 space-y-3 border-t border-[var(--border)] pt-4"
      }
    >
      <TopToast
        key={chart.access.toastKey}
        message={chart.access.toastMsg}
        tone={chart.access.toastTone}
        onDismiss={chart.access.dismissToast}
      />

      {actionsInHeader ? (
        chart.fromHistory && chart.data ? (
          <p className="aw-caption">{t("historyHint")}</p>
        ) : null
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {!page ? (
              <>
                <h3 className="text-base font-semibold">{t("title")}</h3>
                <p className="mt-0.5 text-sm leading-snug text-[var(--muted)]">
                  {t("subtitle")}
                </p>
              </>
            ) : null}
            {chart.fromHistory && chart.data ? (
              <p className="aw-caption mt-1">{t("historyHint")}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            {chart.data ? (
              <button
                type="button"
                onClick={chart.clear}
                disabled={chart.busy}
                className="aw-ai-text-btn disabled:opacity-50"
              >
                {t("clearHistory")}
              </button>
            ) : null}
            {chart.access.loggedIn ? (
              <SubmitButton
                type="button"
                loading={chart.busy}
                showElapsed={(s) => tAi("elapsed", { seconds: s })}
                onClick={() => void chart.run()}
                className={
                  page
                    ? "aw-ai-pearl-btn"
                    : "qt-btn-ghost border border-[var(--border)] px-4 py-2"
                }
              >
                {chart.data ? t("rerun") : t("run")}
              </SubmitButton>
            ) : (
              <AiLoginButton className="qt-btn-primary inline-flex h-10 items-center justify-center px-4 text-[14px] font-medium" />
            )}
          </div>
        </div>
      )}

      {chart.error ? (
        <p className="text-sm text-[var(--down)]">{chart.error}</p>
      ) : null}

      {chart.data ? (
        <div className="space-y-3 text-[15px] leading-relaxed">
          <div>
            <h4 className="text-sm text-[var(--muted)]">{t("structure")}</h4>
            <p className="mt-0.5 whitespace-pre-wrap">{chart.data.structure}</p>
          </div>
          {chart.data.keyLevels?.length > 0 ? (
            <div>
              <h4 className="text-sm text-[var(--muted)]">{t("keyLevels")}</h4>
              <p className="mt-0.5 tabular-nums">
                {chart.data.keyLevels.map((n) => n.toFixed(2)).join(" · ")}
              </p>
            </div>
          ) : null}
          <div>
            <h4 className="text-sm text-[var(--muted)]">{t("invalidation")}</h4>
            <p className="mt-0.5 whitespace-pre-wrap">
              {chart.data.whatWouldChangeMind}
            </p>
          </div>
          {chart.data.notes?.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {chart.data.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          ) : null}
          <p className="text-sm text-[var(--muted)]">
            {chart.data.features?.barCount != null
              ? t("bars", { count: chart.data.features.barCount })
              : null}
            {chart.data.cached ? ` · ${tAi("cached")}` : null}
            {chart.data.degraded ? ` · ${tCommon("degraded")}` : null}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {chart.data.disclaimer || tAi("disclaimer")}
          </p>
        </div>
      ) : null}
    </section>
  );
}
