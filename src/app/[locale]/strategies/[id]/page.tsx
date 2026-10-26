"use client";

import { Suspense, use } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { StrategyDetail } from "@/components/strategy/strategy-detail";

function DetailBody({ id }: { id: string }) {
  return <StrategyDetail strategyId={id} />;
}

export default function StrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
        <span className="text-[var(--muted)]">{t("detailTitle")}</span>
      </div>
      <Suspense fallback={<p className="text-sm text-[var(--muted)]">{t("loading")}</p>}>
        <DetailBody id={id} />
      </Suspense>
    </div>
  );
}
