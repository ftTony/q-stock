"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AI_QUOTA_CHANGED } from "@/lib/ai/quota-events";
import { useSettingsModalOptional } from "@/components/settings/settings-modal-context";

type Quota = { used: number; limit: number; remaining: number };

/** Remaining AI uses for signed-in users. */
export function AiQuotaBadge(props: {
  className?: string;
  refreshKey?: number;
}) {
  const { status } = useSession();
  const t = useTranslations("ai");
  const settingsModal = useSettingsModalOptional();
  const [quota, setQuota] = useState<Quota | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") {
      setQuota(null);
      return;
    }
    try {
      const res = await fetch("/api/ai/quota");
      if (!res.ok) {
        setQuota(null);
        return;
      }
      setQuota((await res.json()) as Quota);
    } catch {
      setQuota(null);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load, props.refreshKey]);

  useEffect(() => {
    const onChange = () => {
      void load();
    };
    window.addEventListener(AI_QUOTA_CHANGED, onChange);
    return () => window.removeEventListener(AI_QUOTA_CHANGED, onChange);
  }, [load]);

  if (status !== "authenticated") return null;

  if (!quota) return null;

  return (
    <p className={`text-sm text-[var(--muted)] ${props.className ?? ""}`}>
      {t("quotaRemaining", {
        remaining: quota.remaining,
        limit: quota.limit,
      })}
      {quota.remaining === 0 ? (
        <>
          {" "}
          {settingsModal ? (
            <button
              type="button"
              className="text-[var(--brand-text)] underline"
              onClick={() => settingsModal.openSettings()}
            >
              {t("inviteForMore")}
            </button>
          ) : (
            <Link href="/settings" className="text-[var(--brand-text)] underline">
              {t("inviteForMore")}
            </Link>
          )}
        </>
      ) : null}
    </p>
  );
}
