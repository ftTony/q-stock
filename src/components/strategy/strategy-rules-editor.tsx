"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Node,
  type OnNodeDrag,
  type XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTranslations } from "next-intl";
import { StrategyRulesBlockEditModal } from "@/components/strategy/strategy-rules-block-edit-modal";
import { defaultClause } from "@/components/strategy/strategy-rules-clause-card";
import {
  StrategyAddFlowNode,
  StrategyBlockFlowNode,
} from "@/components/strategy/strategy-rules-flow-nodes";
import {
  buildFlowElements,
  moveClause,
  parseListNodeId,
  rulesLayoutKey,
  type BlockNodeData,
} from "@/components/strategy/strategy-rules-flow-model";
import {
  clauseSentenceParts,
  sizingSentenceParts,
} from "@/components/strategy/strategy-rules-sentence";
import type { RuleClause, StrategyRules } from "@/lib/strategy/rules";
import { useStrategyBlocksStore } from "@/stores/strategy-blocks-store";

type Props = {
  value: StrategyRules;
  disabled?: boolean;
  onChange: (next: StrategyRules) => void;
};

const ENTRY_TYPES: RuleClause["type"][] = [
  "ma_cross",
  "break_high",
  "price_vs_ma",
  "hold_bars",
];
const EXIT_TYPES: RuleClause["type"][] = [
  "ma_cross",
  "stop_pct",
  "take_profit_pct",
  "hold_bars",
  "price_level",
  "price_vs_ma",
];

const nodeTypes = {
  block: StrategyBlockFlowNode,
  add: StrategyAddFlowNode,
};

