"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatToolNumber } from "@/lib/tools/catalog";
import {
  OPTIONS_EXAMPLE,
  calcOptionsPayoff,
  type OptionsPayoffInput,
  type OptionsStrategy,
} from "@/lib/tools/options-payoff";

function num(v: string, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function OptionsCalculator() {
  const t = useTranslations("tools");
  const [form, setForm] = useState<OptionsPayoffInput>(OPTIONS_EXAMPLE);
  const result = useMemo(() => calcOptionsPayoff(form), [form]);

  function set<K extends keyof OptionsPayoffInput>(
    key: K,
    value: OptionsPayoffInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label={t("options.strategy")}>
          <select
            className="qt-input h-10 w-full px-3"
            value={form.strategy}
            onChange={(e) => set("strategy", e.target.value as OptionsStrategy)}
          >
            <option value="long_call">{t("options.longCall")}</option>
            <option value="long_put">{t("options.longPut")}</option>
          </select>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("options.spot")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.spot}
              onChange={(e) => set("spot", num(e.target.value))}
            />
          </Field>
          <Field label={t("options.strike")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.strike}
              onChange={(e) => set("strike", num(e.target.value))}
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("options.premium")}>
            <input
              type="number"
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.premium}
              onChange={(e) => set("premium", num(e.target.value))}
            />
          </Field>
          <Field label={t("options.multiplier")}>
            <input
              type="number"
              min={1}
              className="qt-input h-10 w-full px-3 tabular-nums"
              value={form.multiplier}
              onChange={(e) => set("multiplier", num(e.target.value, 1))}
            />
          </Field>
        </div>
        <p className="text-xs text-[var(--muted)]">
          {t("options.note")}{" "}
          <Link
            href="/tools/position"
            className="text-[var(--brand-text)] hover:underline"
          >
            {t("options.linkPosition")}
          </Link>
        </p>
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() => setForm(OPTIONS_EXAMPLE)}
          >
            {t("fillExample")}
          </button>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 px-3.5 text-sm"
            onClick={() =>
              setForm({
                strategy: "long_call",
                spot: 0,
                strike: 0,
                premium: 0,
                multiplier: 100,
              })
            }
          >
            {t("reset")}
          </button>
        </div>
      </form>

      <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6">
        {result.ok ? (
          <>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Stat
                label={t("options.breakeven")}
                value={formatToolNumber(result.breakeven)}
              />
              <Stat
                label={t("options.maxLoss")}
                value={formatToolNumber(result.maxLoss)}
              />
            </dl>
            <p className="text-xs text-[var(--muted)]">
              {form.strategy === "long_call" ? t("options.hintCall") : t("options.hintPut")}
            </p>
            <PayoffChart
              points={result.points}
              spot={form.spot}
              breakeven={result.breakeven}
            />
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">{t("options.errors.invalid")}</p>
        )}
      </div>
    </div>
  );
}

function PayoffChart({
  points,
  spot,
  breakeven,
}: {
  points: { underlying: number; pnlContract: number }[];
  spot: number;
  breakeven: number;
}) {
  const width = 320;
  const height = 140;
  const pad = 8;
  const xs = points.map((p) => p.underlying);
  const ys = points.map((p) => p.pnlContract);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  const sx = (x: number) =>
    pad + ((x - minX) / (maxX - minX || 1)) * (width - pad * 2);
  const sy = (y: number) =>
    height - pad - ((y - minY) / (maxY - minY || 1)) * (height - pad * 2);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.underlying)},${sy(p.pnlContract)}`)
    .join(" ");
  const zeroY = sy(0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-36 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)]"
      role="img"
      aria-hidden
    >
      <line
        x1={pad}
        x2={width - pad}
        y1={zeroY}
        y2={zeroY}
        stroke="var(--border)"
        strokeWidth="1"
      />
      <path d={d} fill="none" stroke="var(--brand)" strokeWidth="2" />
      <line
        x1={sx(spot)}
        x2={sx(spot)}
        y1={pad}
        y2={height - pad}
        stroke="var(--muted)"
        strokeDasharray="3 3"
        strokeWidth="1"
      />
      <line
        x1={sx(breakeven)}
        x2={sx(breakeven)}
        y1={pad}
        y2={height - pad}
        stroke="var(--brand-text)"
        strokeDasharray="2 2"
        strokeWidth="1"
      />
    </svg>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] px-3 py-2.5">
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
    </div>
  );
}
