"use client";

import { useMemo } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";
import {
  SettingsPanel,
  type SettingsSection,
} from "@/components/settings/settings-panel";

type Props = {
  setupKeys?: boolean;
  /** When set, show section detail with back — else hub layout. */
  section?: SettingsSection | null;
};

type MenuItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "section"; section: SettingsSection; label: string };

function Chevron() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuGroup({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) {
  return (
    <section className="overflow-hidden border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)]">
      <h2 className="border-b border-[var(--aw-hairline,var(--border))] px-3 py-2 text-[11px] font-medium tracking-[-0.08px] text-[var(--muted)]">
        {title}
      </h2>
      <ul className="divide-y divide-[var(--aw-hairline,var(--border))]">
        {items.map((item) => {
          const className =
            "flex w-full items-center gap-3 px-3 py-3 text-left text-[13px] text-[var(--foreground)] transition hover:bg-[var(--sidebar-hover)]";
          if (item.kind === "link") {
            return (
              <li key={item.href}>
                <Link href={item.href} className={className}>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <Chevron />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.section}>
              <Link href={`/mine?section=${item.section}`} className={className}>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <Chevron />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** H5 「我的」hub：会员条 → 快捷入口 → 分组列表；section 为设置详情。 */
export function MinePage({ setupKeys = false, section = null }: Props) {
  const t = useTranslations("settings");
  const tNav = useTranslations("nav");
  const tMine = useTranslations("minePage");
  const { data: session, status } = useSession();
  const loginModal = useLoginModalOptional();
  const router = useRouter();

  const sectionLabels = useMemo(
    (): Record<SettingsSection, string> => ({
      general: t("navGeneral"),
      trading: t("navTrading"),
      market: t("navMarket"),
      notifications: t("navNotifications"),
      account: t("navAccount"),
      feedback: t("navFeedback"),
      about: t("navAbout"),
    }),
    [t],
  );

  const name =
    session?.user?.name?.trim() || session?.user?.email?.trim() || null;
  const initial = (name?.[0] ?? "?").toUpperCase();
  const loggedIn = status === "authenticated";

  if (section) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-[var(--background)]">
        <div className="settings-ui mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 pb-8 pt-2 sm:px-4">
          <div className="mb-3 flex items-center gap-2 border-b border-[var(--aw-hairline,var(--border))] pb-2">
            <Link
              href="/mine"
              className="inline-flex h-8 items-center px-1 text-[13px] text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← {tMine("back")}
            </Link>
            <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.2px]">
              {sectionLabels[section]}
            </h1>
          </div>
          <div className="border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] px-4 py-4">
            <SettingsPanel
              section={section}
              setupKeys={setupKeys && section === "market"}
            />
          </div>
        </div>
      </div>
    );
  }

  const settingsItems: MenuItem[] = [
    { kind: "section", section: "general", label: sectionLabels.general },
    { kind: "section", section: "trading", label: sectionLabels.trading },
    { kind: "section", section: "market", label: sectionLabels.market },
    {
      kind: "section",
      section: "notifications",
      label: sectionLabels.notifications,
    },
    { kind: "section", section: "account", label: sectionLabels.account },
  ];

  const supportItems: MenuItem[] = [
    { kind: "section", section: "feedback", label: sectionLabels.feedback },
    { kind: "section", section: "about", label: sectionLabels.about },
    { kind: "link", href: "/pricing", label: tNav("pricing") },
    { kind: "link", href: "/disclaimer", label: t("disclaimerPageLink") },
    { kind: "link", href: "/privacy", label: t("privacyPageLink") },
  ];

  return (
    <div className="flex min-h-[calc(100dvh-var(--wb-topbar-h,40px)-6rem)] flex-1 flex-col bg-[var(--background)] lg:min-h-full">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-3 pb-2 pt-3 sm:px-4">
        {/* Identity */}
        <header className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--brand-soft)] text-[15px] font-semibold text-[var(--brand-text)]"
            aria-hidden
          >
            {loggedIn ? initial : "·"}
          </div>
          <div className="min-w-0 flex-1">
            {loggedIn && name ? (
              <p className="truncate text-[15px] font-semibold tracking-[-0.2px] text-[var(--foreground)]">
                {name}
              </p>
            ) : status === "loading" ? (
              <p className="text-[13px] text-[var(--muted)]">…</p>
            ) : (
              <button
                type="button"
                className="text-[15px] font-semibold text-[var(--brand-text)]"
                onClick={() => loginModal?.openLogin()}
              >
                {t("login")}
              </button>
            )}
            <p className="truncate text-[12px] text-[var(--muted)]">
              {tMine("subtitle")}
            </p>
          </div>
        </header>

        {/* Plan strip — reference: membership bar + upgrade */}
        <div className="flex items-center gap-3 border border-[var(--aw-hairline,var(--border))] bg-[color-mix(in_srgb,var(--brand)_10%,var(--panel))] px-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold tracking-[-0.08px] text-[var(--foreground)]">
              {tMine("planTitle")}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-[var(--muted)]">
              {tMine("planHint")}
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 bg-[var(--foreground)] px-3 py-1.5 text-[12px] font-medium text-[var(--panel)]"
          >
            {tMine("upgrade")}
          </Link>
        </div>

        <MenuGroup title={tMine("groupSettings")} items={settingsItems} />
        <MenuGroup title={tMine("groupSupport")} items={supportItems} />

        {/* Sit just above H5 tab bar (main already has pb-24). */}
        {loggedIn ? (
          <button
            type="button"
            className="mt-auto shrink-0 border border-[color-mix(in_srgb,var(--down)_28%,var(--border))] bg-[color-mix(in_srgb,var(--down)_10%,var(--panel))] py-3 text-[13px] font-medium text-[var(--down)] transition hover:bg-[color-mix(in_srgb,var(--down)_16%,var(--panel))]"
            onClick={() => {
              void signOut({ redirect: false }).then(() => {
                router.refresh();
              });
            }}
          >
            {tNav("logout")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
