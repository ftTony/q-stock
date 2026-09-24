export function KpiCard({
  label,
  value,
  hint,
  hintClass,
  valueClass,
  hintDot,
}: {
  label: string;
  value: string;
  hint?: string;
  hintClass?: string;
  valueClass?: string;
  hintDot?: boolean;
}) {
  return (
    <div className="qt-card p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>{label}</span>
        {hintDot && (
          <span className="h-2 w-2 rounded-full bg-[var(--down)] shadow-[0_0_8px_var(--down)]" />
        )}
      </div>
      <div className={`text-xl font-semibold tracking-tight sm:text-2xl ${valueClass || ""}`}>
        {value}
      </div>
      {hint && (
        <div className={`mt-1 text-xs ${hintClass || "text-[var(--muted)]"}`}>{hint}</div>
      )}
    </div>
  );
}
