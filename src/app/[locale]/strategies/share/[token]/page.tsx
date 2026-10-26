"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { StrategyShareView } from "@/components/strategy/strategy-share-view";

export default function StrategySharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const t = useTranslations("strategies");

  return (
    <div className="animate-[qtFade_0.45s_ease]">
      <div className="mb-3 flex items-center gap-2 text-[12px]">
        <Link
          href="/strategies"
          className="text-[var(--brand-text)] hover:underline"
        >
          {t("back")}
        </Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--muted)]">{t("shareReadonly")}</span>
      </div>
      <StrategyShareView token={token} />
    </div>
  );
}
