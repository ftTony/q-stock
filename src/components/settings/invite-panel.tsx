"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/i18n/config";

type InviteRow = {
  code: string;
  used: boolean;
  usedAt: string | null;
  inviteLink: string;
};

export function InvitePanel() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [invites, setInvites] = useState<InviteRow[] | null>(null);
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
        const data = (await res.json()) as { invites: InviteRow[] };
        if (!cancelled) setInvites(data.invites);
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
    <section className="qt-panel w-full space-y-3 p-5 sm:p-6">
      <h2 className="text-sm font-semibold tracking-tight">{t("inviteTitle")}</h2>

      <div
        className="flex gap-2 rounded-lg px-3 py-2.5 text-xs leading-relaxed"
        style={{
          background: "color-mix(in srgb, #3b82f6 10%, transparent)",
          color: "color-mix(in srgb, #1d4ed8 85%, var(--foreground))",
        }}
        role="note"
      >
        <span className="mt-px shrink-0 text-sm leading-none" aria-hidden>
          ⓘ
        </span>
        <p>{t("inviteHint")}</p>
      </div>

      {error && <p className="text-xs text-[var(--down)]">{error}</p>}

      {!invites && !error && (
        <p className="text-xs text-[var(--muted)]">{tCommon("loading")}</p>
      )}

      {invites && invites.length === 0 && (
        <p className="text-xs text-[var(--muted)]">{t("inviteEmpty")}</p>
      )}

      {invites && invites.length > 0 && (
        <ul className="space-y-2">
          {invites.map((row) => {
            const used = row.used;
            return (
              <li
                key={row.code}
                className={`flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 ${
                  used ? "opacity-50" : ""
                }`}
              >
                <code
                  className={`min-w-0 flex-1 truncate font-mono text-xs tracking-wide ${
                    used
                      ? "text-[var(--muted)] line-through"
                      : "text-[var(--foreground)]"
                  }`}
                  title={row.code}
                >
                  {row.code}
                </code>
                <div className="flex shrink-0 items-center gap-2">
                  {used ? (
                    <span className="text-[11px] text-[var(--muted)]">
                      {t("inviteUsed")}
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="qt-btn qt-btn-ghost h-8 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 text-xs font-medium leading-none"
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
                        className="qt-btn qt-btn-primary h-8 rounded-lg px-3 text-xs font-medium leading-none"
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
    </section>
  );
}
