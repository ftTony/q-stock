import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { learnHubsForSymbol } from "@/lib/seo/symbol-learn-hub";
import type { AssetType } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
};

/** Server-rendered Learn hubs so crawlers leave symbol pages into articles. */
export async function SymbolLearnLinks({ symbol, assetType }: Props) {
  const t = await getTranslations("seo");
  const hubs = learnHubsForSymbol(assetType, symbol);
  if (!hubs.length) return null;

  return (
    <nav
      aria-label={t("relatedLearn")}
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--muted)]"
    >
      <span className="font-medium text-[var(--fg)]">{t("relatedLearn")}</span>
      {hubs.map((h) => (
        <Link
          key={h.slug}
          href={`/learn/${h.slug}`}
          className="hover:text-[var(--brand-text)] hover:underline"
        >
          {t(h.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
