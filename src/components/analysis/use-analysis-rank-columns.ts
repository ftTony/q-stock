"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ANALYSIS_COL_DEFAULT_WIDTHS,
  ANALYSIS_PIN_CHECK_W,
  ANALYSIS_PIN_DEFAULT_WIDTHS,
  clampPinWidth,
  defaultAnalysisColLayout,
  loadAnalysisColLayout,
  saveAnalysisColLayout,
  type AnalysisColId,
  type AnalysisColLayout,
  type AnalysisPinId,
  type AnalysisSortDir,
} from "@/components/analysis/analysis-rank-columns";

type MidResize = {
  kind: "mid";
  id: AnalysisColId;
  startX: number;
  startWidth: number;
  startMidWidth: number;
};

type PinResize = {
  kind: "pin";
  id: AnalysisPinId;
  startX: number;
  startWidth: number;
  startPins: { symbol: number; name: number; actions: number };
};

/**
 * Column order (drag), widths (resize), and sort for the analysis peer table.
 * Drag/resize paint via DOM so React is not thrashing mid-gesture.
 */
export function useAnalysisRankColumns() {
  // Defaults on first paint (SSR + hydrate); localStorage applied after mount.
  const [layout, setLayout] = useState<AnalysisColLayout>(defaultAnalysisColLayout);
  const [layoutReady, setLayoutReady] = useState(false);
  const [sortKey, setSortKey] = useState<AnalysisColId>("percentChange");
  const [sortDir, setSortDir] = useState<AnalysisSortDir>("desc");
  const [resizingToken, setResizingToken] = useState(0);
  /** Mid body table (metrics). */
  const tableRef = useRef<HTMLTableElement | null>(null);
  /** Mid header table — separate DOM after 3-pane split; must paint with body. */
  const headTableRef = useRef<HTMLTableElement | null>(null);
  const leftHeadWrapRef = useRef<HTMLDivElement | null>(null);
  const leftBodyWrapRef = useRef<HTMLDivElement | null>(null);
  const leftHeadTableRef = useRef<HTMLTableElement | null>(null);
  const leftBodyTableRef = useRef<HTMLTableElement | null>(null);
  const rightHeadWrapRef = useRef<HTMLDivElement | null>(null);
  const rightBodyWrapRef = useRef<HTMLDivElement | null>(null);
  const rightHeadTableRef = useRef<HTMLTableElement | null>(null);
  const rightBodyTableRef = useRef<HTMLTableElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const justDraggedRef = useRef(false);
  const resizeActiveRef = useRef(false);
  /** Survives row remounts — do not paint via classList on td. */
  const [resizeHoverCol, setResizeHoverCol] = useState<string | null>(null);

  function midTables(): HTMLTableElement[] {
    return [headTableRef.current, tableRef.current].filter(
      (t): t is HTMLTableElement => t != null,
    );
  }

  const order = layout.order;
  const widths = layout.widths;

  const widthOf = useCallback(
    (id: AnalysisColId) =>
      widths[id] ?? ANALYSIS_COL_DEFAULT_WIDTHS[id] ?? 88,
    [widths],
  );

  const pinWidths = useMemo(() => {
    const p = layout.pins ?? ANALYSIS_PIN_DEFAULT_WIDTHS;
    return {
      check: ANALYSIS_PIN_CHECK_W,
      symbol: p.symbol ?? ANALYSIS_PIN_DEFAULT_WIDTHS.symbol,
      name: p.name ?? ANALYSIS_PIN_DEFAULT_WIDTHS.name,
      actions: p.actions ?? ANALYSIS_PIN_DEFAULT_WIDTHS.actions,
    };
  }, [layout.pins]);

  const totalWidth = useMemo(
    () =>
      pinWidths.check +
      pinWidths.symbol +
      pinWidths.name +
      pinWidths.actions +
      order.reduce((sum, id) => sum + widthOf(id), 0),
    [order, widthOf, pinWidths],
  );

  useEffect(() => {
    setLayout(loadAnalysisColLayout());
    setLayoutReady(true);
  }, []);

  useEffect(() => {
    if (!layoutReady) return;
    saveAnalysisColLayout(layout);
  }, [layout, layoutReady]);

  function toggleSort(key: AnalysisColId) {
    if (justDraggedRef.current || resizeActiveRef.current) return;
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  }

  const applyResizeHover = useCallback((colId: string | null) => {
    setResizeHoverCol(colId);
  }, []);

  const resizeRef = useRef<MidResize | PinResize | null>(null);
  const pendingWidthRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  function paintPinWidths(pins: {
    symbol: number;
    name: number;
    actions: number;
  }) {
    const leftW = `${ANALYSIS_PIN_CHECK_W + pins.symbol + pins.name}px`;
    const actW = `${pins.actions}px`;
    for (const el of [
      leftHeadWrapRef.current,
      leftBodyWrapRef.current,
      leftHeadTableRef.current,
      leftBodyTableRef.current,
    ]) {
      if (!el) continue;
      el.style.width = leftW;
      if ("minWidth" in el.style) el.style.minWidth = leftW;
    }
    for (const el of [
      rightHeadWrapRef.current,
      rightBodyWrapRef.current,
      rightHeadTableRef.current,
      rightBodyTableRef.current,
    ]) {
      if (!el) continue;
      el.style.width = actW;
      if ("minWidth" in el.style) el.style.minWidth = actW;
    }
    for (const table of [leftHeadTableRef.current, leftBodyTableRef.current]) {
      if (!table) continue;
      table.style.setProperty("--pin-check", `${ANALYSIS_PIN_CHECK_W}px`);
      table.style.setProperty("--pin-symbol", `${pins.symbol}px`);
      table.style.setProperty("--pin-name", `${pins.name}px`);
    }
    for (const table of [rightHeadTableRef.current, rightBodyTableRef.current]) {
      if (!table) continue;
      table.style.setProperty("--pin-actions", actW);
    }
    document
      .querySelectorAll<HTMLElement>("[data-pin-col]")
      .forEach((node) => {
        const id = node.dataset.pinCol as AnalysisPinId | "check" | undefined;
        if (!id) return;
        const w =
          id === "check"
            ? ANALYSIS_PIN_CHECK_W
            : id === "symbol"
              ? pins.symbol
              : id === "name"
                ? pins.name
                : pins.actions;
        node.style.width = `${w}px`;
        node.style.minWidth = `${w}px`;
      });
  }

  function startResize(
    event: ReactPointerEvent<HTMLSpanElement>,
    id: AnalysisColId,
  ) {
    event.preventDefault();
    event.stopPropagation();
    colDragRef.current = null;
    const startMidWidth = order.reduce((sum, colId) => sum + widthOf(colId), 0);
    resizeRef.current = {
      kind: "mid",
      id,
      startX: event.clientX,
      startWidth: widthOf(id),
      startMidWidth,
    };
    pendingWidthRef.current = widthOf(id);
    resizeActiveRef.current = true;
    setResizingToken((n) => n + 1);
  }

  function startPinResize(
    event: ReactPointerEvent<HTMLSpanElement>,
    id: AnalysisPinId,
  ) {
    event.preventDefault();
    event.stopPropagation();
    colDragRef.current = null;
    const startPins = {
      symbol: pinWidths.symbol,
      name: pinWidths.name,
      actions: pinWidths.actions,
    };
    resizeRef.current = {
      kind: "pin",
      id,
      startX: event.clientX,
      startWidth: startPins[id],
      startPins,
    };
    pendingWidthRef.current = startPins[id];
    resizeActiveRef.current = true;
    setResizingToken((n) => n + 1);
  }

  useEffect(() => {
    if (!resizeActiveRef.current || !resizeRef.current) return;

    const cursorStyle = document.createElement("style");
    cursorStyle.dataset.qstockColResize = "true";
    cursorStyle.textContent =
      ".qstock-col-resizing, .qstock-col-resizing * { cursor: col-resize !important; user-select: none !important; }";
    document.head.appendChild(cursorStyle);
    document.body.classList.add("qstock-col-resizing");
    const clearCursor = () => {
      document.body.classList.remove("qstock-col-resizing");
      cursorStyle.remove();
    };

    const paint = (width: number) => {
      const drag = resizeRef.current;
      if (!drag) return;
      if (drag.kind === "mid") {
        const midW = `${drag.startMidWidth + width - drag.startWidth}px`;
        for (const table of midTables()) {
          table.style.setProperty(`--cw-${drag.id}`, `${width}px`);
          table.style.width = midW;
          table.style.minWidth = midW;
        }
        return;
      }
      const next = { ...drag.startPins, [drag.id]: width };
      paintPinWidths(next);
    };

    const onMove = (event: PointerEvent) => {
      const drag = resizeRef.current;
      if (!drag) return;
      const raw = Math.round(drag.startWidth + event.clientX - drag.startX);
      pendingWidthRef.current =
        drag.kind === "pin"
          ? clampPinWidth(drag.id, raw)
          : Math.max(56, Math.min(280, raw));
      if (frameRef.current != null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        if (pendingWidthRef.current != null) paint(pendingWidthRef.current);
      });
    };

    const onEnd = () => {
      const drag = resizeRef.current;
      const width = pendingWidthRef.current;
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (drag && width != null && width !== drag.startWidth) {
        if (drag.kind === "mid") {
          setLayout((prev) => ({
            ...prev,
            widths: { ...prev.widths, [drag.id]: width },
          }));
        } else {
          setLayout((prev) => ({
            ...prev,
            pins: {
              ...ANALYSIS_PIN_DEFAULT_WIDTHS,
              ...prev.pins,
              [drag.id]: width,
            },
          }));
        }
        paint(width);
      }
      resizeRef.current = null;
      pendingWidthRef.current = null;
      resizeActiveRef.current = false;
      clearCursor();
      justDraggedRef.current = true;
      window.setTimeout(() => {
        justDraggedRef.current = false;
      }, 0);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      clearCursor();
    };
  }, [resizingToken]);

  type ColDrag = {
    id: AnalysisColId;
    label: string;
    startX: number;
    startY: number;
    active: boolean;
  };
  const colDragRef = useRef<ColDrag | null>(null);
  const dragTargetRef = useRef<string | null>(null);

  function startColDrag(
    event: ReactPointerEvent<HTMLTableCellElement>,
    id: AnalysisColId,
    label: string,
  ) {
    if (event.button !== 0 || resizeRef.current) return;
    colDragRef.current = {
      id,
      label,
      startX: event.clientX,
      startY: event.clientY,
      active: false,
    };
  }

  useEffect(() => {
    const findTarget = (x: number): string | null => {
      const ths = headTableRef.current?.querySelectorAll<HTMLElement>(
        "thead th[data-col-id]",
      );
      if (!ths) return null;
      for (const node of Array.from(ths)) {
        const r = node.getBoundingClientRect();
        if (x >= r.left && x <= r.right) return node.dataset.colId ?? null;
      }
      return null;
    };

    const clearHighlights = () => {
      for (const table of midTables()) {
        table
          .querySelectorAll(".qt-col-drop-target, .qt-col-drag-source")
          .forEach((el) =>
            el.classList.remove("qt-col-drop-target", "qt-col-drag-source"),
          );
      }
      dragTargetRef.current = null;
    };

    const onMove = (event: PointerEvent) => {
      if (resizeRef.current) return;
      const drag = colDragRef.current;
      if (!drag) return;
      if (!drag.active) {
        if (
          Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <
          5
        ) {
          return;
        }
        drag.active = true;
        document.body.classList.add("qstock-col-grabbing");
        if (ghostRef.current) {
          ghostRef.current.textContent = drag.label;
          ghostRef.current.style.display = "block";
        }
        headTableRef.current
          ?.querySelectorAll(`th[data-col-id="${drag.id}"]`)
          .forEach((el) => el.classList.add("qt-col-drag-source"));
      }
      event.preventDefault();
      if (ghostRef.current) {
        ghostRef.current.style.left = `${event.clientX + 14}px`;
        ghostRef.current.style.top = `${event.clientY + 14}px`;
      }
      const targetId = findTarget(event.clientX);
      if (targetId !== dragTargetRef.current) {
        clearHighlights();
        dragTargetRef.current = targetId;
        if (targetId && targetId !== drag.id) {
          headTableRef.current
            ?.querySelectorAll(`th[data-col-id="${targetId}"]`)
            .forEach((el) => el.classList.add("qt-col-drop-target"));
        }
        headTableRef.current
          ?.querySelectorAll(`th[data-col-id="${drag.id}"]`)
          .forEach((el) => el.classList.add("qt-col-drag-source"));
      }
    };

    const onUp = () => {
      if (resizeRef.current) return;
      const drag = colDragRef.current;
      colDragRef.current = null;
      document.body.classList.remove("qstock-col-grabbing");
      if (ghostRef.current) ghostRef.current.style.display = "none";
      if (!drag?.active) {
        clearHighlights();
        return;
      }
      justDraggedRef.current = true;
      window.setTimeout(() => {
        justDraggedRef.current = false;
      }, 0);
      const targetId = dragTargetRef.current as AnalysisColId | null;
      clearHighlights();
      if (!targetId || targetId === drag.id) return;
      setLayout((prev) => {
        const next = prev.order.filter((id) => id !== drag.id);
        const index = next.indexOf(targetId);
        next.splice(index < 0 ? next.length : index, 0, drag.id);
        return { ...prev, order: next };
      });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return {
    order,
    widths,
    widthOf,
    totalWidth,
    pinWidths,
    sortKey,
    sortDir,
    tableRef,
    headTableRef,
    leftHeadWrapRef,
    leftBodyWrapRef,
    leftHeadTableRef,
    leftBodyTableRef,
    rightHeadWrapRef,
    rightBodyWrapRef,
    rightHeadTableRef,
    rightBodyTableRef,
    ghostRef,
    toggleSort,
    startColDrag,
    startResize,
    startPinResize,
    applyResizeHover,
    resizeHoverCol,
  };
}
