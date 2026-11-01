"use client";

import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/format-number";
import {
  ANCHOR_ROW_H,
  SCROLL_PANE,
  SIDE_COL_COUNT,
  SideGroup,
  SideHeader,
  SpotAnchor,
  SpotLine,
  sideCells,
} from "./option-chain-table";
import type { Greeks, StrikeRow } from "./option-chain-utils";

type PaneKey = "call" | "put" | "strike";

/**
 * T-quote body: one horizontally-scrollable pane per side plus a fixed strike
 * column in the middle. Horizontal scrolling is mirrored between the call and
 * put panes (their column orders are mirrored around the strike column) and
 * each side keeps its own horizontal scrollbar. Vertical scrolling is driven by
 * a single scrollbar on the outer edge (the slim proxy rail on the right); the
 * panes only follow it.
 */
export const OptionChainPanes = memo(function OptionChainPanes({
  rows,
  spotN,
  spotAfterIdx,
  greeksBySide,
  showCall,
  showPut,
  symbol,
  seed,
  onPickSeed,
  t,
}: {
  rows: StrikeRow[];
  spotN: number | null;
  spotAfterIdx: number;
  greeksBySide: {
    call: Map<number, Greeks>;
    put: Map<number, Greeks>;
  };
  showCall: boolean;
  showPut: boolean;
  symbol?: string;
  /** Chain row picked for the strategy tool (highlighted + sent to drawer). */
  seed?: { kind: "call" | "put"; strike: number } | null;
  onPickSeed?: (s: { kind: "call" | "put"; strike: number }) => void;
  t: (k: string) => string;
}) {
  const callRef = useRef<HTMLDivElement>(null);
  const putRef = useRef<HTMLDivElement>(null);
  const strikeRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  /** Content height of one pane, mirrored onto the outer vertical rail. */
  const [contentH, setContentH] = useState(0);
  /**
   * Vertical range the side panes lose to their horizontal scrollbar (8px for
   * classic scrollbars, 0 for overlay ones). The strike column's footer spacer
   * and the rail's extra padding must mirror it exactly — a hardcoded 8px
   * desyncs the columns by 8px whenever the browser uses overlay scrollbars.
   */
  const [reserve, setReserve] = useState(8);

  const onPaneScroll =
    (src: PaneKey) => (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const panes: { key: PaneKey; ref: React.RefObject<HTMLDivElement | null> }[] =
        [
          { key: "call", ref: callRef },
          { key: "put", ref: putRef },
          { key: "strike", ref: strikeRef },
        ];
      for (const p of panes) {
        const target = p.ref.current;
        if (!target || target === el) continue;
        if (target.scrollTop !== el.scrollTop) target.scrollTop = el.scrollTop;
        const bothHorizontal = src !== "strike" && p.key !== "strike";
        if (!bothHorizontal) continue;
        /*
         * The two sides are mirrored around the strike column: the call table
         * ends at its strike-adjacent column (rest = fully scrolled right),
         * the put table starts with it (rest = scrollLeft 0). Copying
         * scrollLeft verbatim would move them in opposite directions, so map
         * the position proportionally with the origin flipped.
         */
        const srcMax = el.scrollWidth - el.clientWidth;
        const tgtMax = target.scrollWidth - target.clientWidth;
        if (srcMax <= 0 || tgtMax <= 0) continue;
        const ratio = Math.min(1, Math.max(0, el.scrollLeft / srcMax));
        const want = tgtMax * (1 - ratio);
        if (Math.abs(target.scrollLeft - want) > 0.5) {
          target.scrollLeft = want;
        }
      }
      const rail = railRef.current;
      if (rail && Math.abs(rail.scrollTop - el.scrollTop) > 0.5) {
        rail.scrollTop = el.scrollTop;
      }
    };

  /** The outer rail is the only visible vertical scrollbar: drive panes from it. */
  const onRailScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    for (const ref of [callRef, putRef, strikeRef]) {
      const el = ref.current;
      if (el && Math.abs(el.scrollTop - top) > 0.5) el.scrollTop = top;
    }
  };

  /*
   * Side panes use overflow-y:hidden (no vertical scrollbar can ever render),
   * so forward wheel deltas to the rail, which drives every pane. Needs a
   * native non-passive listener — React's synthetic onWheel is passive.
   */
  useEffect(() => {
    const rail = railRef.current;
    const panes = [callRef.current, putRef.current, strikeRef.current];
    const onWheel = (e: WheelEvent) => {
      // Let horizontal trackpad pans / shift+wheel scroll natively.
      if (!rail || !e.deltaY || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      rail.scrollTop += e.deltaY;
    };
    for (const el of panes) {
      el?.addEventListener("wheel", onWheel, { passive: false });
    }
    return () => {
      for (const el of panes) {
        el?.removeEventListener("wheel", onWheel);
      }
    };
  }, [showCall, showPut]);

  /*
   * Rest position = both sides scrolled flush against the strike column so the
   * strike-adjacent columns (bid / ask) are visible first.
   */
  useLayoutEffect(() => {
    const align = () => {
      const c = callRef.current;
      if (c) c.scrollLeft = c.scrollWidth - c.clientWidth;
      const p = putRef.current;
      if (p) p.scrollLeft = 0;
      // Side panes carry the real row stack (the strike pane adds its own
      // scrollbar-compensation footer, so prefer the side panes when measuring).
      const measured =
        c?.scrollHeight || p?.scrollHeight || strikeRef.current?.scrollHeight;
      if (measured && measured > 0) setContentH(measured);
      const side = c ?? p;
      const s = strikeRef.current;
      if (side && s) {
        const r = Math.max(0, s.clientHeight - side.clientHeight);
        setReserve((prev) => (prev === r ? prev : r));
      }
    };
    align();
    const raf = requestAnimationFrame(align);
    return () => cancelAnimationFrame(raf);
  }, [rows.length, showCall, showPut]);

  const itmBg = "bg-[color-mix(in_srgb,var(--muted)_8%,transparent)]";
  const showTopAnchor = spotAfterIdx < 0 && spotN != null;

  return (
    <>
      {showCall ? (
        <div
          ref={callRef}
          onScroll={onPaneScroll("call")}
          className={`min-w-0 flex-1 ${SCROLL_PANE}`}
        >
          <table className="w-full border-collapse text-[12px] whitespace-nowrap">
            <thead className="sticky top-0 z-[1] bg-[var(--panel)]">
              <tr className="border-b border-[var(--aw-hairline,var(--border))]">
                <SideHeader t={t} isCall />
              </tr>
            </thead>
            <tbody>
              {showTopAnchor ? (
                <tr className={ANCHOR_ROW_H}>
                  <td colSpan={SIDE_COL_COUNT} className="p-0">
                    <SpotLine />
                  </td>
                </tr>
              ) : null}
              {rows.map((r, i) => (
                <Fragment key={r.strike}>
                  <tr
                    onClick={() => onPickSeed?.({ kind: "call", strike: r.strike })}
                    className={`h-9 cursor-pointer border-t border-[var(--aw-hairline,var(--border))] transition-colors hover:bg-[color-mix(in_srgb,var(--muted)_6%,transparent)] ${
                      seed?.kind === "call" && seed.strike === r.strike
                        ? "bg-[var(--brand-soft)]"
                        : ""
                    }`}
                  >
                    <SideGroup
                      d={sideCells(r.call, greeksBySide.call.get(r.strike))}
                      bg={spotN != null && r.strike < spotN ? itmBg : ""}
                      isCall
                    />
                  </tr>
                  {spotAfterIdx === i && spotN != null ? (
                    <tr className={ANCHOR_ROW_H}>
                      <td colSpan={SIDE_COL_COUNT} className="p-0">
                        <SpotLine />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div
        ref={strikeRef}
        onScroll={onPaneScroll("strike")}
        className="oc-strike-pane shrink-0"
      >
        <table className="border-collapse text-[12px] whitespace-nowrap">
          <thead className="sticky top-0 z-[2] bg-[var(--panel)]">
            <tr className="border-b border-[var(--aw-hairline,var(--border))]">
              <th className="min-w-[5rem] px-2 py-2 text-center text-[12px] font-semibold whitespace-nowrap text-[var(--foreground)]">
                {t("optCol.strike")}
              </th>
            </tr>
          </thead>
          <tbody>
            {showTopAnchor ? (
              <tr className={ANCHOR_ROW_H}>
                <td className="p-0">
                  <SpotAnchor price={spotN} symbol={symbol} />
                </td>
              </tr>
            ) : null}
            {rows.map((r, i) => (
              <Fragment key={r.strike}>
                <tr className="h-9 border-t border-[var(--aw-hairline,var(--border))]">
                  <td className="px-2 py-1 text-[13px] font-semibold leading-[18px] tracking-[-0.08px] text-center tabular-nums text-[var(--foreground)]">
                    {formatNumber(r.strike, { maximumFractionDigits: 2 })}
                  </td>
                </tr>
                {spotAfterIdx === i && spotN != null ? (
                  <tr className={ANCHOR_ROW_H}>
                    <td className="p-0">
                      <SpotAnchor price={spotN} symbol={symbol} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
        {/* Mirrors the side panes' horizontal-scrollbar reservation. */}
        <div style={{ height: reserve }} aria-hidden />
      </div>

      {showPut ? (
        <div
          ref={putRef}
          onScroll={onPaneScroll("put")}
          className={`min-w-0 flex-1 ${SCROLL_PANE}`}
        >
          <table className="w-full border-collapse text-[12px] whitespace-nowrap">
            <thead className="sticky top-0 z-[1] bg-[var(--panel)]">
              <tr className="border-b border-[var(--aw-hairline,var(--border))]">
                <SideHeader t={t} isCall={false} />
              </tr>
            </thead>
            <tbody>
              {showTopAnchor ? (
                <tr className={ANCHOR_ROW_H}>
                  <td colSpan={SIDE_COL_COUNT} className="p-0">
                    <SpotLine />
                  </td>
                </tr>
              ) : null}
              {rows.map((r, i) => (
                <Fragment key={r.strike}>
                  <tr
                    onClick={() => onPickSeed?.({ kind: "put", strike: r.strike })}
                    className={`h-9 cursor-pointer border-t border-[var(--aw-hairline,var(--border))] transition-colors hover:bg-[color-mix(in_srgb,var(--muted)_6%,transparent)] ${
                      seed?.kind === "put" && seed.strike === r.strike
                        ? "bg-[var(--brand-soft)]"
                        : ""
                    }`}
                  >
                    <SideGroup
                      d={sideCells(r.put, greeksBySide.put.get(r.strike))}
                      bg={spotN != null && r.strike > spotN ? itmBg : ""}
                      isCall={false}
                    />
                  </tr>
                  {spotAfterIdx === i && spotN != null ? (
                    <tr className={ANCHOR_ROW_H}>
                      <td colSpan={SIDE_COL_COUNT} className="p-0">
                        <SpotLine />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/*
       * Outer vertical rail: the single vertical scrollbar for the whole board,
       * pinned to the far right edge outside the side panes. Its spacer mirrors
       * the pane content height (+ the horizontal-scrollbar reservation the
       * side panes report) so both scroll ranges line up exactly.
       */}
      <div
        ref={railRef}
        onScroll={onRailScroll}
        aria-hidden
        className="oc-vrail w-2 shrink-0"
      >
        <div style={{ height: contentH + reserve }} />
      </div>
    </>
  );
});
