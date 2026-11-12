"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal/legal-shared";
import { SETTINGS_BTN_PRIMARY } from "@/components/settings/settings-btn";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";
import { useMounted } from "@/hooks/use-mounted";

type View = "compose" | "history";

type HistoryItem = {
  id: string;
  body: string;
  hasImage: boolean;
  status: "open" | "reviewed";
  createdAt: string;
};

const IMAGE_MAX_BYTES = 140_000;

async function compressImageFile(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1280;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return null;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > IMAGE_MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > IMAGE_MAX_BYTES) return null;
  return dataUrl;
}

function formatWhen(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}

/** Settings → 功能建议: compose + personal history (Futu-style desk form). */
export function SettingsFeedbackPanel() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const mounted = useMounted();
  const { data: session, status } = useSession();
  const loginModal = useLoginModalOptional();
  const fileRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<View>("compose");
  const [body, setBody] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loggedIn = Boolean(session?.user);

  const loadHistory = useCallback(async () => {
    if (!loggedIn) {
      setHistory([]);
      return;
    }
    setHistoryError(null);
    try {
      const res = await fetch("/api/user/suggestions", { cache: "no-store" });
      if (res.status === 401) {
        setHistory([]);
        return;
      }
      if (!res.ok) throw new Error("load");
      const data = (await res.json()) as { items: HistoryItem[] };
      setHistory(data.items ?? []);
    } catch {
      setHistoryError(t("feedbackLoadError"));
      setHistory([]);
    }
  }, [loggedIn, t]);

  useEffect(() => {
    if (view === "history") void loadHistory();
  }, [view, loadHistory]);

  const onPickImage = async (file: File | null) => {
    setError(null);
    if (!file) {
      setImageData(null);
      return;
    }
    try {
      const dataUrl = await compressImageFile(file);
      if (!dataUrl) {
        setError(t("feedbackImageTooLarge"));
        setImageData(null);
        return;
      }
      setImageData(dataUrl);
    } catch {
      setError(t("feedbackImageTooLarge"));
      setImageData(null);
    }
  };

  const onSubmit = async () => {
    setError(null);
    setFlash(null);
    const trimmed = body.trim();
    if (trimmed.length < 8) {
      setError(t("feedbackTooShort"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/user/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: trimmed,
          imageData,
        }),
      });
      if (res.status === 429) {
        setError(t("feedbackRateLimited"));
        return;
      }
      if (!res.ok) {
        setError(t("feedbackSubmitError"));
        return;
      }
      setBody("");
      setImageData(null);
      if (fileRef.current) fileRef.current.value = "";
      setFlash(t("feedbackSubmitted"));
      setHistory(null);
    } catch {
      setError(t("feedbackSubmitError"));
    } finally {
      setBusy(false);
    }
  };

  if (!mounted || status === "loading") {
    return <PanelSkeleton rows={5} label={tCommon("loading")} />;
  }

  if (view === "history") {
    return (
      <div className="settings-ui space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
            {t("feedbackHistoryTitle")}
          </h2>
          <button
            type="button"
            className="text-[13px] font-medium text-[var(--brand-text)] hover:underline"
            onClick={() => setView("compose")}
          >
            {t("feedbackBackCompose")}
          </button>
        </div>

        {!loggedIn ? (
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            {t("feedbackHistoryLogin")}{" "}
            {loginModal ? (
              <button
                type="button"
                className="font-medium text-[var(--brand-text)]"
                onClick={loginModal.openLogin}
              >
                {t("login")}
              </button>
            ) : null}
          </p>
        ) : historyError ? (
          <p className="text-[13px] text-[var(--down)]">{historyError}</p>
        ) : history == null ? (
          <PanelSkeleton rows={4} label={tCommon("loading")} />
        ) : history.length === 0 ? (
          <p className="text-[13px] text-[var(--muted)]">{t("feedbackHistoryEmpty")}</p>
        ) : (
          <ul className="divide-y divide-[var(--aw-hairline,var(--border))] border border-[var(--aw-hairline,var(--border))]">
            {history.map((item) => (
              <li key={item.id} className="space-y-1.5 px-3 py-3">
                <div className="flex items-center justify-between gap-2 text-[12px] text-[var(--muted)]">
                  <span>{formatWhen(item.createdAt, locale)}</span>
                  <span className="inline-flex items-center gap-1.5">
                    {item.hasImage ? (
                      <span className="text-[var(--muted)]">
                        {t("feedbackHasImage")}
                      </span>
                    ) : null}
                    <span>
                      {item.status === "reviewed"
                        ? t("feedbackStatusReviewed")
                        : t("feedbackStatusOpen")}
                    </span>
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--foreground)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="settings-ui space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
            {t("feedbackTitle")}
          </h2>
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            {t("feedbackHint")}{" "}
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(t("feedbackMailSubject"))}`}
              className="font-medium text-[var(--brand-text)] hover:underline"
            >
              {t("feedbackContact")}
            </a>
          </p>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={() => setView("history")}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l2.5 1.5" strokeLinecap="round" />
          </svg>
          {t("feedbackHistory")}
        </button>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={7}
        maxLength={4000}
        placeholder={t("feedbackPlaceholder")}
        className="qt-input w-full resize-y !rounded-none px-3 py-2.5 text-[13px] leading-relaxed"
      />

      <div className="flex flex-wrap items-end gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
        />
        {imageData ? (
          <div className="relative h-20 w-20 overflow-hidden border border-[var(--aw-hairline,var(--border))] bg-[var(--aw-parchment,var(--surface-2))]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageData}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              className="absolute right-0.5 top-0.5 inline-flex h-5 w-5 items-center justify-center bg-black/55 text-[11px] text-white"
              aria-label={t("feedbackRemoveImage")}
              onClick={() => {
                setImageData(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 items-center justify-center border border-dashed border-[var(--aw-hairline,var(--border))] text-[22px] text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)]"
            aria-label={t("feedbackAddImage")}
          >
            +
          </button>
        )}
        <p className="max-w-[14rem] text-[12px] leading-snug text-[var(--muted)]">
          {t("feedbackImageHint")}
        </p>
      </div>

      {error ? (
        <p className="text-[13px] text-[var(--down)]" role="alert">
          {error}
        </p>
      ) : null}
      {flash ? (
        <p className="text-[13px] text-[var(--up)]" role="status">
          {flash}
        </p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={() => void onSubmit()}
        className={`${SETTINGS_BTN_PRIMARY} w-full sm:w-auto sm:min-w-[10rem]`}
      >
        {busy ? tCommon("loading") : t("feedbackSubmit")}
      </button>
    </div>
  );
}
