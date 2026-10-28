"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
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

  return (
    <section className="space-y-3 border-t border-[var(--aw-hairline,var(--border))] pt-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
        {t("billingTitle")}
      </h2>
      <p className="text-[13px] leading-relaxed text-[var(--muted)]">
        {t("billingBody")}
      </p>

      {query.isLoading ? (
        <p className="text-[13px] text-[var(--muted)]">{t("billingLoading")}</p>
      ) : ent ? (
        <div className="space-y-1 text-[13px] leading-relaxed text-[var(--muted)]">
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
                mode: quota.mode,
              })}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        {!ent?.isPro ? (
          <>
            <button
              type="button"
              className="qt-btn qt-btn-primary h-9 px-3 text-[13px]"
              disabled={busy}
              onClick={() => void startCheckout("monthly")}
            >
              {t("billingUpgradeMonthly")}
            </button>
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-9 px-3 text-[13px]"
              disabled={busy}
              onClick={() => void startCheckout("yearly")}
            >
              {t("billingUpgradeYearly")}
            </button>
          </>
        ) : ent.stripeEnabled ? (
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3 text-[13px]"
            disabled={busy}
            onClick={() => void openPortal()}
          >
            {t("billingManage")}
          </button>
        ) : null}
        <Link
          href="/pricing"
          className="qt-btn qt-btn-ghost h-9 px-3 text-[13px]"
          onClick={() => void trackBillingClick("click_upgrade")}
        >
          {t("billingCompare")}
        </Link>
      </div>

      <form onSubmit={onRedeem} className="flex flex-wrap items-end gap-2 pt-1">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-[12px] text-[var(--muted)]">
          {t("billingRedeemLabel")}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-9 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-[13px] text-[var(--foreground)]"
            placeholder={t("billingRedeemPlaceholder")}
            autoComplete="off"
          />
        </label>
        <SubmitButton
          type="submit"
          className="qt-btn qt-btn-ghost h-9 px-3 text-[13px]"
          disabled={busy || code.trim().length < 4}
        >
          {t("billingRedeemCta")}
        </SubmitButton>
      </form>

      {message ? (
        <p
          role="status"
          className="text-xs"
          style={{
            color: messageKind === "ok" ? "var(--up)" : "var(--down)",
          }}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
