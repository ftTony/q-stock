"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";
import type { PaperOrder } from "@/components/portfolio/types";

function money(n: number) {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const td = "py-2 pr-3 text-[12px] tabular-nums text-[var(--foreground)]";
const tdSide = "py-2 pr-3 text-[12px] font-medium tabular-nums";
const inputCls =
  "qt-input h-7 w-[5.25rem] max-w-full shrink-0 px-1.5 text-[12px] tabular-nums";

type AmendDraft = {
  qty: string;
  price: string;
};

export function TradeDeskPendingRow({
  order,
  busy,
  onCancel,
  onModify,
}: {
  order: PaperOrder;
  busy?: boolean;
  onCancel?: (id: string) => void;
  onModify?: (patch: {
    id: string;
    qty: number;
    limitPrice?: number | null;
    stopPrice?: number | null;
  }) => Promise<void>;
}) {
  const t = useTranslations("trading");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AmendDraft>({ qty: "", price: "" });
  const [err, setErr] = useState<string | null>(null);

  const pxLabel =
    order.limitPrice != null
      ? `$${money(order.limitPrice)}`
      : order.stopPrice != null
        ? `stop $${money(order.stopPrice)}`
        : "—";

  const canAmendPrice = order.type === "limit" || order.type === "stop";

  function startEdit() {
    setErr(null);
    setDraft({
      qty: String(order.qty),
      price: String(
        order.type === "limit"
          ? order.limitPrice ?? ""
          : order.type === "stop"
            ? order.stopPrice ?? ""
            : "",
      ),
    });
    setEditing(true);
  }

  async function save() {
    if (!onModify) return;
    const qty = Number(draft.qty);
    if (!(qty > 0)) {
      setErr(t("errInvalidQty"));
      return;
    }
    const body: {
      id: string;
      qty: number;
      limitPrice?: number | null;
      stopPrice?: number | null;
    } = { id: order.id, qty };
    if (order.type === "limit") {
      const limitPrice = Number(draft.price);
      if (!(limitPrice > 0)) {
        setErr(t("errInvalidLimit"));
        return;
      }
      body.limitPrice = limitPrice;
    }
    if (order.type === "stop") {
      const stopPrice = Number(draft.price);
      if (!(stopPrice > 0)) {
        setErr(t("errInvalidStop"));
        return;
      }
      body.stopPrice = stopPrice;
    }
    try {
      setErr(null);
      await onModify(body);
      setEditing(false);
    } catch {
      setErr(t("deskModifyFailed"));
    }
  }

  return (
    <>
      <tr className="border-b border-[var(--aw-hairline,var(--border))] last:border-0">
        <td className={`${td} font-medium`}>
          <Link
            href={`/symbol/${order.assetType}/${order.symbol}`}
            className="hover:text-[var(--aw-primary,var(--brand-text))]"
          >
            {order.symbol}
          </Link>
        </td>
        <td
          className={`${tdSide} ${
            order.side === "buy" ? "!text-[var(--up)]" : "!text-[var(--down)]"
          }`}
        >
          {t(order.side)}
        </td>
        <td className={td}>{t(order.type)}</td>
        <td className={td}>
          {editing ? (
            <input
              type="number"
              min="0"
              step="any"
              value={draft.qty}
              onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
              className={inputCls}
              disabled={busy}
            />
          ) : (
            order.qty
          )}
        </td>
        <td className={td}>
          {editing && canAmendPrice ? (
            <input
              type="number"
              min="0"
              step="any"
              value={draft.price}
              onChange={(e) =>
                setDraft((d) => ({ ...d, price: e.target.value }))
              }
              className={inputCls}
              disabled={busy}
            />
          ) : (
            pxLabel
          )}
        </td>
        <td className={td}>{t("status_pending")}</td>
        <td className={`${td} pr-0 text-right`}>
          <div className="inline-flex items-center gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void save()}
                  className="text-[12px] font-medium text-[var(--aw-primary,var(--brand-text))] hover:underline disabled:opacity-50"
                >
                  {t("deskModifySave")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditing(false);
                    setErr(null);
                  }}
                  className="text-[12px] text-[var(--muted)] hover:underline disabled:opacity-50"
                >
                  {t("deskModifyDiscard")}
                </button>
              </>
            ) : (
              <>
                {onModify ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={startEdit}
                    className="text-[12px] text-[var(--aw-primary,var(--brand-text))] hover:underline disabled:opacity-50"
                  >
                    {t("deskModify")}
                  </button>
                ) : null}
                {onCancel ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onCancel(order.id)}
                    className="text-[12px] text-[var(--muted)] hover:text-[var(--down)] hover:underline disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </td>
      </tr>
      {err ? (
        <tr>
          <td
            colSpan={7}
            className="pb-2 text-[11px] text-[var(--down)]"
          >
            {err}
          </td>
        </tr>
      ) : null}
    </>
  );
}
