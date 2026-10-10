"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AiLoginButton } from "@/components/ai/ai-login-button";
import { useAiAccess } from "@/components/ai/use-ai-access";
import { SubmitButton } from "@/components/ui/submit-button";
import { TopToast } from "@/components/ui/top-toast";
import type { AssetType } from "@/lib/types";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function AiChatPanel(props: {
  symbol: string;
  assetType: AssetType;
  /** `page` = taller transcript on dedicated AI desk. */
  layout?: "embed" | "page";
}) {
  const t = useTranslations("aiChat");
  const tAi = useTranslations("ai");
  const locale = useLocale();
  const access = useAiAccess();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const page = props.layout === "page";

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [props.symbol, props.assetType]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!access.loggedIn) return;
    const text = input.trim();
    if (!text || busy) return;

    if (!(await access.ensureQuota())) return;

    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: props.symbol,
          assetType: props.assetType,
          locale,
          messages: next.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        if (access.handleAiHttpError(res.status)) {
          setMessages(messages);
          return;
        }
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || t("error"));
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error(t("error"));

      const decoder = new TextDecoder();
      let assistant = "";
      setMessages([...next, { role: "assistant", content: "" }]);

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: assistant }]);
      }
      void access.refreshQuota();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={
        page
          ? "space-y-3 border-t border-[var(--border)] pt-4"
          : "mt-6 space-y-3 border-t border-[var(--border)] pt-4"
      }
    >
      <TopToast
        key={access.toastKey}
        message={access.toastMsg}
        tone={access.toastTone}
        onDismiss={access.dismissToast}
      />

      <div>
        <h3 className="text-sm font-semibold">{t("title")}</h3>
        <p className="text-xs text-[var(--muted)]">
          {t("subtitle", { symbol: props.symbol })}
        </p>
      </div>

      <div
        className={
          page
            ? "max-h-[min(22rem,42dvh)] min-h-[12rem] space-y-2 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3 text-sm qt-scroll"
            : "max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3 text-sm qt-scroll"
        }
      >
        {messages.length === 0 && (
          <p className="text-[var(--muted)]">{t("empty")}</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-6 rounded-lg bg-[var(--brand-soft)] px-3 py-2 text-[var(--brand-text)]"
                : "mr-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 whitespace-pre-wrap"
            }
          >
            {m.content || (busy && i === messages.length - 1 ? "…" : "")}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-xs text-[var(--down)]">{error}</p>}

      <form onSubmit={onSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          disabled={busy || !access.loggedIn}
          className="qt-input min-w-0 flex-1 px-3 py-2 text-sm"
          maxLength={2000}
        />
        {access.loggedIn ? (
          <SubmitButton
            loading={busy}
            loadingLabel={tAi("loading")}
            className="qt-btn-primary shrink-0 px-3 py-2 text-sm"
          >
            {t("send")}
          </SubmitButton>
        ) : (
          <AiLoginButton className="qt-btn-primary inline-flex shrink-0 items-center justify-center px-3 py-2 text-sm font-medium" />
        )}
      </form>
      <p className="text-[11px] text-[var(--muted)]">{tAi("disclaimer")}</p>
    </div>
  );
}
