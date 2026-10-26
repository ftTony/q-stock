"use client";

import { useTranslations } from "next-intl";
import { StrategiesLab } from "@/components/strategy/strategies-lab";

export default function StrategiesPage() {
  const t = useTranslations("strategies");

  return (
    <div className="flex animate-[qtFade_0.45s_ease] flex-col lg:h-[calc(100dvh-5.5rem)] lg:overflow-hidden">
      <div className="mb-3 shrink-0">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          {t("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[var(--muted)] sm:text-[13px]">
          {t("subtitle")}
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <StrategiesLab />
      </div>
    </div>
  );
}
