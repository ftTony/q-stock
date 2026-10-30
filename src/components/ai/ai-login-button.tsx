"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";

/** Same chrome as comments-drawer AuthLoginGate compact CTA. */
export const AI_LOGIN_CTA_CLASS =
  "qt-btn-primary mt-4 inline-flex h-9 w-full max-w-[12rem] items-center justify-center rounded-full px-5 text-[13px] font-medium no-underline";

export function AiLoginButton(props: {
  className?: string;
  children?: ReactNode;
}) {
  const tNav = useTranslations("nav");
  const loginModal = useLoginModalOptional();
  const className = props.className ?? AI_LOGIN_CTA_CLASS;
  const label = props.children ?? tNav("login");

  if (loginModal) {
    return (
      <button
        type="button"
        className={className}
        onClick={loginModal.openLogin}
      >
        {label}
      </button>
    );
  }

  return (
    <Link href="/login" className={className}>
      {label}
    </Link>
  );
}
