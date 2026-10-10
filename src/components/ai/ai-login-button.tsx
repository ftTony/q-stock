"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function AiLoginButton(props: { className?: string }) {
  const t = useTranslations("ai");

  return (
    <Link
      href="/login"
      className={
        props.className ??
        "qt-btn-primary inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium"
      }
    >
      {t("loginLink")}
    </Link>
  );
}
