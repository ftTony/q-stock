"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  SETTINGS_BTN_GHOST,
  SETTINGS_BTN_PRIMARY,
  SETTINGS_SUBMIT_GHOST,
} from "@/components/settings/settings-btn";
import { trackBillingClick } from "@/lib/billing/client-events";
import { fetchJson } from "@/lib/query/fetch-json";

type EntitlementsPayload = {
  entitlements: {
    plan: "free" | "pro";
    planExpiresAt: string | null;
    isPro: boolean;
    watchlistLimit: number;
    alertLimit: number;
    researchCardLimit: number;
    aiMonthlyLimit: number | null;
    stripeEnabled: boolean;
  };
  quota: {
    used: number;
    limit: number;
    remaining: number;
    mode: string;
  };
};

export function BillingPanel() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "err">("ok");
  const [busy, setBusy] = useState(false);

  const query = useQuery({
    queryKey: ["billing", "entitlements"],
    queryFn: () => fetchJson<EntitlementsPayload>("/api/billing/entitlements"),
  });

  const ent = query.data?.entitlements;
  const quota = query.data?.quota;

  async function startCheckout(interval: "monthly" | "yearly") {
    setBusy(true);
    setMessage(null);
    void trackBillingClick("click_upgrade", { interval });
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval, locale }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        setMessageKind("err");
        setMessage(
          data.code === "STRIPE_NOT_CONFIGURED"
            ? t("billingStripeSoon")
            : data.error || t("billingCheckoutError"),
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setMessageKind("err");
      setMessage(t("billingCheckoutError"));
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setMessageKind("err");
        setMessage(data.error || t("billingPortalError"));
        return;
      }
      window.location.href = data.url;
    } catch {
      setMessageKind("err");
      setMessage(t("billingPortalError"));
    } finally {
      setBusy(false);
    }
  }

  async function onRedeem(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setMessageKind("err");
        setMessage(data.error || t("billingRedeemError"));
        return;
      }
      setMessageKind("ok");
      setMessage(t("billingRedeemOk"));
      setCode("");
      await qc.invalidateQueries({ queryKey: ["billing"] });
      await qc.invalidateQueries({ queryKey: ["ai", "quota"] });
    } catch {
      setMessageKind("err");
      setMessage(t("billingRedeemError"));
    } finally {
      setBusy(false);
    }
  }

  const quotaModeLabel =
    quota?.mode === "pro"
      ? t("billingPlanPro")
      : quota?.mode === "byok"
        ? t("freemiumByok")
        : t("billingPlanFree");

  return (
    <section className="space-y-5 border-t border-[var(--aw-hairline,var(--border))] pb-5 pt-5">
      <div className="space-y-2">
        <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
          {t("billingTitle")}
        </h2>
        <p className="text-[13px] leading-relaxed text-[var(--muted)]">
          {t("billingBody")}
        </p>
      </div>

      {query.isLoading ? (
        <p className="text-[13px] text-[var(--muted)]">{t("billingLoading")}</p>
      ) : ent ? (
        <div className="space-y-2 text-[13px] leading-relaxed text-[var(--muted)]">
          <p>
            <span className="font-medium text-[var(--foreground)]">
              {t("billingPlan")}
            </span>
            {" — "}
            {ent.isPro ? t("billingPlanPro") : t("billingPlanFree")}
            {ent.planExpiresAt
              ? ` · ${t("billingExpires", {
                  date: new Date(ent.planExpiresAt).toLocaleDateString(locale),
                })}`
              : null}
          </p>
          <p>
            <span className="font-medium text-[var(--foreground)]">
              {t("billingLimits")}
            </span>
            {" — "}
            {t("billingLimitsBody", {
              watchlist: ent.watchlistLimit,
              alerts: ent.alertLimit,
              cards: ent.researchCardLimit,
            })}
          </p>
          {quota ? (
            <p>
              <span className="font-medium text-[var(--foreground)]">
                {t("billingAiQuota")}
              </span>
              {" — "}
              {t("billingAiQuotaBody", {
                remaining: quota.remaining,
                limit: quota.limit,
                mode: quotaModeLabel,
              })}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5">
        {!ent?.isPro ? (
          <>
            <button
              type="button"
              className={SETTINGS_BTN_PRIMARY}
              disabled={busy}
              onClick={() => void startCheckout("monthly")}
            >
              {t("billingUpgradeMonthly")}
            </button>
            <button
              type="button"
              className={SETTINGS_BTN_GHOST}
              disabled={busy}
              onClick={() => void startCheckout("yearly")}
            >
              {t("billingUpgradeYearly")}
            </button>
          </>
        ) : ent.stripeEnabled ? (
          <button
            type="button"
            className={SETTINGS_BTN_GHOST}
            disabled={busy}
            onClick={() => void openPortal()}
          >
            {t("billingManage")}
          </button>
        ) : null}
        <Link
          href="/pricing"
          className={`${SETTINGS_BTN_GHOST} no-underline`}
          onClick={() => void trackBillingClick("click_upgrade")}
        >
          {t("billingCompare")}
        </Link>
      </div>

      <div className="space-y-2.5 border-t border-[var(--aw-hairline,var(--border))] pt-4">
        <form onSubmit={onRedeem} className="space-y-2">
          <span className="block text-[13px] font-medium leading-snug text-[var(--foreground)]">
            {t("billingRedeemLabel")}
          </span>
          <div className="flex min-w-0 items-center gap-2.5">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="qt-input h-9 min-w-0 flex-1 px-3 text-[14px] leading-none"
              placeholder={t("billingRedeemPlaceholder")}
              autoComplete="off"
              aria-label={t("billingRedeemLabel")}
            />
            <SubmitButton
              type="submit"
              loading={busy}
              loadingLabel={t("billingRedeemCta")}
              className={SETTINGS_SUBMIT_GHOST}
              disabled={busy || code.trim().length < 4}
            >
              {t("billingRedeemCta")}
            </SubmitButton>
          </div>
        </form>

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
    </section>
  );
}
