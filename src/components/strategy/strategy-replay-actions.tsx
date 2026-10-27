"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { IconRobot } from "@/components/ui/icon-robot";
import { TopToast, type ToastTone } from "@/components/ui/top-toast";
import {
  useReplayAiReview,
  useShareReplay,
  type ReplayAiReview,
} from "@/hooks/query/use-strategy-lab";

function IconShare({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.5 13.5l7-4M8.5 10.5l7 4" strokeLinecap="round" />
    </svg>
  );
}

function IconLinkOff({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M9.5 14.5l5-5" />
      <path d="M14 9.5l1.2-1.2a3.2 3.2 0 0 1 4.5 4.5L18.5 14" />
      <path d="M10 14.5l-1.2 1.2a3.2 3.2 0 0 1-4.5-4.5L5.5 10" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

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
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<ToastTone>("neutral");
  const [toastKey, setToastKey] = useState(0);
  const [ai, setAi] = useState<ReplayAiReview | null>(null);
  const shareMut = useShareReplay();
  const aiMut = useReplayAiReview();

  const busy = shareMut.isPending
    ? "share"
    : aiMut.isPending
      ? "ai"
      : null;

  function showToast(message: string, tone: ToastTone = "neutral") {
    setToastTone(tone);
    setToastMsg(message);
    setToastKey((k) => k + 1);
  }

  if (status !== "done") return null;

  async function toggleShare() {
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
          showToast(t("shareCopied"), "success");
        } catch {
          showToast(url, "neutral");
        }
      } else {
        showToast(t("shareRevoked"), "neutral");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t("shareFailed"),
        "error",
      );
    }
  }

  async function runAi() {
    try {
      const data = await aiMut.mutateAsync({ replayId, locale });
      setAi(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t("aiReviewFailed"),
        "error",
      );
    }
  }

  const shareLabel = shareToken ? t("shareRevoke") : t("shareResult");

  return (
    <div className="space-y-3">
      <TopToast
        key={toastKey}
        message={toastMsg}
        tone={toastTone}
        onDismiss={() => setToastMsg(null)}
      />
      <div className="grid grid-cols-2 gap-2">
        <SubmitButton
          type="button"
          loading={busy === "share"}
          loadingLabel={t("loading")}
          className="qt-btn qt-btn-ghost h-9 px-3 text-[13px] leading-none"
          onClick={() => void toggleShare()}
        >
          <span className="inline-flex items-center gap-1.5 leading-none">
            {shareToken ? (
              <IconLinkOff className="block h-4 w-4 shrink-0" />
            ) : (
              <IconShare className="block h-4 w-4 shrink-0" />
            )}
            <span className="truncate leading-none">{shareLabel}</span>
          </span>
        </SubmitButton>
        <SubmitButton
          type="button"
          loading={busy === "ai"}
          loadingLabel={t("loading")}
          className="qt-btn qt-btn-primary h-9 px-3 text-[13px] leading-none"
          onClick={() => void runAi()}
        >
          <span className="inline-flex items-center gap-1.5 leading-none">
            <IconRobot className="block h-4 w-4 shrink-0" />
            <span className="truncate leading-none">{t("aiReview")}</span>
          </span>
        </SubmitButton>
      </div>
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
