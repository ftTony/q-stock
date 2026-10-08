"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ReviewDesk } from "@/components/review/review-desk";

export default function ReviewPage() {
  const t = useTranslations("review");
  const tNav = useTranslations("nav");
  const tAlerts = useTranslations("alerts");
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <div className="qt-panel p-6 text-sm">
        <p>{tAlerts("loginRequired")}</p>
        <Link
          href="/login"
          className="qt-btn qt-btn-primary mt-3 inline-flex px-3 py-1.5 text-sm"
        >
          {tNav("login")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[qtFade_0.45s_ease]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">{t("subtitle")}</p>
      </div>
      <ReviewDesk />
    </div>
  );
}
