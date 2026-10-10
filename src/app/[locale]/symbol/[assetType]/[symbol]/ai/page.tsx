import { redirect } from "@/i18n/routing";
import { defaultLocale, type AppLocale } from "@/i18n/config";
import { parseAssetType } from "@/lib/types";

type Props = {
  params: Promise<{ locale: string; assetType: string; symbol: string }>;
};

/** AI desk is a right drawer on the symbol page — keep old URLs working. */
export default async function SymbolAiRedirect({ params }: Props) {
  const { locale: rawLocale, assetType: rawType, symbol: rawSymbol } =
    await params;
  const locale = (rawLocale || defaultLocale) as AppLocale;
  const assetType = parseAssetType(rawType);
  const symbol = decodeURIComponent(rawSymbol || "").toUpperCase();
  redirect({ href: `/symbol/${assetType}/${symbol}`, locale });
}
