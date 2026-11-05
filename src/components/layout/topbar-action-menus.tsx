"use client";

import { signOut } from "next-auth/react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  locales,
  languageLabels,
  localeCode,
  type AppLocale,
} from "@/i18n/config";
import { EmptyStateBlock } from "@/components/symbol/shared/symbol-empty-art";

export type TopbarAlertItem = {
  id: string;
  symbol: string;
  assetType: string;
  condition: "gte" | "lte";
  triggerPrice: number;
  status: "active" | "triggered" | "disabled";
  triggeredAt?: string | null;
};

export function LanguageMenuPanel({
  locale,
  onClose,
}: {
  locale: string;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div role="listbox" className="p-1">
      {locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            role="option"
            aria-selected={active}
            className={`flex w-full items-center gap-2 rounded-none px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--sidebar-hover)] ${
              active
                ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)]"
                : "text-[var(--foreground)]"
            }`}
            onClick={() => {
              onClose();
              if (!active) router.replace(pathname, { locale: l as AppLocale });
            }}
          >
            <span
              className={`inline-flex w-7 items-center justify-center rounded-none border px-0.5 py-0.5 text-[10px] font-bold ${
                active
                  ? "border-[var(--brand-text)] text-[var(--brand-text)]"
                  : "border-[var(--border)] bg-[var(--sidebar-hover)] text-[var(--muted)]"
              }`}
            >
              {localeCode(l)}
            </span>
            <span className="truncate">{languageLabels[l]}</span>
            {active ? (
              <svg
                className="ml-auto h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function AlertsMenuPanel({
  title,
  manageLabel,
  emptyLabel,
  statusLabel,
  gteLabel,
  lteLabel,
  recent,
  onClose,
}: {
  title: string;
  manageLabel: string;
  emptyLabel: string;
  statusLabel: (status: "active" | "triggered" | "disabled") => string;
  gteLabel: string;
  lteLabel: string;
  recent: TopbarAlertItem[];
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--aw-hairline,var(--border))] px-3 py-2">
        <span className="text-sm font-semibold">{title}</span>
        <Link
          href="/alerts"
          className="text-xs text-[var(--brand-text)]"
          onClick={onClose}
        >
          {manageLabel}
        </Link>
      </div>
      {recent.length === 0 ? (
        <EmptyStateBlock art="history" label={emptyLabel} compact />
      ) : (
        <ul className="max-h-72 overflow-auto">
          {recent.map((a) => (
            <li key={a.id} className="border-b border-[var(--border)] last:border-0">
              <Link
                href={`/alerts?symbol=${a.symbol}&assetType=${a.assetType}`}
                className="block px-3 py-2.5 hover:bg-[var(--sidebar-hover)]"
                onClick={onClose}
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">{a.symbol}</span>
                  <span
                    className={`text-[10px] uppercase ${
                      a.status === "triggered"
                        ? "text-[var(--down)]"
                        : "text-[var(--up)]"
                    }`}
                  >
                    {statusLabel(a.status)}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-[var(--muted)]">
                  {a.condition === "gte" ? gteLabel : lteLabel} {a.triggerPrice}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function UserMenuPanel({
  name,
  email,
  settingsLabel,
  portfolioLabel,
  reviewLabel,
  logoutLabel,
  onClose,
  onOpenSettings,
}: {
  name: string;
  email?: string | null;
  settingsLabel: string;
  portfolioLabel: string;
  reviewLabel: string;
  logoutLabel: string;
  onClose: () => void;
  onOpenSettings: () => void;
}) {
  const router = useRouter();

  return (
    <>
      <div className="border-b border-[var(--aw-hairline,var(--border))] px-3 py-2.5">
        <div className="truncate text-sm font-medium text-[var(--foreground)]">
          {name}
        </div>
        {email ? (
          <div className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
            {email}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--sidebar-hover)]"
        onClick={() => {
          onClose();
          onOpenSettings();
        }}
      >
        {settingsLabel}
      </button>
      <Link
        href="/portfolio"
        className="block px-3 py-2 text-sm hover:bg-[var(--sidebar-hover)]"
        onClick={onClose}
      >
        {portfolioLabel}
      </Link>
      <Link
        href="/review"
        className="block px-3 py-2 text-sm hover:bg-[var(--sidebar-hover)]"
        onClick={onClose}
      >
        {reviewLabel}
      </Link>
      <button
        type="button"
        className="block w-full px-3 py-2 text-left text-sm text-[var(--down)] hover:bg-[var(--sidebar-hover)]"
        onClick={() => {
          onClose();
          void signOut({ redirect: false }).then(() => {
            router.refresh();
          });
        }}
      >
        {logoutLabel}
      </button>
    </>
  );
}
