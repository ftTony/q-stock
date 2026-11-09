import { getTranslations } from "next-intl/server";

/** 快照卡占位：与 MarketSnapshotCard 同骨架，避免 Suspense 落位时 CLS。 */
export async function MarketSnapshotSkeleton() {
  const t = await getTranslations("marketing");
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      <div className="flex items-center justify-between border-b border-[var(--border)]/70 px-4 py-3">
        <strong className="text-[13px] font-semibold">{t("snapshotTitle")}</strong>
      </div>
      <ul aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <li
            key={i}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-[var(--border)]/60 px-4 py-2.5 last:border-b-0"
          >
            <span className="space-y-1.5">
              <span className="block h-3.5 w-24 animate-pulse rounded bg-[var(--border)]/70" />
              <span className="block h-2.5 w-10 animate-pulse rounded bg-[var(--border)]/50" />
            </span>
            <span className="h-3.5 w-14 animate-pulse rounded bg-[var(--border)]/60" />
            <span className="h-3.5 w-[62px] animate-pulse rounded bg-[var(--border)]/60" />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)]/70 bg-[var(--pearl)] px-4 py-2.5">
        <span className="text-[11px] text-[var(--muted)]">{t("snapshotNote")}</span>
        <span className="text-[11.5px] font-medium text-[var(--brand-text)]">
          {t("snapshotCta")} →
        </span>
      </div>
    </div>
  );
}
