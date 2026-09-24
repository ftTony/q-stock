"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

type ProviderId = "longbridge" | "futu" | "finnhub" | "binance";

const PROVIDER_I18N: Record<ProviderId, string> = {
  longbridge: "providerLongbridge",
  futu: "providerFutu",
  finnhub: "providerFinnhub",
  binance: "providerBinance",
};

/**
 * Fixed bottom-left badge showing configured market-data sources
 * in priority order for the current session (BYOK for LB/Futu).
 */
export function DataSourceBadge() {
  const t = useTranslations("common");
  const { status: sessionStatus } = useSession();
  const [chain, setChain] = useState<ProviderId[]>([]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          providers?: Record<string, boolean>;
          providerPriority?: string[];
        };
        const configured = data.providers ?? {};
        const priority = (data.providerPriority ?? []).filter(
          (id): id is ProviderId =>
            id in PROVIDER_I18N && Boolean(configured[id]),
        );
        const ordered = priority.length
          ? priority
          : (Object.keys(PROVIDER_I18N) as ProviderId[]).filter(
              (id) => configured[id],
            );
        if (!cancelled) setChain(ordered);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  if (!chain.length) return null;

  const labels = chain.map((id) => t(PROVIDER_I18N[id]));
  const primary = labels[0];
  const title = `${t("dataSource")}: ${labels.join(" → ")}`;

  return (
    <div
      className="pointer-events-none fixed bottom-[4.25rem] left-3 z-30 max-w-[min(100vw-1.5rem,20rem)] lg:bottom-3 lg:left-[272px]"
      title={title}
    >
      <div className="pointer-events-auto rounded-lg border border-[var(--border)] bg-[var(--panel)]/90 px-2.5 py-1.5 text-[11px] text-[var(--muted)] shadow-sm backdrop-blur-md">
        <span className="mr-1.5 opacity-80">{t("dataSource")}</span>
        <span className="font-medium text-[var(--foreground)]">{primary}</span>
        {labels.length > 1 ? (
          <span className="ml-1 opacity-70">
            → {labels.slice(1).join(" → ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
