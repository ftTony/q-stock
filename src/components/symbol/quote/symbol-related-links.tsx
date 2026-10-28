import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { displayName } from "@/lib/market-names";
import { seedSymbolsForMarket, type SitemapMarket } from "@/lib/seo/sitemap-symbols";
import type { AssetType } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
};

/** Server-rendered internal links so crawlers can hop between symbols. */
export async function SymbolRelatedLinks({ symbol, assetType }: Props) {
  const t = await getTranslations("seo");
  const peers = seedSymbolsForMarket(assetType as SitemapMarket)
    .filter((s) => s !== symbol.toUpperCase())
    .slice(0, 8);
  if (!peers.length) return null;

  return (
    <nav
      aria-label={t("relatedSymbols")}
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--muted)]"
    >
      <span className="font-medium text-[var(--fg)]">{t("relatedSymbols")}</span>
      {peers.map((s) => (
        <Link
          key={s}
          href={`/symbol/${assetType}/${encodeURIComponent(s)}`}
          className="hover:text-[var(--brand-text)] hover:underline"
        >
          {s}
          <span className="sr-only"> {displayName(s, assetType)}</span>
        </Link>
      ))}
    </nav>
  );
}
