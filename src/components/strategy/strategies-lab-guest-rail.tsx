"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AuthLoginArt } from "@/components/auth/auth-login-gate";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";

/** Match 「+ 新建策略」: h-8 + kill qt-btn-primary default 8px vertical padding. */
export const LAB_SIDEBAR_PRIMARY_BTN =
  "qt-btn qt-btn-primary box-border h-8 w-full shrink-0 !py-0 px-2.5 text-[12px] font-medium leading-none";

/**
 * Guest “我的策略” rail — short mark + hint + login.
 * Natural height only (no 36% empty band).
 */
export function StrategiesLabGuestRail() {
  const t = useTranslations("strategies");
  const tNav = useTranslations("nav");
  const loginModal = useLoginModalOptional();

  return (
    // No border-b here — parent lower block already has hairline border-t
    // (avoid 1+1 double rule looking “粗”). Extra pb for air before 新建.
    <div className="flex shrink-0 flex-col items-center gap-2.5 px-2.5 pb-4 pt-3.5 text-center">
      <AuthLoginArt className="h-12 w-auto text-[var(--brand)]" />
      <p className="max-w-[13rem] text-[11px] leading-relaxed text-[var(--muted)]">
        {t("loginHint")}
      </p>
      {loginModal ? (
        <button
          type="button"
          onClick={loginModal.openLogin}
          className={LAB_SIDEBAR_PRIMARY_BTN}
        >
          {tNav("login")}
        </button>
      ) : (
        <Link href="/login" className={LAB_SIDEBAR_PRIMARY_BTN}>
          {tNav("login")}
        </Link>
      )}
    </div>
  );
}
