"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  useReplayAiReview,
  useShareReplay,
  type ReplayAiReview,
} from "@/hooks/query/use-strategy-lab";

export function StrategyReplayActions({
  replayId,
  status,
  shareToken,
  onShareChange,
}: {
  replayId: string;
  status: string;
  shareToken: string | null;
  onShareChange?: (token: string | null) => void;
}) {
  const t = useTranslations("strategies");
  const locale = useLocale();
  const [msg, setMsg] = useState<string | null>(null);
  const [ai, setAi] = useState<ReplayAiReview | null>(null);
  const shareMut = useShareReplay();
  const aiMut = useReplayAiReview();

  const busy = shareMut.isPending
    ? "share"
    : aiMut.isPending
      ? "ai"
      : null;

  if (status !== "done") return null;

  async function toggleShare() {
    setMsg(null);
    try {
      const data = await shareMut.mutateAsync({
        replayId,
        revoke: Boolean(shareToken),
      });
      const token = data.replay?.shareToken ?? null;
      onShareChange?.(token);
      if (token) {
        const url = `${window.location.origin}/${locale === "en" ? "" : `${locale}/`}strategies/share/${token}`.replace(
          /([^:]\/)\/+/g,
          "$1",
        );
        try {
          await navigator.clipboard.writeText(url);
          setMsg(t("shareCopied"));
        } catch {
          setMsg(url);
        }
      } else {
        setMsg(t("shareRevoked"));
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("shareFailed"));
    }
  }

  async function runAi() {
    setMsg(null);
    try {
      const data = await aiMut.mutateAsync({ replayId, locale });
      setAi(data);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("aiReviewFailed"));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <SubmitButton
          type="button"
          loading={busy === "share"}
          loadingLabel={t("loading")}
          className="qt-btn h-8 px-3 text-xs"
          onClick={() => void toggleShare()}
        >
          {shareToken ? t("shareRevoke") : t("shareResult")}
        </SubmitButton>
        <SubmitButton
          type="button"
          loading={busy === "ai"}
          loadingLabel={t("loading")}
          className="qt-btn h-8 px-3 text-xs"
          onClick={() => void runAi()}
        >
          {t("aiReview")}
        </SubmitButton>
      </div>
      {msg ? (
        <p className="break-all text-[11px] text-[var(--muted)]">{msg}</p>
      ) : null}
      {ai ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3 text-[12px] leading-relaxed">
          <h3 className="mb-2 text-[13px] font-medium">{t("aiReviewTitle")}</h3>
          <p>{ai.processSummary}</p>
          <Section title={t("aiStoodOut")} items={ai.whatStoodOut} />
          <Section title={t("aiOverfit")} items={ai.overfittingRisks} />
          <Section title={t("aiChecklist")} items={ai.nextChecklist} />
          <p className="mt-2 text-[10px] text-[var(--muted)]">{ai.disclaimer}</p>
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-2">
      <div className="text-[11px] font-medium text-[var(--muted)]">{title}</div>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