function StrategyRulesFlowCanvas({ value, disabled, onChange }: Props) {
  const t = useTranslations("strategies");
  const edit = useStrategyBlocksStore((s) => s.edit);
  const openEdit = useStrategyBlocksStore((s) => s.openEdit);
  const closeEdit = useStrategyBlocksStore((s) => s.closeEdit);

  const [positions, setPositions] = useState<Record<string, XYPosition>>({});
  const layoutKeyRef = useRef("");
  const layoutKey = rulesLayoutKey(value);

  const marketLabel =
    value.market === "hk"
      ? "HK"
      : value.market === "cn"
        ? "CN"
        : value.market === "crypto"
          ? t("marketCrypto")
          : t("marketStock");

  const labels = useMemo(
    () => ({
      startTitle: t("blockStartTitle"),
      startBody: t("blockStartBody"),
      market: marketLabel,
      addEntry: t("rulesAddEntry"),
      addExit: t("rulesAddExit"),
      sizingTitle: t("rulesSizing"),
      entryAnd: t("rulesEntryHint"),
      exitOr: t("rulesExitHint"),
      clauseTitle: (c: RuleClause) =>
        t(`clauseType_${c.type}` as "clauseType_ma_cross"),
      clauseParts: (c: RuleClause) =>
        clauseSentenceParts(c, (k) => t(k as "blockSentMa1")),
      sizingParts: sizingSentenceParts(value.sizing, (k) =>
        t(k as "blockSentSizeCap"),
      ),
    }),
    [t, marketLabel, value.sizing],
  );

  const built = useMemo(
    () =>
      buildFlowElements({
        rules: value,
        positions,
        labels,
        disabled,
      }),
    [value, positions, labels, disabled],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(built.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(built.edges);

  useEffect(() => {
    if (layoutKeyRef.current && layoutKeyRef.current !== layoutKey) {
      // Structure changed — drop stale positions for removed ids.
      setPositions((prev) => {
        const keep = new Set(built.nodes.map((n) => n.id));
        const next: Record<string, XYPosition> = {};
        for (const [id, p] of Object.entries(prev)) {
          if (keep.has(id)) next[id] = p;
        }
        return next;
      });
    }
    layoutKeyRef.current = layoutKey;
    setNodes(built.nodes);
    setEdges(built.edges);
  }, [built, layoutKey, setNodes, setEdges]);

  function patch(partial: Partial<StrategyRules>) {
    onChange({ ...value, ...partial });
  }

  function updateList(list: "entry" | "exit", next: RuleClause[]) {
    patch({ [list]: next });
  }

  const onNodeDragStop: OnNodeDrag = useCallback((_e, node) => {
    setPositions((prev) => ({
      ...prev,
      [node.id]: { ...node.position },
    }));
  }, []);

  const onConnect = useCallback(
    (conn: Connection) => {
      if (disabled || !conn.source || !conn.target) return;
      const src = parseListNodeId(conn.source);
      const tgt = parseListNodeId(conn.target);
      // Same-lane reconnect → reorder clauses (source of truth stays StrategyRules).
      if (src && tgt && src.list === tgt.list && src.index !== tgt.index) {
        updateList(
          src.list,
          moveClause(value[src.list], src.index, tgt.index),
        );
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...conn,
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: "var(--border)",
            },
            style: { stroke: "var(--border)", strokeWidth: 1.5 },
          },
          eds,
        ),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- value lists via closure
    [disabled, value.entry, value.exit],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (disabled) return;
      if (node.id === "add-entry") {
        updateList("entry", [...value.entry, defaultClause("ma_cross")]);
        return;
      }
      if (node.id === "add-exit") {
        updateList("exit", [...value.exit, defaultClause("stop_pct")]);
        return;
      }
      if (node.id === "sizing") {
        openEdit({ kind: "sizing" });
        return;
      }
      if (node.id === "start") return;
      const parsed = parseListNodeId(node.id);
      if (parsed) openEdit({ kind: parsed.list, index: parsed.index });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, value.entry, value.exit, openEdit],
  );

  const editingClause =
    edit?.kind === "entry"
      ? value.entry[edit.index]
      : edit?.kind === "exit"
        ? value.exit[edit.index]
        : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="relative min-h-[min(68dvh,640px)] flex-1 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-2)]/25">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={disabled ? undefined : onNodesChange}
          onEdgesChange={disabled ? undefined : onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.6}
          nodesDraggable={!disabled}
          nodesConnectable={!disabled}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: "smoothstep",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: "var(--border)",
            },
            style: { stroke: "var(--border)", strokeWidth: 1.5 },
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color="color-mix(in srgb, var(--border) 70%, transparent)"
          />
          <Controls
            showInteractive={false}
            className="!shadow-sm !border-[var(--border)] !bg-[var(--panel)]"
          />
          <MiniMap
            pannable
            zoomable
            className="!border-[var(--border)] !bg-[var(--panel)]"
            maskColor="color-mix(in srgb, var(--foreground) 8%, transparent)"
          />
        </ReactFlow>
      </div>

      <p className="text-[10px] text-[var(--muted)]">{t("rulesBlocksHint")}</p>

      <StrategyRulesBlockEditModal
        open={edit?.kind === "entry" || edit?.kind === "exit"}
        title={
          editingClause
            ? t(`clauseType_${editingClause.type}` as "clauseType_ma_cross")
            : t("rules")
        }
        clause={editingClause}
        typeOptions={edit?.kind === "exit" ? EXIT_TYPES : ENTRY_TYPES}
        disabled={disabled}
        onClose={closeEdit}
        onClauseChange={(next) => {
          if (!edit || (edit.kind !== "entry" && edit.kind !== "exit")) return;
          const list = edit.kind;
          const arr = [...value[list]];
          arr[edit.index] = next;
          updateList(list, arr);
        }}
        onRemove={
          edit &&
          (edit.kind === "entry" || edit.kind === "exit") &&
          value[edit.kind].length > 1
            ? () =>
                updateList(
                  edit.kind as "entry" | "exit",
                  value[edit.kind as "entry" | "exit"].filter(
                    (_, j) => j !== edit.index,
                  ),
                )
            : undefined
        }
      />

      <StrategyRulesBlockEditModal
        open={edit?.kind === "sizing"}
        title={t("rulesSizing")}
        sizing={value.sizing}
        disabled={disabled}
        onClose={closeEdit}
        onSizingChange={(sizing) => patch({ sizing })}
      />
    </div>
  );
}

/** Building-block canvas — draggable nodes with connectable edges. */
export function StrategyRulesEditor(props: Props) {
  return (
    <ReactFlowProvider>
      <StrategyRulesFlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
