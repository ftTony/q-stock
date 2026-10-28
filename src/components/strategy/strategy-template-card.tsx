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
    "text-[var(--up)] bg-[color-mix(in_srgb,var(--up)_10%,transparent)]",
  tagRisk: "text-[var(--brand-text)] bg-[var(--brand-soft)]",
  tagDca: "text-[var(--brand-text)] bg-[var(--brand-soft)]",
  tagExit:
    "text-[color-mix(in_srgb,#ca8a04_95%,var(--foreground))] bg-[color-mix(in_srgb,#ca8a04_10%,transparent)]",
  tagDiscipline: "text-[var(--muted)] bg-[var(--panel)]",
  tagSizing: "text-[var(--brand-text)] bg-[var(--brand-soft)]",
};

function Stars({ n }: { n: number }) {
  return (
    <span
      className="inline-flex gap-px text-[10px] leading-none tracking-tight"
      aria-label={`${n}/5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < n
              ? "text-[color-mix(in_srgb,#ca8a04_85%,var(--foreground))]"
              : "text-[var(--border)]"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

const MARKET_KEYS: Record<
  string,
  | "marketStock"
  | "marketIndex"
  | "marketEtf"
  | "marketFutures"
  | "marketCrypto"
  | "marketFund"
> = {
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
    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5">
      {markets.map((m) => {
        const key = MARKET_KEYS[m];
        return (
          <span key={m} className="text-[11px] text-[var(--muted)]">
            {key ? t(key) : m}
          </span>
        );
      })}
    </div>
  );
}

/** Soft tile on the lab panel — light radius; no nested bordered cards. */
const TILE =
  "flex h-auto w-full flex-col rounded-md bg-[var(--surface-2)] p-3.5 sm:p-4";

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
    <li className={TILE}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/strategies/${row.id}`}
            className="text-[14px] font-semibold tracking-tight hover:text-[var(--brand-text)] sm:text-[15px]"
          >
            {title}
          </Link>
          {meta ? (
            <div className="mt-1.5">
              <span
                className={`inline-block px-1.5 py-0.5 text-[10px] font-medium ${TAG_TONE[meta.tagKey]}`}
              >
                {t(meta.tagKey)}
              </span>
            </div>
          ) : null}
        </div>
        {meta ? (
          <div className="shrink-0 pt-0.5">
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

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--border)] pt-2.5">
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
          {t("viewDetails")}
        </Link>
        {showCopy ? (
          <SubmitButton
            type="button"
            loading={copyBusy}
            loadingLabel={t("loading")}
            onClick={onCopy}
            className="qt-btn qt-btn-primary ml-auto h-7 px-2.5 text-[12px]"
          >
            {t("copy")}
          </SubmitButton>
        ) : null}
      </div>
    </li>
  );
}

export function StrategyMineCard({
  row,
  deleting,
  onDelete,
}: {
  row: StrategyCardRow;
  deleting?: boolean;
  onDelete?: () => void;
}) {
  const t = useTranslations("strategies");
  return (
    <li className={TILE}>
      <Link
        href={`/strategies/${row.id}`}
        className="text-[15px] font-semibold tracking-tight hover:text-[var(--brand-text)]"
      >
        {row.name}
      </Link>
      {row.description ? (
        <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[var(--muted)]">
          {row.description}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--border)] pt-2.5">
        <Link
          href={`/strategies/${row.id}`}
          className="text-[12px] font-medium text-[var(--brand-text)] hover:underline"
        >
          {t("open")}
        </Link>
        {onDelete ? (
          <SubmitButton
            type="button"
            loading={Boolean(deleting)}
            loadingLabel={t("loading")}
            onClick={onDelete}
            className="ml-auto h-7 px-1 text-[12px] text-[var(--danger)] hover:underline disabled:opacity-60"
          >
            {t("delete")}
          </SubmitButton>
        ) : null}
      </div>
    </li>
  );
}
