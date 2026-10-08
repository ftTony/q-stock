"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { IconRobot } from "@/components/ui/icon-robot";
import type { AssetType } from "@/lib/types";

export function SymbolAiFab(props: {
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("symbol");
  const label = t("openAi");

  return (
    <Link
      href={`/symbol/${props.assetType}/${props.symbol}/ai`}
      aria-label={label}
      title={label}
      className="fixed z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-white shadow-md transition hover:brightness-110 active:scale-[0.97] bottom-[4.75rem] right-4 lg:bottom-6 lg:right-6"
    >
      <IconRobot className="h-6 w-6" />
    </Link>
  );
}
