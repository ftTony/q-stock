"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AiQuotaExhaustedHint } from "@/components/ai/ai-quota-exhausted";
import { AI_QUOTA_CHANGED } from "@/lib/ai/quota-events";
import { useAiQuota } from "@/hooks/query/use-ai-quota";
import { queryKeys } from "@/lib/query/keys";

/** Remaining AI uses for signed-in users; expands exits when exhausted. */
export function AiQuotaBadge(props: {
  className?: string;
  refreshKey?: number;
}) {
  const { status } = useSession();
  const t = useTranslations("ai");
  const qc = useQueryClient();
  const authenticated = status === "authenticated";
  const { data: quota } = useAiQuota(authenticated);

  useEffect(() => {
    if (props.refreshKey == null) return;
    void qc.invalidateQueries({ queryKey: queryKeys.ai.quota });
  }, [props.refreshKey, qc]);

  useEffect(() => {
    const onChange = () => {
      void qc.invalidateQueries({ queryKey: queryKeys.ai.quota });
    };
    window.addEventListener(AI_QUOTA_CHANGED, onChange);
    return () => window.removeEventListener(AI_QUOTA_CHANGED, onChange);
  }, [qc]);

  if (!authenticated) return null;
  if (
    !quota ||
    typeof quota.remaining !== "number" ||
    typeof quota.limit !== "number"
  ) {
    return null;
  }

  if (quota.remaining === 0) {
    return (
      <AiQuotaExhaustedHint
        compact
        className={props.className ?? "mt-1"}
      />
    );
  }

  return (
    <p className={props.className ?? "text-sm text-[var(--muted)]"}>
      {t("quotaRemaining", {
        remaining: quota.remaining,
        limit: quota.limit,
      })}
    </p>
  );
}
