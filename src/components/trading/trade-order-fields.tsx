"use client";

import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/segmented-control";

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
  /** Stack bottom: order type + qty on one row. */
  compact?: boolean;
  /** Broker ticket: big sell/buy blocks + type tabs (qty owned by parent). */
  broker?: boolean;
};

const fieldLabel = "aw-metric-label mb-1 block";
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
  lastPrice,
  compact = false,
  broker = false,
}: Props) {
  const t = useTranslations("trading");

  if (broker) {
    const types: { id: OrderType; label: string }[] = [
      { id: "market", label: t("market") },
      { id: "limit", label: t("limit") },
      { id: "stop", label: t("stop") },
    ];
    return (
      <div className="space-y-3">
        {/* Sell | Buy — no outer frame; solid active + quiet inactive (avoid 框套框) */}
        <div
          className="grid grid-cols-2 gap-px overflow-hidden bg-[var(--aw-hairline,var(--border))]"
          role="group"
          aria-label={t("side")}
        >
          <SideBtn
            active={side === "sell"}
            tone="sell"
            label={t("sell")}
            onClick={() => onSide("sell")}
          />
          <SideBtn
            active={side === "buy"}
            tone="buy"
            label={t("buy")}
            onClick={() => onSide("buy")}
          />
        </div>

        {/* Equal-width underline tabs — fills the ticket, no left-cluster void */}
        <div
          className="grid grid-cols-3 border-b border-[var(--aw-hairline,var(--border))]"
          role="tablist"
          aria-label={t("orderType")}
        >
          {types.map((opt) => {
            const on = orderType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onOrderType(opt.id)}
                className={`relative -mb-px flex h-8 items-center justify-center text-[12px] leading-none transition-colors ${
                  on
                    ? "font-semibold text-[var(--foreground)]"
                    : "font-normal text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {opt.label}
                {on ? (
                  <span
                    className="absolute inset-x-3 bottom-0 h-0.5 bg-[var(--foreground)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>

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
              placeholder={lastPrice != null ? String(lastPrice) : undefined}
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
      </div>
    );
  }

  const typeField = (
    <div>
      <label className={fieldLabel}>{t("orderType")}</label>
      <select
        value={orderType}
        onChange={(e) => onOrderType(e.target.value as OrderType)}
        className={`${fieldInput} appearance-none`}
      >
        <option value="limit">{t("limit")}</option>
        <option value="market">{t("market")}</option>
        <option value="stop">{t("stop")}</option>
      </select>
    </div>
  );

  const qtyField = (
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
  );

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
      {compact ? (
        <div className="grid grid-cols-2 gap-2">
          {typeField}
          {qtyField}
        </div>
      ) : (
        <>
          {typeField}
          {qtyField}
        </>
      )}
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
            placeholder={lastPrice != null ? String(lastPrice) : undefined}
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

function SideBtn({
  active,
  tone,
  label,
  onClick,
}: {
  active: boolean;
  tone: "buy" | "sell";
  label: string;
  onClick: () => void;
}) {
  const color = tone === "buy" ? "var(--up)" : "var(--down)";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex h-9 items-center justify-center text-[13px] font-semibold transition-opacity hover:opacity-90"
      style={
        active
          ? { backgroundColor: color, color: "#fff" }
          : {
              backgroundColor: `color-mix(in srgb, ${color} 12%, var(--aw-canvas, #fff))`,
              color,
            }
      }
    >
      {label}
    </button>
  );
}
