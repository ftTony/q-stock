"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { MarketCredentialsForm } from "@/components/settings/market-credentials-form";
import { MarketOkxCredentialsForm } from "@/components/settings/market-okx-credentials-form";
import { MarketVendorPrefs } from "@/components/settings/market-vendor-prefs";
import { AiCredentialsForm } from "@/components/settings/ai-credentials-form";
import { BillingPanel } from "@/components/settings/billing-panel";
import { InvitePanel } from "@/components/settings/invite-panel";
import { PaperRiskSettingsForm } from "@/components/settings/paper-risk-settings-form";
import { SettingsAboutPanel } from "@/components/settings/settings-about-panel";
import { SettingsAccountNameForm } from "@/components/settings/settings-account-name-form";
import { SettingsGeneralForm } from "@/components/settings/settings-general-form";
import { NotificationsSettingsPanel } from "@/components/settings/notifications-settings-panel";
import { AuthLoginGate } from "@/components/auth/auth-login-gate";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";

export type SettingsSection =
  | "general"
  | "trading"
  | "market"
  | "notifications"
  | "account"
  | "about";

const GUEST_SECTIONS: SettingsSection[] = ["general", "about"];

function LoginCta({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  const loginModal = useLoginModalOptional();
  if (loginModal) {
    return (
      <button type="button" className={className} onClick={loginModal.openLogin}>
        {label}
      </button>
    );
  }
  return (
    <Link href="/login" className={className}>
      {label}
    </Link>
  );
}

type Props = {
  section: SettingsSection;
  setupKeys?: boolean;
  onSetupKeysDone?: () => void;
};

export function SettingsPanel({
  section,
  setupKeys = false,
  onSetupKeysDone,
}: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const loggedIn = Boolean(session?.user);

  if (status === "loading") {
    return <PanelSkeleton rows={4} label={tCommon("loading")} />;
  }

  if (!GUEST_SECTIONS.includes(section) && !loggedIn) {
    return (
      <div className="flex h-full min-h-[18rem] flex-1 flex-col items-center justify-center px-4 py-8">
        <AuthLoginGate
          compact
          title={t("loginToSection")}
          body={t("guestLockedHint")}
          hint=""
        />
      </div>
    );
  }

  if (section === "about") {
    return <SettingsAboutPanel />;
  }

  if (section === "trading") {
    return (
      <div className="settings-ui">
        <PaperRiskSettingsForm />
      </div>
    );
  }

  if (section === "market") {
    return (
      <div className="settings-ui space-y-5">
        <MarketVendorPrefs />
        <Suspense
          fallback={<PanelSkeleton rows={4} label={tCommon("loading")} />}
        >
          <MarketCredentialsForm
            forceSetupKeys={setupKeys}
            onSetupKeysDone={onSetupKeysDone}
          />
        </Suspense>
        <MarketOkxCredentialsForm />
      </div>
    );
  }

  if (section === "notifications") {
    return <NotificationsSettingsPanel />;
  }

  if (section === "account") {
    return (
      <div className="settings-ui space-y-0">
        <SettingsAccountNameForm />
        <section className="space-y-2.5 border-t border-[var(--aw-hairline,var(--border))] pb-5 pt-5">
          <h2 className="text-[15px] font-semibold tracking-[-0.2px]">
            {t("freemiumTitle")}
          </h2>
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            {t("freemiumBody")}
          </p>
          <ul className="space-y-2 text-[13px] leading-relaxed text-[var(--muted)]">
            <li>
              <span className="font-medium text-[var(--foreground)]">
                {t("freemiumInvite")}
              </span>
              {" — "}
              {t("freemiumInviteBody")}
            </li>
            <li>
              <span className="font-medium text-[var(--foreground)]">
                {t("freemiumByok")}
              </span>
              {" — "}
              {t("freemiumByokBody")}
            </li>
            <li>
              <span className="font-medium text-[var(--foreground)]">
                {t("freemiumPro")}
              </span>
              {" — "}
              {t("freemiumProBody")}
            </li>
          </ul>
        </section>
        <BillingPanel />
        <InvitePanel />
        <AiCredentialsForm />
      </div>
    );
  }

  return (
    <div className="settings-ui">
      {!loggedIn ? (
        <p className="mb-4 text-[13px] text-[var(--muted)]">
          {t("guestHint")}{" "}
          <LoginCta
            label={t("login")}
            className="font-medium text-[var(--brand-text)]"
          />
        </p>
      ) : null}
      <SettingsGeneralForm />
    </div>
  );
}
