"use client";

import { Link } from "@/i18n/routing";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
  peers: string[];
};

/** Client peer chips for the about drawer (peers come from SSR). */
export function SymbolRelatedLinksClient({
  symbol,
  assetType,
  peers,
}: Props) {
  const list = peers.filter((s) => s !== symbol.toUpperCase());
  if (!list.length) return null;

  return (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--muted)]">
      {list.map((s) => (
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
