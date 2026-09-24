"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { IpoStatus } from "@/lib/market/ipo-types";
import type { AssetType } from "@/lib/types";

export type IpoRow = {
  id: string;
  symbol: string;
  name: string;
  date: string;
  content?: string;
  assetType: AssetType;
  linkable: boolean;
  status: IpoStatus;
};

export function IpoPanel({
  assetType,
}: {
  assetType: Exclude<AssetType, "crypto">;
}) {
  const t = useTranslations("market");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<IpoStatus>("listing");
  const [items, setItems] = useState<IpoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    if (assetType !== "hk") return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/ipo?assetType=hk&status=${status}&limit=4`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          items?: IpoRow[];
          degraded?: boolean;
        };
        if (cancelled) return;
        setItems(data.items ?? []);
        setDegraded(Boolean(data.degraded) || !(data.items ?? []).length);
      } catch {
        if (!cancelled) {
          setItems([]);
          setDegraded(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assetType, status]);

  if (assetType !== "hk") return null;

  return (
    <div className="qt-panel flex h-full flex-col p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{t("ipo")}</h2>
        <SegmentedControl
          value={status}
          onChange={setStatus}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5"
          buttonClassName="px-2 py-1 text-[11px] font-semibold"
          options={[
            { value: "listing", label: t("ipoListing") },
            { value: "listed", label: t("ipoListed") },
            { value: "filing", label: t("ipoFiling") },
          ]}
        />
      </div>
      {loading ? (
        <p className="text-sm text-[var(--muted)]">{tCommon("loading")}</p>
      ) : degraded || items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t("ipoEmpty")}</p>
      ) : (
        <ul
          className={
            items.length > 1
              ? "flex flex-1 flex-col justify-between gap-0"
              : "flex flex-col gap-0"
          }
        >
          {items.map((item) => {
            const titleClass =
              "block truncate text-sm font-medium hover:text-[var(--brand-text)]";
            return (
              <li
                key={item.id}
                className={`flex items-center border-b border-[var(--border)] py-2.5 first:pt-0 last:border-0 last:pb-0 ${
                  items.length > 1 ? "flex-1" : ""
                }`}
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="min-w-0">
                    {item.linkable ? (
                      <Link
                        href={`/symbol/${item.assetType}/${item.symbol}`}
                        className={titleClass}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-medium text-[var(--fg)]">
                        {item.name}
                      </span>
                    )}
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--muted)]">
                      <span className="tabular-nums">{item.symbol}</span>
                      {item.content ? <span>{item.content}</span> : null}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[11px] tabular-nums text-[var(--muted)]">
                    {item.date || "—"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
