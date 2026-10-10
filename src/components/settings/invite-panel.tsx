"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { InlineLoading } from "@/components/ui/panel-skeleton";
import { localizedPath } from "@/i18n/config";

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
  const locale = useLocale();
  const [invites, setInvites] = useState<InviteRow[] | null>(null);
  const [aiQuota, setAiQuota] = useState<AiQuota | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/invites");
        if (!res.ok) {
          if (!cancelled) setError(t("inviteLoadError"));
          return;
        }
        const data = (await res.json()) as {
          invites: InviteRow[];
          aiQuota?: AiQuota;
        };
        if (!cancelled) {
          setInvites(data.invites);
          setAiQuota(data.aiQuota ?? null);
        }
      } catch {
        if (!cancelled) setError(t("inviteLoadError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (!copiedKey) return;
    const timer = setTimeout(() => setCopiedKey(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedKey]);

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch {
      /* ignore */
    }
  }

  function linkFor(row: InviteRow): string {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${localizedPath(locale, "/register")}?invite=${encodeURIComponent(row.code)}`;
    }
    return row.inviteLink;
  }

  function shareCodeText(code: string): string {
    return t("inviteShareCode", { code });
  }

  function shareLinkText(link: string): string {
    return t("inviteShareLink", { link });
  }

  return (
    <section className="qt-panel flex h-full flex-col overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-2.5">
        <h2 className="text-sm font-semibold tracking-tight">{t("inviteTitle")}</h2>
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-4">
        <p className="rounded-lg bg-[color-mix(in_srgb,#3b82f6_10%,transparent)] px-3 py-2 text-[11px] leading-relaxed text-[color-mix(in_srgb,#1d4ed8_85%,var(--foreground))]">
          {t("inviteHint")}
        </p>

        {aiQuota && (
          <p className="text-[11px] text-[var(--muted)]">
            {t("inviteAiBonus", {
              remaining: aiQuota.remaining,
              limit: aiQuota.limit,
            })}
          </p>
        )}

        {error && <p className="text-xs text-[var(--down)]">{error}</p>}

        {!invites && !error && (
          <InlineLoading label={tCommon("loading")} className="text-xs" />
        )}

        {invites && invites.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--muted)]">
            {t("inviteEmpty")}
          </p>
        )}

        {invites && invites.length > 0 && (
          <ul className="flex-1 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
            {invites.map((row) => {
              const used = row.used;
              return (
                <li
                  key={row.code}
                  className={`flex flex-wrap items-center gap-2 px-3 py-2 ${
                    used ? "opacity-50" : ""
                  }`}
                >
                  <code
                    className={`min-w-0 flex-1 truncate font-mono text-[11px] tracking-wide ${
                      used
                        ? "text-[var(--muted)] line-through"
                        : "text-[var(--foreground)]"
                    }`}
                    title={row.code}
                  >
                    {row.code}
                  </code>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {used ? (
                      <span className="text-[11px] text-[var(--muted)]">
                        {t("inviteUsed")}
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="qt-btn qt-btn-ghost h-9 px-3 font-medium"
                          onClick={() =>
                            copyText(`${row.code}-code`, shareCodeText(row.code))
                          }
                        >
                          {copiedKey === `${row.code}-code`
                            ? t("inviteCopied")
                            : t("inviteCopyCode")}
                        </button>
                        <button
                          type="button"
                          className="qt-btn qt-btn-primary h-9 px-3 font-medium"
                          onClick={() =>
                            copyText(
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
        )}
      </div>
    </section>
  );
}
