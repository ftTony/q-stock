"use client";

import {
  Fragment,
  memo,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { formatNumber } from "@/lib/format-number";
import {
  ANCHOR_ROW_H,
  SideGroup,
  SideHeader,
  SpotAnchor,
  SpotLine,
  sideCells,
} from "./option-chain-table";
import type { OptionChainColKey } from "./option-chain-prefs";
import {
  sideMatchesMoney,
  type Greeks,
  type MoneyFilter,
  type StrikeRow,
} from "./option-chain-utils";

const SCROLL_EPS = 1;

function syncLeft(
  left: number,
  ...els: Array<HTMLDivElement | null | undefined>
) {
  const target = Math.round(left);
  for (const el of els) {
    if (el && Math.abs(el.scrollLeft - target) > SCROLL_EPS) {
      el.scrollLeft = target;
    }
  }
}

/**
 * T-quote body: `.oc-board-y` is the only vertical scroller.
 * Call / put H-scroll in panes (native thumbs hidden). Synced H thumbs live in
 * `.oc-h-bar` outside the Y scroller so they stay pinned to the panel bottom.
 * Headers stick inside board-y. ITM/OTM blanks the non-matching side.
 */
export const OptionChainPanes = memo(function OptionChainPanes({
  rows,
  spotN,
  spotAfterIdx,
  greeksBySide,
  showCall,
  showPut,
  money = "all",
  cols,
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
  money?: MoneyFilter;
  cols: OptionChainColKey[];
  symbol?: string;
  seed?: { kind: "call" | "put"; strike: number } | null;
  onPickSeed?: (s: { kind: "call" | "put"; strike: number }) => void;
  t: (k: string) => string;
}) {
  const colCount = Math.max(cols.length, 1);
  const callBodyRef = useRef<HTMLDivElement>(null);
  const putBodyRef = useRef<HTMLDivElement>(null);
  const callHeadRef = useRef<HTMLDivElement>(null);
  const putHeadRef = useRef<HTMLDivElement>(null);
  const callBarRef = useRef<HTMLDivElement>(null);
  const putBarRef = useRef<HTMLDivElement>(null);
  /** Blocks re-entrant scroll events while programmatically syncing peers. */
  const syncLockRef = useRef(false);
  const [callInnerW, setCallInnerW] = useState(0);
  const [putInnerW, setPutInnerW] = useState(0);

  const mirrorPutFromCall = (callLeft: number, callMax: number) => {
    const put = putBodyRef.current;
    if (!put || callMax <= 0) return;
    const putMax = put.scrollWidth - put.clientWidth;
    if (putMax <= 0) return;
    const ratio = Math.min(1, Math.max(0, callLeft / callMax));
    const want = Math.round(putMax * (1 - ratio));
    syncLeft(want, put, putHeadRef.current, putBarRef.current);
  };

  const mirrorCallFromPut = (putLeft: number, putMax: number) => {
    const call = callBodyRef.current;
    if (!call || putMax <= 0) return;
    const callMax = call.scrollWidth - call.clientWidth;
    if (callMax <= 0) return;
    const ratio = Math.min(1, Math.max(0, putLeft / putMax));
    const want = Math.round(callMax * (1 - ratio));
    syncLeft(want, call, callHeadRef.current, callBarRef.current);
  };

  /** Drive call side + mirrored put; ignore nested scroll events. */
  const applyCallLeft = (left: number) => {
    if (syncLockRef.current) return;
    syncLockRef.current = true;
    try {
      const call = callBodyRef.current;
      if (!call) return;
      const callMax = call.scrollWidth - call.clientWidth;
      syncLeft(left, call, callHeadRef.current, callBarRef.current);
      mirrorPutFromCall(left, callMax);
    } finally {
      syncLockRef.current = false;
    }
  };

  const applyPutLeft = (left: number) => {
    if (syncLockRef.current) return;
    syncLockRef.current = true;
    try {
      const put = putBodyRef.current;
      if (!put) return;
      const putMax = put.scrollWidth - put.clientWidth;
      syncLeft(left, put, putHeadRef.current, putBarRef.current);
      mirrorCallFromPut(left, putMax);
    } finally {
      syncLockRef.current = false;
    }
  };

  const onCallBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    applyCallLeft(e.currentTarget.scrollLeft);
  };

  const onPutBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    applyPutLeft(e.currentTarget.scrollLeft);
  };

  const onCallBarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    applyCallLeft(e.currentTarget.scrollLeft);
  };

  const onPutBarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    applyPutLeft(e.currentTarget.scrollLeft);
  };

  useLayoutEffect(() => {
    const call = callBodyRef.current;
    const put = putBodyRef.current;
    const measure = () => {
      if (call) setCallInnerW(call.scrollWidth);
      if (put) setPutInnerW(put.scrollWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (call) {
      ro.observe(call);
      const table = call.querySelector("table");
      if (table) ro.observe(table);
    }
    if (put) {
      ro.observe(put);
      const table = put.querySelector("table");
      if (table) ro.observe(table);
    }
    syncLockRef.current = true;
    try {
      if (call) {
        const left = call.scrollWidth - call.clientWidth;
        syncLeft(left, call, callHeadRef.current, callBarRef.current);
      }
      if (put) {
        syncLeft(0, put, putHeadRef.current, putBarRef.current);
      }
    } finally {
      syncLockRef.current = false;
    }
    return () => ro.disconnect();
  }, [rows.length, showCall, showPut]);

  // Keep fake thumbs aligned after spacer width commits.
  useLayoutEffect(() => {
    syncLockRef.current = true;
    try {
      const call = callBodyRef.current;
      const put = putBodyRef.current;
      if (call) syncLeft(call.scrollLeft, callBarRef.current);
      if (put) syncLeft(put.scrollLeft, putBarRef.current);
    } finally {
      syncLockRef.current = false;
    }
  }, [callInnerW, putInnerW]);

  /* Stronger than 8% muted so ITM blocks read clearly on dense chain / expand. */
  const itmBg =
    "bg-[color-mix(in_srgb,var(--brand)_7%,var(--panel))]";
  const showTopAnchor = spotAfterIdx < 0 && spotN != null;

  const callVisible = (strike: number) =>
    spotN == null || sideMatchesMoney("call", strike, spotN, money);
  const putVisible = (strike: number) =>
    spotN == null || sideMatchesMoney("put", strike, spotN, money);

  return (
    <div className="oc-board flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="oc-board-y flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Sticky headers — outside H panes so pin works against board-y. */}
      <div className="oc-head-sticky sticky top-0 z-[3] flex w-full shrink-0 bg-[var(--panel)]">
        {showCall ? (
          <div ref={callHeadRef} className="oc-h-head min-w-0 flex-1">
            <table className="w-full border-collapse text-[12px] whitespace-nowrap">
              <thead>
                <tr>
                  <SideHeader t={t} isCall cols={cols} />
                </tr>
              </thead>
            </table>
          </div>
        ) : null}
        <div className="flex w-[5rem] shrink-0 items-stretch bg-[var(--pearl)]">
          <div className="flex w-full items-center justify-center px-2 py-2 text-center text-[12px] font-semibold whitespace-nowrap text-[var(--foreground)]">
            {t("optCol.strike")}
          </div>
        </div>
        {showPut ? (
          <div ref={putHeadRef} className="oc-h-head min-w-0 flex-1">
            <table className="w-full border-collapse text-[12px] whitespace-nowrap">
              <thead>
                <tr>
                  <SideHeader t={t} isCall={false} cols={cols} />
                </tr>
              </thead>
            </table>
          </div>
        ) : null}
      </div>

      <div className="flex w-full min-w-0">
        {showCall ? (
          <div
            ref={callBodyRef}
            onScroll={onCallBodyScroll}
            className="oc-h-pane min-w-0 flex-1"
          >
            <table className="w-full border-collapse text-[12px] whitespace-nowrap">
              {/* Invisible thead keeps body column widths aligned with sticky head. */}
              <thead className="oc-thead-spacer" aria-hidden>
                <tr>
                  <SideHeader t={t} isCall cols={cols} />
                </tr>
              </thead>
              <tbody>
                {showTopAnchor ? (
                  <tr className={ANCHOR_ROW_H}>
                    <td colSpan={colCount} className="p-0">
                      <SpotLine />
                    </td>
                  </tr>
                ) : null}
                {rows.map((r, i) => {
                  const show = callVisible(r.strike);
                  const call = show ? r.call : undefined;
                  const callItm = spotN != null && r.strike < spotN;
                  return (
                    <Fragment key={r.strike}>
                      <tr
                        onClick={() => {
                          if (!show || !call) return;
                          onPickSeed?.({ kind: "call", strike: r.strike });
                        }}
                        className={`h-9 border-b border-[var(--aw-hairline,var(--border))] last:border-b-0 transition-colors ${
                          show
                            ? "cursor-pointer hover:bg-[color-mix(in_srgb,var(--muted)_6%,transparent)]"
                            : ""
                        } ${
                          seed?.kind === "call" &&
                          seed.strike === r.strike &&
                          show
                            ? "bg-[var(--brand-soft)]"
                            : ""
                        }`}
                      >
                        <SideGroup
                          d={sideCells(
                            call,
                            call
                              ? greeksBySide.call.get(r.strike)
                              : undefined,
                          )}
                          bg={show && callItm ? itmBg : ""}
                          isCall
                          cols={cols}
                        />
                      </tr>
                      {spotAfterIdx === i && spotN != null ? (
                        <tr className={ANCHOR_ROW_H}>
                          <td colSpan={colCount} className="p-0">
                            <SpotLine />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="oc-strike-col w-[5rem] shrink-0 bg-[var(--pearl)]">
          <table className="w-full border-collapse text-[12px] whitespace-nowrap">
            <thead className="oc-thead-spacer" aria-hidden>
              <tr>
                <th className="min-w-[5rem] px-2 py-2">{t("optCol.strike")}</th>
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
                  <tr className="h-9 border-b border-[var(--aw-hairline,var(--border))] last:border-b-0">
                    <td className="px-2 py-1 text-center text-[13px] font-semibold leading-[18px] tracking-[-0.08px] tabular-nums text-[var(--foreground)]">
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
        </div>

        {showPut ? (
          <div
            ref={putBodyRef}
            onScroll={onPutBodyScroll}
            className="oc-h-pane min-w-0 flex-1"
          >
            <table className="w-full border-collapse text-[12px] whitespace-nowrap">
              <thead className="oc-thead-spacer" aria-hidden>
                <tr>
                  <SideHeader t={t} isCall={false} cols={cols} />
                </tr>
              </thead>
              <tbody>
                {showTopAnchor ? (
                  <tr className={ANCHOR_ROW_H}>
                    <td colSpan={colCount} className="p-0">
                      <SpotLine />
                    </td>
                  </tr>
                ) : null}
                {rows.map((r, i) => {
                  const show = putVisible(r.strike);
                  const put = show ? r.put : undefined;
                  const putItm = spotN != null && r.strike > spotN;
                  return (
                    <Fragment key={r.strike}>
                      <tr
                        onClick={() => {
                          if (!show || !put) return;
                          onPickSeed?.({ kind: "put", strike: r.strike });
                        }}
                        className={`h-9 border-b border-[var(--aw-hairline,var(--border))] last:border-b-0 transition-colors ${
                          show
                            ? "cursor-pointer hover:bg-[color-mix(in_srgb,var(--muted)_6%,transparent)]"
                            : ""
                        } ${
                          seed?.kind === "put" &&
                          seed.strike === r.strike &&
                          show
                            ? "bg-[var(--brand-soft)]"
                            : ""
                        }`}
                      >
                        <SideGroup
                          d={sideCells(
                            put,
                            put ? greeksBySide.put.get(r.strike) : undefined,
                          )}
                          bg={show && putItm ? itmBg : ""}
                          isCall={false}
                          cols={cols}
                        />
                      </tr>
                      {spotAfterIdx === i && spotN != null ? (
                        <tr className={ANCHOR_ROW_H}>
                          <td colSpan={colCount} className="p-0">
                            <SpotLine />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      </div>

      {/* H thumbs pinned under the Y scroller — always at panel bottom. */}
      <div className="oc-h-bar flex w-full shrink-0 bg-[var(--panel)]">
        {showCall ? (
          <div
            ref={callBarRef}
            onScroll={onCallBarScroll}
            className="oc-h-bar-pane min-w-0 flex-1"
            aria-label="call columns"
          >
            <div style={{ width: Math.max(callInnerW, 1), height: 1 }} />
          </div>
        ) : null}
        <div className="w-[5rem] shrink-0" aria-hidden />
        {showPut ? (
          <div
            ref={putBarRef}
            onScroll={onPutBarScroll}
            className="oc-h-bar-pane min-w-0 flex-1"
            aria-label="put columns"
          >
            <div style={{ width: Math.max(putInnerW, 1), height: 1 }} />
          </div>
        ) : null}
      </div>
    </div>
  );
});
