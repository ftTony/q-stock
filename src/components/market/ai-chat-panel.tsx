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
  layout?: "embed" | "page";
  onOpenHistory?: () => void;
  /** When set, load this session from the server then clear via onLoadSessionDone. */
  loadSessionId?: string | null;
  onLoadSessionDone?: () => void;
  /** Increment to start a blank conversation. */
  newChatNonce?: number;
}) {
  const t = useTranslations("aiChat");
  const tAi = useTranslations("ai");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const access = useAiAccess();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const page = props.layout === "page";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHydrating(true);
      setError(null);
      setInput("");
      if (!access.loggedIn) {
        setSessionId(null);
        setMessages([]);
        setHydrating(false);
        return;
      }
      try {
        const qs = new URLSearchParams({
          symbol: props.symbol,
          assetType: props.assetType,
          latest: "1",
        });
        const res = await fetch(`/api/ai/chat/sessions?${qs}`);
        if (!res.ok) throw new Error("load");
        const data = (await res.json()) as {
          session: { id: string; messages: ChatMsg[] } | null;
        };
        if (cancelled) return;
        if (data.session) {
          setSessionId(data.session.id);
          setMessages(
            data.session.messages.filter(
              (m) => m.role === "user" || m.role === "assistant",
            ),
          );
        } else {
          setSessionId(null);
          setMessages([]);
        }
      } catch {
        if (!cancelled) {
          setSessionId(null);
          setMessages([]);
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.symbol, props.assetType, access.loggedIn]);

  useEffect(() => {
    if (!props.loadSessionId) return;
    let cancelled = false;
    (async () => {
      setHydrating(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/ai/chat/sessions/${props.loadSessionId}`,
        );
        if (!res.ok) throw new Error("load");
        const data = (await res.json()) as {
          session: { id: string; messages: ChatMsg[] };
        };
        if (cancelled) return;
        setSessionId(data.session.id);
        setMessages(
          data.session.messages.filter(
            (m) => m.role === "user" || m.role === "assistant",
          ),
        );
      } catch {
        if (!cancelled) setError(t("historyLoadError"));
      } finally {
        if (!cancelled) {
          setHydrating(false);
          props.onLoadSessionDone?.();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.loadSessionId, props.onLoadSessionDone, t]);

  useEffect(() => {
    if (!props.newChatNonce) return;
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, [props.newChatNonce]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function persist(nextMessages: ChatMsg[], id: string | null) {
    if (!access.loggedIn || nextMessages.length === 0) return id;
    try {
      const res = await fetch("/api/ai/chat/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id ?? undefined,
          symbol: props.symbol,
          assetType: props.assetType,
          messages: nextMessages,
        }),
      });
      if (!res.ok) return id;
      const data = (await res.json()) as { id: string };
      setSessionId(data.id);
      return data.id;
    } catch {
      return id;
    }
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!access.loggedIn) return;
    const text = input.trim();
    if (!text || busy) return;

    if (!(await access.ensureQuota())) return;

    const prev = messages;
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
          setMessages(prev);
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

      const finalMsgs: ChatMsg[] = [
        ...next,
        { role: "assistant", content: assistant },
      ];
      setMessages(finalMsgs);
      await persist(finalMsgs, sessionId);
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

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={page ? "text-base font-semibold" : "text-sm font-semibold"}
          >
            {t("title")}
          </h3>
          <p
            className={
              page
                ? "mt-0.5 text-sm leading-snug text-[var(--muted)]"
                : "text-xs text-[var(--muted)]"
            }
          >
            {t("subtitle", { symbol: props.symbol })}
          </p>
        </div>
        {access.loggedIn ? (
          <div className="flex shrink-0 items-center gap-1">
            {props.onOpenHistory ? (
              <button
                type="button"
                onClick={props.onOpenHistory}
                disabled={busy}
                className="qt-btn-ghost rounded-md px-2 py-1 text-[14px] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
              >
                {t("history")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setSessionId(null);
                setMessages([]);
                setError(null);
              }}
              disabled={busy || (!sessionId && messages.length === 0)}
              className="qt-btn-ghost rounded-md px-2 py-1 text-[14px] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
            >
              {t("newChat")}
            </button>
          </div>
        ) : null}
      </div>

      <div
        className={
          page
            ? "max-h-[min(24rem,46dvh)] min-h-[12rem] space-y-2 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3.5 text-[15px] leading-relaxed qt-scroll"
            : "max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-3 text-sm qt-scroll"
        }
      >
        {hydrating && (
          <p className="text-[var(--muted)]">{tCommon("loading")}</p>
        )}
        {!hydrating && messages.length === 0 && (
          <p className="text-[var(--muted)]">{t("empty")}</p>
        )}
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}-${m.content.slice(0, 12)}`}
            className={
              m.role === "user"
                ? `ml-6 rounded-lg bg-[var(--brand-soft)] px-3 text-[var(--brand-text)] ${page ? "py-2.5" : "py-2"}`
                : `mr-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 whitespace-pre-wrap ${page ? "py-2.5" : "py-2"}`
            }
          >
            {m.content || (busy && i === messages.length - 1 ? "…" : "")}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p
          className={
            page ? "text-sm text-[var(--down)]" : "text-xs text-[var(--down)]"
          }
        >
          {error}
        </p>
      )}

      <form onSubmit={onSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          disabled={busy || !access.loggedIn || hydrating}
          className={
            page
              ? "qt-input min-w-0 flex-1 px-3.5 py-2.5 text-[14px]"
              : "qt-input min-w-0 flex-1 px-3 py-2 text-[14px]"
          }
          maxLength={2000}
        />
        {access.loggedIn ? (
          <SubmitButton
            loading={busy}
            showElapsed={(s) => tAi("elapsed", { seconds: s })}
            className={
              page
                ? "qt-btn-primary shrink-0 px-4 py-2.5"
                : "qt-btn-primary shrink-0 px-3 py-2"
            }
          >
            {t("send")}
          </SubmitButton>
        ) : (
          <AiLoginButton className="qt-btn-primary inline-flex shrink-0 items-center justify-center px-4 py-2.5 text-[14px] font-medium" />
        )}
      </form>
      <p
        className={
          page ? "text-xs text-[var(--muted)]" : "text-[11px] text-[var(--muted)]"
        }
      >
        {tAi("disclaimer")}
      </p>
    </div>
  );
}
