"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AiLoginGate } from "@/components/ai/ai-login-gate";
import { ReviewDesk } from "@/components/review/review-desk";

export default function ReviewPage() {
  const t = useTranslations("review");
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-sm text-[var(--muted)]">…</p>;
  }

  if (!session?.user) {
    return (
      <AiLoginGate
        fill
        title={t("loginTitle")}
        body={t("loginBody")}
        hint={t("loginHint")}
      />
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
