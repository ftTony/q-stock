"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  SETTINGS_SUBMIT_GHOST,
  SETTINGS_SUBMIT_PRIMARY,
} from "@/components/settings/settings-btn";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Status = {
  configured: boolean;
  subscribed: boolean;
};

/** Enable / disable PWA close-price push for the signed-in user. */
export function PushNotifySettings() {
  const t = useTranslations("settings");
  const { status: sessionStatus } = useSession();
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "err">("ok");

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  const refresh = useCallback(async () => {
    if (sessionStatus !== "authenticated") {
      setStatus(null);
      return;
    }
    try {
      const res = await fetch("/api/push/subscribe");
      if (!res.ok) {
        setStatus({ configured: false, subscribed: false });
        return;
      }
      const data = (await res.json()) as Status;
      setStatus({
        configured: Boolean(data.configured),
        subscribed: Boolean(data.subscribed),
      });
    } catch {
      setStatus({ configured: false, subscribed: false });
    }
  }, [sessionStatus]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      if (!supported) {
        setMessageKind("err");
        setMessage(t("pushUnsupported"));
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setMessageKind("err");
        setMessage(t("pushDenied"));
        return;
      }

      const keyRes = await fetch("/api/push/vapid-public-key");
      if (!keyRes.ok) {
        setMessageKind("err");
        setMessage(t("pushNotConfigured"));
        return;
      }
      const { publicKey } = (await keyRes.json()) as { publicKey: string };

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) {
        setMessageKind("err");
        setMessage(t("pushSaveError"));
        return;
      }
      setMessageKind("ok");
      setMessage(t("pushEnabled"));
      await refresh();
    } catch (err) {
      console.warn("[push] enable failed", err);
      setMessageKind("err");
      setMessage(t("pushSaveError"));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    try {
      if (supported) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe().catch(() => undefined);
        } else {
          await fetch("/api/push/subscribe", { method: "DELETE" });
        }
      } else {
        await fetch("/api/push/subscribe", { method: "DELETE" });
      }
      setMessageKind("ok");
      setMessage(t("pushDisabled"));
      await refresh();
    } catch (err) {
      console.warn("[push] disable failed", err);
      setMessageKind("err");
      setMessage(t("pushSaveError"));
    } finally {
      setBusy(false);
    }
  }

  if (sessionStatus !== "authenticated") return null;

  return (
    <section className="space-y-2.5 border-t border-[var(--aw-hairline,var(--border))] pb-4 pt-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
        {t("pushTitle")}
      </h2>
      <p className="text-[13px] leading-relaxed text-[var(--muted)]">
        {t("pushHint")}
      </p>
      {!supported ? (
        <p className="text-[13px] text-[var(--muted)]">{t("pushUnsupported")}</p>
      ) : status && !status.configured ? (
        <p className="text-[13px] text-[var(--muted)]">
          {t("pushNotConfigured")}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5">
          {status?.subscribed ? (
            <SubmitButton
              type="button"
              loading={busy}
              loadingLabel={t("pushWorking")}
              disabled={busy}
              onClick={() => void disable()}
              className={SETTINGS_SUBMIT_GHOST}
            >
              {t("pushDisable")}
            </SubmitButton>
          ) : (
            <SubmitButton
              type="button"
              loading={busy || status == null}
              loadingLabel={t("pushWorking")}
              disabled={busy || status == null}
              onClick={() => void enable()}
              className={SETTINGS_SUBMIT_PRIMARY}
            >
              {t("pushEnable")}
            </SubmitButton>
          )}
          {status?.subscribed && !busy ? (
            <span className="text-[12px] text-[var(--muted)]">
              {t("pushOn")}
            </span>
          ) : null}
          {message ? (
            <p
              role="status"
              className="text-xs leading-none"
              style={{
                color: messageKind === "ok" ? "var(--up)" : "var(--down)",
              }}
            >
              {messageKind === "ok" ? "✓ " : ""}
              {message}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
