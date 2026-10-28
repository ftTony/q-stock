"use client";

import { useTranslations } from "next-intl";
import { SymbolRelatedLinksClient } from "@/components/symbol/quote/symbol-related-links-client";
import { SymbolSeoAboutBody } from "@/components/symbol/quote/symbol-seo-about-body";
import { SideDrawer } from "@/components/ui/side-drawer";
import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";
import type { AssetType } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  symbol: string;
  assetType: AssetType;
  copy: SymbolSeoCopy;
  peers: string[];
  edgeOffsetPx?: number;
  topOffsetPx?: number;
};

/** User-facing about sheet — same copy as SSR crawl, no bottom chrome. */
export function SymbolSeoAboutDrawer({
  open,
  onClose,
  symbol,
  assetType,
  copy,
  peers,
  edgeOffsetPx = 0,
  topOffsetPx = 0,
}: Props) {
  const t = useTranslations("seo");
  const title =
    copy.name && copy.name !== symbol ? `${symbol} ${copy.name}` : symbol;

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={copy.aboutLabel}
      subtitle={title}
      edgeOffsetPx={edgeOffsetPx}
      topOffsetPx={topOffsetPx}
      widthClassName="max-w-[22rem]"
    >
      <div className="space-y-4 p-4">
        <SymbolSeoAboutBody copy={copy} />
        {peers.length ? (
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-[var(--foreground)]/80">
              {t("relatedSymbols")}
            </p>
            <SymbolRelatedLinksClient
              symbol={symbol}
              assetType={assetType}
              peers={peers}
            />
          </div>
        ) : null}
      </div>
    </SideDrawer>
  );
}
