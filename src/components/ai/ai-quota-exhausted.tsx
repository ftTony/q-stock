"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSettingsModalOptional } from "@/components/settings/settings-modal-context";

/** Three clear exits when platform AI quota is used up. */
export function AiQuotaExhaustedHint({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations("ai");
  const settingsModal = useSettingsModalOptional();

  function openAccount() {
    settingsModal?.openSettings({ section: "account" });
  }

  const inviteBtn = settingsModal ? (
    <button
      type="button"
      className="font-medium text-[var(--brand-text)] underline"
      onClick={openAccount}
    >
      {t("pathInviteCta")}
    </button>
  ) : (
    <Link href="/settings" className="font-medium text-[var(--brand-text)] underline">
      {t("pathInviteCta")}
    </Link>
  );

  const byokBtn = settingsModal ? (
    <button
      type="button"
      className="font-medium text-[var(--brand-text)] underline"
      onClick={openAccount}
    >
      {t("pathByokCta")}
    </button>
  ) : (
    <Link href="/settings" className="font-medium text-[var(--brand-text)] underline">
      {t("pathByokCta")}
    </Link>
  );

  if (compact) {
    return (
      <p className={`text-[12px] leading-relaxed text-[var(--muted)] ${className}`}>
        {t("quotaExhaustedShort")}{" "}
        {inviteBtn}
        <span className="mx-1 text-[var(--border)]">·</span>
        {byokBtn}
      </p>
    );
  }

  return (
    <div
      className={`rounded-md border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5 ${className}`}
    >
      <p className="text-[13px] font-medium text-[var(--foreground)]">
        {t("quotaExhaustedTitle")}
      </p>
      <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-[var(--muted)]">
        <li>
          <span className="font-medium text-[var(--foreground)]">
            {t("pathFreeLabel")}
          </span>
          {" — "}
          {t("pathFreeBody")}
        </li>
        <li>
          <span className="font-medium text-[var(--foreground)]">
            {t("pathInviteLabel")}
          </span>
          {" — "}
          {t("pathInviteBody")} {inviteBtn}
        </li>
        <li>
          <span className="font-medium text-[var(--foreground)]">
            {t("pathByokLabel")}
          </span>
          {" — "}
          {t("pathByokBody")} {byokBtn}
        </li>
      </ul>
    </div>
  );
}
