"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";
import { AUTH_LOGIN_CTA_COMPACT } from "@/components/auth/auth-login-cta";

export const AI_LOGIN_CTA_CLASS = AUTH_LOGIN_CTA_COMPACT;

export function AiLoginButton(props: {
  className?: string;
  children?: ReactNode;
}) {
  const tNav = useTranslations("nav");
  const loginModal = useLoginModalOptional();
  const className = props.className ?? AUTH_LOGIN_CTA_COMPACT;
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
