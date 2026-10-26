"use client";

import type { ReactNode } from "react";

type Tone = "start" | "entry" | "exit" | "sizing";

const toneBar: Record<Tone, string> = {
  start: "bg-[var(--up)]",
  entry: "bg-[color-mix(in_srgb,#ea580c_85%,var(--brand))]",
  exit: "bg-[var(--down)]",
  sizing: "bg-[var(--brand)]",
};

export function StrategyRulesBlockCard({
  tone,
  title,
  children,
  disabled,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
  trailing,
}: {
  tone: Tone;
  title: string;
  children: ReactNode;
  disabled?: boolean;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div
      className="group relative w-[240px] shrink-0 rounded-md border border-[var(--border)] bg-[var(--panel)] shadow-sm transition hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--border))] hover:shadow-md sm:w-[260px]"
      draggable={Boolean(draggable && !disabled)}
      onDragStart={(e) => {
        if (disabled || !draggable) return;
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.();
      }}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 rounded-l-md ${toneBar[tone]}`}
      />
      <button
        type="button"
        disabled={disabled || !onClick}
        onClick={onClick}
        className="block w-full px-3 py-2.5 pl-3.5 text-left disabled:cursor-default"
      >
        <div className="flex items-start gap-1.5">
          {draggable && !disabled ? (
            <span
              className="mt-0.5 cursor-grab select-none text-[11px] leading-none text-[var(--muted)] active:cursor-grabbing"
              aria-hidden
            >
              ⋮⋮
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold tracking-tight text-[var(--foreground)]">
              {title}
            </p>
            <div className="mt-1.5 text-[12px] leading-relaxed text-[var(--muted)]">
              {children}
            </div>
          </div>
        </div>
      </button>
      {trailing ? (
        <div className="absolute right-1.5 top-1.5 opacity-0 transition group-hover:opacity-100">
          {trailing}
        </div>
      ) : null}
      {/* Ports */}
      <span className="pointer-events-none absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--panel)]" />
      <span className="pointer-events-none absolute right-0 top-1/2 h-2 w-2 translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--panel)]" />
    </div>
  );
}

export function BlockAccentText({
  parts,
}: {
  parts: Array<{ text: string; accent?: boolean }>;
}) {
  return (
    <p className="text-[12px] leading-relaxed">
      {parts.map((p, i) =>
        p.accent ? (
          <span
            key={`${i}-${p.text}`}
            className="mx-0.5 font-medium text-[var(--brand-text)] underline decoration-[color-mix(in_srgb,var(--brand)_35%,transparent)] underline-offset-2"
          >
            {p.text}
          </span>
        ) : (
          <span key={`${i}-${p.text}`} className="text-[var(--muted)]">
            {p.text}
          </span>
        ),
      )}
    </p>
  );
}

export function BlockFlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex w-8 shrink-0 flex-col items-center justify-center self-center">
      <div className="h-px w-full bg-[var(--border)]" />
      <span className="mt-0.5 text-[9px] text-[var(--muted)]">
        {label ?? "→"}
      </span>
    </div>
  );
}
