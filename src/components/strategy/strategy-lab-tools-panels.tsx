"use client";

import { SubmitButton } from "@/components/ui/submit-button";
import type { LabTunable } from "@/hooks/query/use-strategy-lab";

type StrategyOpt = { id: string; name: string };

export function LabChip({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded border px-2.5 py-1.5 text-[12px] transition ${
        active
          ? "border-[var(--brand)] bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
          : "border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--border))] hover:text-[var(--foreground)]"
      } disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

export function LabComparePanel({
  strategyName,
  thisLabel,
  leftLabel,
  rightLabel,
  pickLabel,
  emptyLabel,
  hint,
  runLabel,
  loadingLabel,
  otherId,
  otherName,
  strategies,
  busy,
  onPick,
  onRun,
}: {
  strategyName: string;
  thisLabel: string;
  leftLabel: string;
  rightLabel: string;
  pickLabel: string;
  emptyLabel: string;
  hint: string;
  runLabel: string;
  loadingLabel: string;
  otherId: string;
  otherName: string;
  strategies: StrategyOpt[];
  busy: boolean;
  onPick: (id: string) => void;
  onRun: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
          <p className="text-[12px] text-[var(--muted)]">{leftLabel}</p>
          <p className="mt-1 truncate text-[14px] font-medium text-[var(--foreground)]">
            {strategyName || thisLabel}
          </p>
        </div>
        <div className="flex items-center justify-center px-1 text-[12px] text-[var(--muted)]">
          vs
        </div>
        <div className="rounded-md border border-[var(--border)] px-3 py-2.5">
          <p className="text-[12px] text-[var(--muted)]">{rightLabel}</p>
          <p className="mt-1 truncate text-[14px] font-medium text-[var(--foreground)]">
            {otherName}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[13px] text-[var(--muted)]">{pickLabel}</p>
        {strategies.length ? (
          <ul className="max-h-48 divide-y divide-[var(--border)] overflow-y-auto rounded-md border border-[var(--border)] qt-scroll">
            {strategies.map((s) => {
              const on = otherId === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onPick(s.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] transition disabled:opacity-50 ${
                      on
                        ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                        : "text-[var(--foreground)] hover:bg-[var(--surface-2)]/50"
                    }`}
                  >
                    <span
                      className={`inline-block size-2 shrink-0 rounded-full ${
                        on ? "bg-[var(--brand)]" : "bg-[var(--border)]"
                      }`}
                    />
                    <span className="min-w-0 truncate">{s.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[12px] text-[var(--muted)]">{emptyLabel}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] leading-relaxed text-[var(--muted)]">{hint}</p>
        <SubmitButton
          type="button"
          loading={busy}
          loadingLabel={loadingLabel}
          disabled={!otherId}
          onClick={onRun}
          className="qt-btn qt-btn-primary h-9 shrink-0 px-3 text-[13px]"
        >
          {runLabel}
        </SubmitButton>
      </div>
    </div>
  );
}

export function LabGridPanel({
  params,
  paramId,
  selectedValues,
  customValue,
  pickParamLabel,
  valuesLabel,
  hint,
  runLabel,
  loadingLabel,
  busy,
  onPickParam,
  onToggleValue,
  onCustomChange,
  onCustomCommit,
  onRun,
}: {
  params: LabTunable[];
  paramId: string;
  selectedValues: number[];
  customValue: string;
  pickParamLabel: string;
  valuesLabel: string;
  hint: string;
  runLabel: string;
  loadingLabel: string;
  busy: boolean;
  onPickParam: (id: string, presets: number[]) => void;
  onToggleValue: (n: number) => void;
  onCustomChange: (v: string) => void;
  onCustomCommit: () => void;
  onRun: () => void;
}) {
  const active = params.find((p) => p.id === paramId) ?? params[0];
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[13px] text-[var(--muted)]">{pickParamLabel}</p>
        <div className="flex flex-wrap gap-1.5">
          {params.length ? (
            params.map((p) => (
              <LabChip
                key={p.id}
                active={paramId === p.id}
                onClick={() => onPickParam(p.id, p.presets.slice(0, 3))}
                disabled={busy}
              >
                {p.label}
              </LabChip>
            ))
          ) : (
            <p className="text-[12px] text-[var(--muted)]">{pickParamLabel}</p>
          )}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[13px] text-[var(--muted)]">{valuesLabel}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(active?.presets ?? []).map((n) => (
            <LabChip
              key={n}
              active={selectedValues.includes(n)}
              onClick={() => onToggleValue(n)}
              disabled={busy}
            >
              {n}
            </LabChip>
          ))}
          <input
            className="qt-input h-7 w-20 px-2 text-[11px] tabular-nums"
            value={customValue}
            placeholder="+"
            disabled={busy}
            onChange={(e) => onCustomChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCustomCommit();
              }
            }}
          />
        </div>
        <p className="mt-1.5 text-[12px] text-[var(--muted)]">{hint}</p>
      </div>
      <div className="flex justify-end">
        <SubmitButton
          type="button"
          loading={busy}
          loadingLabel={loadingLabel}
          disabled={selectedValues.length < 2}
          onClick={onRun}
          className="qt-btn qt-btn-primary h-9 px-3 text-[13px]"
        >
          {runLabel}
        </SubmitButton>
      </div>
    </div>
  );
}

export function LabBasketPanel({
  symbols,
  draft,
  symbolsLabel,
  addPlaceholder,
  hint,
  runLabel,
  loadingLabel,
  busy,
  onRemove,
  onDraftChange,
  onAdd,
  onRun,
}: {
  symbols: string[];
  draft: string;
  symbolsLabel: string;
  addPlaceholder: string;
  hint: string;
  runLabel: string;
  loadingLabel: string;
  busy: boolean;
  onRemove: (s: string) => void;
  onDraftChange: (v: string) => void;
  onAdd: () => void;
  onRun: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[13px] text-[var(--muted)]">{symbolsLabel}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {symbols.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--surface-2)]/40 px-2.5 py-1 text-[12px] tabular-nums"
            >
              {s}
              <button
                type="button"
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
                disabled={busy}
                onClick={() => onRemove(s)}
                aria-label={`remove ${s}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="qt-input h-7 w-24 px-2 text-[11px] uppercase"
            value={draft}
            placeholder={addPlaceholder}
            disabled={busy || symbols.length >= 10}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd();
              }
            }}
          />
          <LabChip onClick={onAdd} disabled={busy}>
            +
          </LabChip>
        </div>
        <p className="mt-1.5 text-[12px] text-[var(--muted)]">{hint}</p>
      </div>
      <div className="flex justify-end">
        <SubmitButton
          type="button"
          loading={busy}
          loadingLabel={loadingLabel}
          disabled={symbols.length < 2}
          onClick={onRun}
          className="qt-btn qt-btn-primary h-9 px-3 text-[13px]"
        >
          {runLabel}
        </SubmitButton>
      </div>
    </div>
  );
}
