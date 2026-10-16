"use client";

import { useTranslations } from "next-intl";
import { StrategiesLab } from "@/components/strategy/strategies-lab";

export default function StrategiesPage() {
  const t = useTranslations("strategies");

  return (
    <div className="animate-[qtFade_0.45s_ease]">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("title")}
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-[var(--muted)]">
          {t("subtitle")}
        </p>
      </div>
      <StrategiesLab />
    </div>
  );
}
