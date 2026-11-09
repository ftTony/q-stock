"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatPrice } from "@/lib/format-number";
import type { HomeSnapshotRow } from "@/lib/marketing/home-snapshot";

export type SnapshotRowView = HomeSnapshotRow & { name: string };

function SnapshotTime({ iso }: { iso: string | null }) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const hhmm = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(d);
  return <span className="tabular-nums">{hhmm}</span>;
}

function pct(v: number | null): string {
  if (v == null) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

/**
 * 首屏行情快照卡：服务端渲染好数据，客户端只负责格式化与着色。
 * 涨跌色走 `--up` / `--down`，跟随站内的 CN/US 习惯设置。
 */
export function MarketSnapshotCard({
  rows,
  asOf,
}: {
  rows: SnapshotRowView[];
  asOf: string | null;
}) {
  const t = useTranslations("marketing");

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      <div className="flex items-center justify-between border-b border-[var(--border)]/70 px-4 py-3">
        <strong className="text-[13px] font-semibold">{t("snapshotTitle")}</strong>
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          {asOf ? (
            <>
              <i className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--down)]" />
              {t("snapshotLive")} · <SnapshotTime iso={asOf} />
            </>
          ) : null}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium">{t("snapshotEmpty")}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{t("snapshotEmptyBody")}</p>
        </div>
      ) : (
        <ul>
          {rows.map((row) => {
            const up = (row.percentChange ?? 0) >= 0;
            return (
              <li key={row.id} className="border-b border-[var(--border)]/60 last:border-b-0">
                <Link
                  href={`/symbol/${row.assetType}/${encodeURIComponent(row.symbol)}`}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 transition hover:bg-[color-mix(in_srgb,var(--foreground)_3.5%,transparent)]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">
                      {row.name}
                    </span>
                    <span className="block text-[10px] tracking-wide text-[var(--muted)]">
                      {row.market}
                    </span>
                  </span>
                  <span className="text-right text-[13px] tabular-nums">
                    {row.price == null ? "—" : formatPrice(row.price, 2)}
                  </span>
                  <span
                    className={`w-[62px] text-right text-[12px] font-medium tabular-nums ${
                      row.percentChange == null
                        ? "text-[var(--muted)]"
                        : up
                          ? "text-[var(--up)]"
                          : "text-[var(--down)]"
                    }`}
                  >
                    {pct(row.percentChange)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)]/70 bg-[var(--pearl)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--muted)]">{t("snapshotNote")}</span>
        <Link
          href="/markets"
          className="shrink-0 text-[11.5px] font-medium text-[var(--brand-text)]"
        >
          {t("snapshotCta")} →
        </Link>
      </div>
    </div>
  );
}
