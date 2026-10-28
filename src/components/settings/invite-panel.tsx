"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { InlineLoading } from "@/components/ui/panel-skeleton";
import { useInvites } from "@/hooks/query/use-invites";
import { trackBillingClick } from "@/lib/billing/client-events";

type InviteRow = {
  code: string;
  used: boolean;
  usedAt: string | null;
  inviteLink: string;
};

type AiQuota = { used: number; limit: number; remaining: number };

export function InvitePanel() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const invitesQuery = useInvites();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const payload = invitesQuery.data as
    | { invites: InviteRow[]; aiQuota?: AiQuota }
    | undefined;
  const invites = invitesQuery.isSuccess ? (payload?.invites ?? []) : null;
  const aiQuota = payload?.aiQuota ?? null;
  const error = invitesQuery.isError ? t("inviteLoadError") : null;

  useEffect(() => {
    if (!copiedKey) return;
    const timer = setTimeout(() => setCopiedKey(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedKey]);

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      void trackBillingClick("click_invite");
    } catch {
      /* ignore */
    }
  }

  function linkFor(row: InviteRow): string {
    return row.inviteLink;
  }

  function shareCodeText(code: string): string {
    return t("inviteShareCode", { code });
  }

  function shareLinkText(link: string): string {
    return t("inviteShareLink", { link });
  }

  return (
    <section className="invite-panel border-t border-[var(--aw-hairline,var(--border))] pt-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
        {t("inviteTitle")}
      </h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
        {t("inviteHint")}
      </p>

      {aiQuota ? (
        <p className="mt-2 text-[13px] leading-snug text-[var(--foreground)]">
          {t("inviteAiBonus", {
            remaining: aiQuota.remaining,
            limit: aiQuota.limit,
          })}
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 text-[13px] text-[var(--down)]">{error}</p>
      ) : null}

      {!invites && !error ? (
        <div className="mt-2">
          <InlineLoading label={tCommon("loading")} className="text-[13px]" />
        </div>
      ) : null}

      {invites && invites.length === 0 ? (
        <p className="mt-3 py-4 text-center text-[13px] text-[var(--muted)]">
          {t("inviteEmpty")}
        </p>
      ) : null}

      {invites && invites.length > 0 ? (
        <ul className="invite-list mt-2 divide-y divide-[var(--aw-hairline,var(--border))]">
          {invites.map((row) => {
            const used = row.used;
            return (
              <li
                key={row.code}
                className={`flex items-center gap-2.5 py-2 ${
                  used ? "opacity-50" : ""
                }`}
              >
                <code
                  className={`min-w-0 shrink font-mono text-[14px] font-medium tracking-[-0.02em] ${
                    used
                      ? "text-[var(--muted)] line-through"
                      : "text-[var(--foreground)]"
                  }`}
                  title={row.code}
                >
                  {row.code}
                </code>
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                  {used ? (
                    <span className="text-[13px] text-[var(--muted)]">
                      {t("inviteUsed")}
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="qt-btn qt-btn-ghost invite-action-btn"
                        onClick={() =>
                          void copyText(
                            `${row.code}-code`,
                            shareCodeText(row.code),
                          )
                        }
                      >
                        {copiedKey === `${row.code}-code`
                          ? t("inviteCopied")
                          : t("inviteCopyCode")}
                      </button>
                      <button
                        type="button"
                        className="qt-btn qt-btn-primary invite-action-btn"
                        onClick={() =>
                          void copyText(
                            `${row.code}-link`,
                            shareLinkText(linkFor(row)),
                          )
                        }
                      >
                        {copiedKey === `${row.code}-link`
                          ? t("inviteCopied")
                          : t("inviteCopyLink")}
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
