"use client";

import { QtSelect } from "@/components/ui/qt-select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TradeBidAsk } from "@/components/trading/trade-bid-ask";
import { useTranslations } from "next-intl";

type Side = "buy" | "sell";
type OrderType = "market" | "limit" | "stop";

type Props = {
  side: Side;
  onSide: (s: Side) => void;
  orderType: OrderType;
  onOrderType: (t: OrderType) => void;
  qty: string;
  onQty: (v: string) => void;
  limitPrice: string;
  onLimitPrice: (v: string) => void;
  stopPrice: string;
  onStopPrice: (v: string) => void;
  bid: number | null;
  ask: number | null;
  lastPrice: number | null;
};

const fieldLabel = "aw-metric-label mb-1 block";
const selectTrigger = "h-9 px-3 text-[13px]";
const fieldInput =
  "qt-input h-9 w-full px-3 text-[13px] tabular-nums leading-none";

export function TradeOrderFields({
  side,
  onSide,
  orderType,
  onOrderType,
  qty,
  onQty,
  limitPrice,
  onLimitPrice,
  stopPrice,
  onStopPrice,
  bid,
  ask,
  lastPrice,
}: Props) {
  const t = useTranslations("trading");

  return (
    <>
      <SegmentedControl
        value={side}
        onChange={onSide}
        className="aw-trade-side"
        buttonClassName="flex-1"
        options={[
          {
            value: "buy",
            label: t("buy"),
            indicatorClassName:
              "bg-[color-mix(in_srgb,var(--up)_16%,var(--aw-canvas,#fff))]",
            activeTextClassName: "text-[var(--up)] font-semibold",
          },
          {
            value: "sell",
            label: t("sell"),
            indicatorClassName:
              "bg-[color-mix(in_srgb,var(--down)_16%,var(--aw-canvas,#fff))]",
            activeTextClassName: "text-[var(--down)] font-semibold",
          },
        ]}
      />

      <div>
        <label className={fieldLabel}>{t("orderType")}</label>
        <QtSelect
          value={orderType}
          onChange={(v) => onOrderType(v as OrderType)}
          triggerClassName={selectTrigger}
          options={[
            { value: "limit", label: t("limit") },
            { value: "market", label: t("market") },
            { value: "stop", label: t("stop") },
          ]}
        />
      </div>

      <div>
        <label className={fieldLabel}>{t("qty")}</label>
        <input
          type="number"
          min="0"
          step="any"
          required
          value={qty}
          onChange={(e) => onQty(e.target.value)}
          className={fieldInput}
        />
      </div>

      <TradeBidAsk
        bid={bid}
        ask={ask}
        lastPrice={lastPrice}
        onPick={(p) => {
          onLimitPrice(String(Number(p.toFixed(4))));
          onOrderType("limit");
        }}
      />

      {orderType === "limit" ? (
        <div>
          <label className={fieldLabel}>{t("limitPrice")}</label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={limitPrice}
            onChange={(e) => onLimitPrice(e.target.value)}
            className={fieldInput}
          />
        </div>
      ) : null}

      {orderType === "stop" ? (
        <div>
          <label className={fieldLabel}>{t("stopPrice")}</label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={stopPrice}
            onChange={(e) => onStopPrice(e.target.value)}
            className={fieldInput}
          />
        </div>
      ) : null}
    </>
  );
}
