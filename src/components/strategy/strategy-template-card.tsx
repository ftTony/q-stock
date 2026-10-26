"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  localizedTemplateCopy,
  templateMetaBySlug,
  type StrategyTemplateMeta,
} from "@/lib/strategy/templates";

export type StrategyCardRow = {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  isTemplate: boolean;
};

const TAG_TONE: Record<StrategyTemplateMeta["tagKey"], string> = {
  tagTrend:
    "text-[var(--up)] bg-[color-mix(in_srgb,var(--up)_12%,transparent)]",
  tagRisk: "text-[var(--brand-text)] bg-[var(--brand-soft)]",
  tagDca: "text-[var(--brand-text)] bg-[var(--brand-soft)]",
  tagExit:
    "text-[color-mix(in_srgb,#ca8a04_95%,var(--foreground))] bg-[color-mix(in_srgb,#ca8a04_12%,transparent)]",
  tagDiscipline: "text-[var(--muted)] bg-[var(--surface-2)]",
  tagSizing: "text-[var(--brand-text)] bg-[var(--brand-soft)]",
};

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < n
              ? "text-[color-mix(in_srgb,#ca8a04_90%,var(--foreground))]"
              : "text-[var(--border)]"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

const MARKET_KEYS: Record<string, "marketStock" | "marketIndex" | "marketEtf" | "marketFutures" | "marketCrypto" | "marketFund"> = {
  stock: "marketStock",
  index: "marketIndex",
  etf: "marketEtf",
  futures: "marketFutures",
  crypto: "marketCrypto",
  fund: "marketFund",
};

function MarketPills({ markets }: { markets: string[] }) {
  const t = useTranslations("strategies");
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {markets.map((m) => {
        const key = MARKET_KEYS[m];
        return (
          <span
            key={m}
            className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]"
          >
            {key ? t(key) : m}
          </span>
        );
      })}
    </div>
  );
}

export function StrategyTemplateCard({
  row,
  showCopy,
  copyBusy,
  onCopy,
}: {
  row: StrategyCardRow;
  showCopy: boolean;
  copyBusy: boolean;
  onCopy: () => void;
}) {
  const t = useTranslations("strategies");
  const locale = useLocale();
  const meta = templateMetaBySlug(row.slug);
  const localized = localizedTemplateCopy(row.slug, locale);
  const title = localized?.name ?? row.name;
  const blurb = localized?.description ?? row.description;

  return (
    <li className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3.5 transition hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--border))] sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/strategies/${row.id}`}
            className="text-[14px] font-semibold tracking-tight hover:text-[var(--brand-text)] sm:text-[15px]"
          >
            {title}
          </Link>
          {meta ? (
            <div className="mt-1">
              <span
                className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${TAG_TONE[meta.tagKey]}`}
              >
                {t(meta.tagKey)}
              </span>
            </div>
          ) : null}
        </div>
        {meta ? (
          <div className="shrink-0 text-[11px]">
            <Stars n={meta.difficulty} />
          </div>
        ) : null}
      </div>

      {blurb ? (
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--muted)]">
          {blurb}
        </p>
      ) : null}

      {meta ? <MarketPills markets={meta.markets} /> : null}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
        {meta ? (
          <Link
            href={meta.learnHref}
            className="text-[12px] text-[var(--muted)] hover:text-[var(--brand-text)]"
          >
            {t("learnStrategy")}
          </Link>
        ) : null}
        <Link
          href={`/strategies/${row.id}`}
          className="text-[12px] font-medium text-[var(--brand-text)] hover:underline"
        >
          {t("viewDetails")} →
        </Link>
        {showCopy ? (
          <SubmitButton
            type="button"
            loading={copyBusy}
            loadingLabel={t("loading")}
            onClick={onCopy}
            className="qt-btn qt-btn-ghost ml-auto h-7 border border-[var(--border)] px-2 text-[12px]"
          >
            {t("copy")}
          </SubmitButton>
        ) : null}
      </div>
    </li>
  );
}

export function StrategyMineCard({ row }: { row: StrategyCardRow }) {
  const t = useTranslations("strategies");
  return (
    <li className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
      <Link
        href={`/strategies/${row.id}`}
        className="text-[15px] font-semibold tracking-tight hover:text-[var(--brand-text)]"
      >
        {row.name}
      </Link>
      {row.description ? (
        <p className="mt-2 line-clamp-2 text-[12px] text-[var(--muted)]">
          {row.description}
        </p>
      ) : null}
      <Link
        href={`/strategies/${row.id}`}
        className="mt-4 text-[12px] font-medium text-[var(--brand-text)] hover:underline"
      >
        {t("open")} →
      </Link>
    </li>
  );
}
