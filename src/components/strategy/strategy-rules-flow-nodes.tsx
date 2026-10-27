"use client";

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { BlockAccentText } from "@/components/strategy/strategy-rules-block-card";
import type {
  BlockNodeData,
  BlockTone,
} from "@/components/strategy/strategy-rules-flow-model";

const toneBar: Record<Exclude<BlockTone, "add">, string> = {
  start: "bg-[var(--up)]",
  entry: "bg-[color-mix(in_srgb,#ea580c_85%,var(--brand))]",
  exit: "bg-[var(--down)]",
  sizing: "bg-[var(--brand)]",
};

type BlockFlowNode = Node<BlockNodeData, "block">;
type AddFlowNode = Node<BlockNodeData, "add">;

function Port({
  type,
  position,
}: {
  type: "source" | "target";
  position: Position;
}) {
  return (
    <Handle
      type={type}
      position={position}
      className="!h-2.5 !w-2.5 !border !border-[var(--border)] !bg-[var(--panel)]"
    />
  );
}

export function StrategyBlockFlowNode({
  data,
  selected,
}: NodeProps<BlockFlowNode>) {
  const tone = data.tone === "add" ? "entry" : data.tone;
  return (
    <div
      className={`relative w-[240px] rounded-md border bg-[var(--panel)] shadow-sm sm:w-[260px] ${
        selected
          ? "border-[var(--brand)] shadow-md"
          : "border-[var(--border)]"
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 rounded-l-md ${toneBar[tone]}`}
      />
      <Port type="target" position={Position.Left} />
      <Port type="source" position={Position.Right} />
      <div className="px-3 py-2.5 pl-3.5">
        <div className="flex items-start gap-1.5">
          {!data.disabled ? (
            <span
              className="mt-0.5 cursor-grab select-none text-[11px] leading-none text-[var(--muted)] active:cursor-grabbing"
              aria-hidden
            >
              ⋮⋮
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold tracking-tight text-[var(--foreground)]">
              {data.title}
            </p>
            {data.parts.length ? (
              <div className="mt-1.5">
                <BlockAccentText parts={data.parts} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StrategyAddFlowNode({
  data,
  selected,
}: NodeProps<AddFlowNode>) {
  return (
    <div
      className={`flex h-[72px] w-[120px] items-center justify-center rounded-md border border-dashed bg-[var(--panel)]/70 px-2 text-[12px] text-[var(--brand-text)] ${
        selected ? "border-[var(--brand)]" : "border-[var(--border)]"
      }`}
    >
      <Port type="target" position={Position.Left} />
      <span>+ {data.title}</span>
    </div>
  );
}
