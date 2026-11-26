"use client";

import { useMemo, useState } from "react";
import type { QtyMode } from "@/components/trading/trade-ticket-qty";
import {
  bracketFromPct,
  resolveShares,
} from "@/components/trading/trade-ticket-math";

/** Qty mode / bracket helpers for the broker-style dock ticket. */
export function useTradeTicketQty(opts: {
  estimatePrice: number;
  equity: number;
  side: "buy" | "sell";
  stack: boolean;
  qty: string;
}) {
  const [qtyMode, setQtyMode] = useState<QtyMode>("shares");
  const [qtyInput, setQtyInput] = useState("1");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [confirmBefore, setConfirmBefore] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);

  const shares = useMemo(
    () =>
      resolveShares({
        mode: qtyMode,
        input: qtyInput,
        price: opts.estimatePrice,
        equity: opts.equity,
        stopLoss,
      }),
    [qtyMode, qtyInput, opts.estimatePrice, opts.equity, stopLoss],
  );

  const qtyNum = opts.stack ? Number(opts.qty) || 0 : shares;
  const estimate =
    qtyNum > 0 && opts.estimatePrice > 0 ? qtyNum * opts.estimatePrice : 0;
  const maxSharesByMargin =
    opts.estimatePrice > 0 ? Math.floor(opts.equity / opts.estimatePrice) : 0;
  const equityPct = opts.equity > 0 ? (estimate / opts.equity) * 100 : 0;

  return {
    qtyMode,
    setQtyMode,
    qtyInput,
    setQtyInput,
    stopLoss,
    setStopLoss,
    takeProfit,
    setTakeProfit,
    confirmBefore,
    setConfirmBefore,
    emergencyStop,
    setEmergencyStop,
    shares,
    qtyNum,
    estimate,
    maxSharesByMargin,
    equityPct,
    applyStopPct: (pct: number) =>
      setStopLoss(bracketFromPct(opts.estimatePrice, pct, opts.side, "stop")),
    applyTakePct: (pct: number) =>
      setTakeProfit(bracketFromPct(opts.estimatePrice, pct, opts.side, "take")),
  };
}
