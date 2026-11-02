"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { QtDatePicker } from "@/components/ui/qt-date-picker";
import { calcOption } from "../option-calculator";
import type { CalcModel } from "../option-calculator";
import {
  DEFAULT_RATE_PCT,
  FIELD_CLS,
  daysBetween,
  fmtNum,
  ymdToday,
} from "./drawer-ui";

/**
 * Collapsible option calculator: theoretical price, distance to spot, greeks
 * and the model / valuation-date / spot / IV / rate inputs.
 *
 * Valuation state lives here — the parent only supplies the target contract,
 * so changing the quote selection resets the inputs without touching the
 * P&L tool.
 */
export function OptionCalculatorCard({
  spot,
  strike,
  isCall,
  expiry,
  latestIv,
  t,
}: {
  spot: number;
  strike: number;
  isCall: boolean;
  expiry: string;
  latestIv: number | null;
  t: (k: string) => string;
}) {
  const [model, setModel] = useState<CalcModel>("american");
  const [valDate, setValDate] = useState(ymdToday());
  const [spotInput, setSpotInput] = useState(String(spot || ""));
  const [iv, setIv] = useState("");
  const [rate, setRate] = useState(String(DEFAULT_RATE_PCT));

  // Defaults follow the market whenever the target contract changes.
  useEffect(() => {
    setSpotInput(spot > 0 ? String(spot) : "");
    setIv(latestIv != null ? String(Number(latestIv.toFixed(2))) : "");
    setValDate(ymdToday());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strike, isCall, expiry]);

  /*
   * The American model prices 9 binomial trees per quote (~15ms on a laptop,
   * much more on a phone). Feed the inputs through `useDeferredValue` so
   * dragging the date slider or typing stays responsive and the numbers catch
   * up on the next idle pass instead of blocking every input event.
   */
  const snapshot = useMemo(
    () => ({
      s: Number(spotInput),
      v: Number(iv),
      r: Number(rate),
      valDate,
      model,
    }),
    [spotInput, iv, rate, valDate, model],
  );
  const deferred = useDeferredValue(snapshot);

  const res = useMemo(() => {
    const { s, v, r } = deferred;
    if (!(s > 0) || !(v > 0)) return null;
    return calcOption({
      spot: s,
      strike,
      ivPct: v,
      // DTE measured from the valuation date to expiry (can be 0).
      days: Math.max(0, daysBetween(deferred.valDate, expiry)),
      ratePct: Number.isFinite(r) ? r : DEFAULT_RATE_PCT,
      isCall,
      model: deferred.model,
    });
  }, [deferred, expiry, strike, isCall]);

  const todayYmd = ymdToday();
  const maxDate = expiry || todayYmd;
  const sliderDays = Math.max(daysBetween(todayYmd, maxDate), 1);
  const sliderVal = Math.min(Math.max(daysBetween(todayYmd, valDate), 0), sliderDays);

  const greeks = res
    ? [
        { k: "delta", v: res.delta },
        { k: "gamma", v: res.gamma },
        { k: "vega", v: res.vega },
        { k: "theta", v: res.theta },
        { k: "rho", v: res.rho },
      ]
    : [];

  const pctField = (
    value: string,
    onChange: (v: string) => void,
    step: string,
    aria: string,
  ) => (
    <div className="relative flex-1">
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_CLS} w-full pr-7 tabular-nums`}
        aria-label={aria}
      />
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[11px] text-[var(--muted)]">
        %
      </span>
    </div>
  );

  const quick = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 text-[11px] text-[var(--brand)] transition hover:underline"
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-2.5">
          {/* theory results */}
          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-[var(--muted)]">
                {t("theoPrice")}
              </span>
              <span className="text-[14px] font-semibold tabular-nums">
                {fmtNum(res?.theo ?? null, 3)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-[var(--muted)]">
                {t("distCurrent")}
              </span>
              <span
                className={`text-[14px] font-semibold tabular-nums ${
                  (res?.dist ?? 0) >= 0 ? "text-[var(--up)]" : "text-[var(--down)]"
                }`}
              >
                {fmtNum(res?.dist ?? null, 3)}
              </span>
            </div>
          </div>
          {/* greeks */}
          <div className="grid grid-cols-5 gap-1 text-center">
            {greeks.map((g) => (
              <div key={g.k}>
                <div className="text-[10px] tracking-wide text-[var(--muted)]">
                  {g.k}
                </div>
                <div className="truncate text-[12px] font-medium tabular-nums">
                  {fmtNum(g.v)}
                </div>
              </div>
            ))}
          </div>
          {/* model toggle — sharp corners for App shell */}
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] text-[var(--muted)]">
              {t("model")}
            </span>
            <div className="flex flex-1 overflow-hidden border border-[var(--aw-hairline,var(--border))] bg-[var(--input)]">
              {(["american", "european"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`flex-1 py-1 text-[12px] transition-colors ${
                    model === m
                      ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                      : "bg-[var(--input)] text-[var(--muted)]"
                  }`}
                >
                  {t(m)}
                </button>
              ))}
            </div>
          </div>
          {/* valuation date + slider */}
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] text-[var(--muted)]">
              {t("valDate")}
            </span>
            <QtDatePicker
              value={valDate}
              min={todayYmd}
              max={maxDate}
              onChange={setValDate}
              ariaLabel={t("valDate")}
              className="flex-1"
            />
          </div>
          <input
            type="range"
            min={0}
            max={sliderDays}
            value={sliderVal}
            onChange={(e) => {
              const d = new Date();
              d.setDate(d.getDate() + Number(e.target.value));
              setValDate(
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
              );
            }}
            className="w-full accent-[var(--brand)]"
            aria-label={t("valDate")}
          />
          {/* spot */}
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] text-[var(--muted)]">
              {t("spotPrice")}
            </span>
            <input
              type="number"
              step="0.001"
              value={spotInput}
              onChange={(e) => setSpotInput(e.target.value)}
              className={`${FIELD_CLS} flex-1 tabular-nums`}
            />
            {quick(t("latestPrice"), () =>
              setSpotInput(spot > 0 ? String(spot) : ""),
            )}
          </div>
          {/* IV */}
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] text-[var(--muted)]">
              {t("ivLabel")}
            </span>
            {pctField(iv, setIv, "0.01", t("ivLabel"))}
            {quick(t("latestValue"), () =>
              setIv(latestIv != null ? String(Number(latestIv.toFixed(2))) : ""),
            )}
          </div>
          {/* risk-free rate */}
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[11px] text-[var(--muted)]">
              {t("rateLabel")}
            </span>
            {pctField(rate, setRate, "0.0001", t("rateLabel"))}
            {quick(t("defaultVal"), () => setRate(String(DEFAULT_RATE_PCT)))}
          </div>
    </div>
  );
}
