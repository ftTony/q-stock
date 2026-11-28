/**
 * Order-confirm summary for the confirm dialog (Web + H5). Renders the side +
 * instrument lockup, one prominent money figure, then fixed-height label/value
 * rows separated by hairlines — no boxes, no tinted panels.
 */

export type OrderDetailRow = {
  label: string;
  value: string;
  /** Hero rows are pulled out of the detail list and rendered prominently. */
  kind?: "symbol" | "side" | "amount";
};

export function OrderConfirmDetails({
  rows,
  side = "buy",
}: {
  rows: OrderDetailRow[];
  side?: "buy" | "sell";
}) {
  const symbolRow = rows.find((r) => r.kind === "symbol");
  const sideRow = rows.find((r) => r.kind === "side");
  const amountRow = rows.find((r) => r.kind === "amount");
  const metaRows = rows.filter(
    (r) => r.kind !== "symbol" && r.kind !== "side" && r.kind !== "amount",
  );

  // CN convention: rising = red (buy), falling = green (sell).
  const isBuy = side === "buy";
  const accent = isBuy ? "var(--up)" : "var(--down)";

  // "NVIDIA · NVDA" → name + code for the instrument lockup.
  const symbolText = symbolRow?.value ?? "";
  const sep = symbolText.indexOf(" · ");
  const name = sep >= 0 ? symbolText.slice(0, sep) : symbolText;
  const code = sep >= 0 ? symbolText.slice(sep + 3) : "";

  return (
    <div>
      {/* Instrument lockup — side, name and code share one baseline so the
          row reads as a single clean line (no hanging code underneath). */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {sideRow ? (
          <span
            className="shrink-0 text-[14px] font-semibold leading-tight"
            style={{ color: accent }}
          >
            {sideRow.value}
          </span>
        ) : null}
        <span className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--foreground)]">
          {name}
        </span>
        {code ? (
          <span className="text-[12px] tabular-nums text-[var(--muted)]">
            {code}
          </span>
        ) : null}
      </div>

      {/* Estimated total — the visual focus, with breathing room above. */}
      {amountRow ? (
        <div className="mt-5">
          <div className="text-[11px] text-[var(--muted)]">
            {amountRow.label}
          </div>
          <div className="mt-1 text-[26px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-[var(--foreground)]">
            {amountRow.value}
          </div>
        </div>
      ) : null}

      {/* Fixed-height label/value rows separated by hairlines. */}
      {metaRows.length > 0 ? (
        <dl className="mt-3 divide-y divide-[var(--aw-hairline,var(--border))]">
          {metaRows.map((r) => (
            <div
              key={r.label}
              className="flex h-10 items-center justify-between gap-4"
            >
              <dt className="shrink-0 text-[13px] text-[var(--muted)]">
                {r.label}
              </dt>
              <dd className="min-w-0 truncate text-right text-[13px] font-medium tabular-nums text-[var(--foreground)]">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
