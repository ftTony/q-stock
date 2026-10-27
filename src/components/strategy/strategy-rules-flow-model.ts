import { MarkerType, type Edge, type Node, type XYPosition } from "@xyflow/react";
import type { RuleClause, StrategyRules } from "@/lib/strategy/rules";

const EDGE_STROKE = "var(--border)";
const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 14,
  height: 14,
  color: EDGE_STROKE,
} as const;

export type BlockTone = "start" | "entry" | "exit" | "sizing" | "add";

export type BlockNodeData = {
  tone: BlockTone;
  title: string;
  parts: Array<{ text: string; accent?: boolean }>;
  list?: "entry" | "exit";
  index?: number;
  disabled?: boolean;
};

const COL = 300;
const ROW = 180;

export function defaultPosition(
  kind: "start" | "entry" | "exit" | "sizing" | "add-entry" | "add-exit",
  index = 0,
  entryCount = 0,
): XYPosition {
  if (kind === "start") return { x: 40, y: 48 };
  if (kind === "entry") return { x: 40 + (index + 1) * COL, y: 48 };
  if (kind === "add-entry")
    return { x: 40 + (entryCount + 1) * COL, y: 64 };
  if (kind === "exit") return { x: 40 + (index + 1) * COL, y: 48 + ROW };
  if (kind === "add-exit")
    return { x: 40 + (entryCount + 1) * COL, y: 64 + ROW };
  return { x: 40 + COL, y: 48 + ROW * 2 };
}

export function rulesLayoutKey(rules: StrategyRules): string {
  return [
    rules.market,
    rules.entry.map((c) => c.type).join(","),
    rules.exit.map((c) => c.type).join(","),
    rules.sizing.mode,
  ].join("|");
}

export function buildFlowElements(opts: {
  rules: StrategyRules;
  positions: Record<string, XYPosition>;
  labels: {
    startTitle: string;
    startBody: string;
    market: string;
    addEntry: string;
    addExit: string;
    sizingTitle: string;
    entryAnd: string;
    exitOr: string;
    clauseTitle: (c: RuleClause) => string;
    clauseParts: (c: RuleClause) => Array<{ text: string; accent?: boolean }>;
    sizingParts: Array<{ text: string; accent?: boolean }>;
  };
  disabled?: boolean;
}): { nodes: Node<BlockNodeData>[]; edges: Edge[] } {
  const { rules, positions, labels, disabled } = opts;
  const pos = (id: string, fallback: XYPosition) => positions[id] ?? fallback;

  const nodes: Node<BlockNodeData>[] = [
    {
      id: "start",
      type: "block",
      position: pos("start", defaultPosition("start")),
      data: {
        tone: "start",
        title: labels.startTitle,
        parts: [
          { text: labels.startBody },
          { text: labels.market, accent: true },
        ],
        disabled: true,
      },
      draggable: !disabled,
      selectable: true,
    },
  ];

  rules.entry.forEach((c, i) => {
    const id = `entry-${i}`;
    nodes.push({
      id,
      type: "block",
      position: pos(id, defaultPosition("entry", i)),
      data: {
        tone: "entry",
        title: labels.clauseTitle(c),
        parts: labels.clauseParts(c),
        list: "entry",
        index: i,
        disabled,
      },
      draggable: !disabled,
    });
  });

  if (!disabled && rules.entry.length < 6) {
    nodes.push({
      id: "add-entry",
      type: "add",
      position: pos(
        "add-entry",
        defaultPosition("add-entry", 0, rules.entry.length),
      ),
      data: {
        tone: "add",
        title: labels.addEntry,
        parts: [],
      },
      draggable: true,
    });
  }

  rules.exit.forEach((c, i) => {
    const id = `exit-${i}`;
    nodes.push({
      id,
      type: "block",
      position: pos(id, defaultPosition("exit", i, rules.entry.length)),
      data: {
        tone: "exit",
        title: labels.clauseTitle(c),
        parts: labels.clauseParts(c),
        list: "exit",
        index: i,
        disabled,
      },
      draggable: !disabled,
    });
  });

  if (!disabled && rules.exit.length < 6) {
    nodes.push({
      id: "add-exit",
      type: "add",
      position: pos(
        "add-exit",
        defaultPosition("add-exit", 0, Math.max(rules.exit.length, 1)),
      ),
      data: {
        tone: "add",
        title: labels.addExit,
        parts: [],
      },
      draggable: true,
    });
  }

  nodes.push({
    id: "sizing",
    type: "block",
    position: pos("sizing", defaultPosition("sizing")),
    data: {
      tone: "sizing",
      title: labels.sizingTitle,
      parts: labels.sizingParts,
      disabled,
    },
    draggable: !disabled,
  });

  const edges: Edge[] = [];
  const edge = (
    id: string,
    source: string,
    target: string,
    label?: string,
  ): Edge => ({
    id,
    source,
    target,
    label,
    type: "smoothstep",
    animated: false,
    markerEnd: EDGE_MARKER,
    style: { stroke: EDGE_STROKE, strokeWidth: 1.5 },
    labelStyle: { fill: "var(--muted)", fontSize: 10 },
    labelBgStyle: { fill: "var(--panel)", fillOpacity: 0.9 },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 2,
  });

  if (rules.entry.length) {
    edges.push(edge("e-start-entry0", "start", "entry-0"));
    for (let i = 0; i < rules.entry.length - 1; i++) {
      edges.push(
        edge(
          `e-entry-${i}-${i + 1}`,
          `entry-${i}`,
          `entry-${i + 1}`,
          labels.entryAnd,
        ),
      );
    }
    edges.push(
      edge(
        "e-entry-exit",
        `entry-${rules.entry.length - 1}`,
        "exit-0",
        labels.exitOr,
      ),
    );
  }

  for (let i = 0; i < rules.exit.length - 1; i++) {
    edges.push(
      edge(
        `e-exit-${i}-${i + 1}`,
        `exit-${i}`,
        `exit-${i + 1}`,
        labels.exitOr,
      ),
    );
  }

  if (rules.exit.length) {
    edges.push(
      edge("e-exit-sizing", `exit-${rules.exit.length - 1}`, "sizing"),
    );
  } else {
    edges.push(edge("e-start-sizing", "start", "sizing"));
  }

  if (!disabled && rules.entry.length < 6 && rules.entry.length > 0) {
    edges.push(
      edge(
        "e-entry-add",
        `entry-${rules.entry.length - 1}`,
        "add-entry",
      ),
    );
  } else if (!disabled && rules.entry.length === 0) {
    edges.push(edge("e-start-add-entry", "start", "add-entry"));
  }

  if (!disabled && rules.exit.length < 6 && rules.exit.length > 0) {
    edges.push(
      edge("e-exit-add", `exit-${rules.exit.length - 1}`, "add-exit"),
    );
  }

  return { nodes, edges };
}

/** Reorder list so `from` moves to `to` index. */
export function moveClause(
  list: RuleClause[],
  from: number,
  to: number,
): RuleClause[] {
  if (from === to || from < 0 || to < 0 || from >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (!item) return list;
  next.splice(Math.min(to, next.length), 0, item);
  return next;
}

export function parseListNodeId(
  id: string,
): { list: "entry" | "exit"; index: number } | null {
  const m = /^(entry|exit)-(\d+)$/.exec(id);
  if (!m) return null;
  return { list: m[1] as "entry" | "exit", index: Number(m[2]) };
}
