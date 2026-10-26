"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  BlockAccentText,
  BlockFlowArrow,
  StrategyRulesBlockCard,
} from "@/components/strategy/strategy-rules-block-card";
import { StrategyRulesBlockEditModal } from "@/components/strategy/strategy-rules-block-edit-modal";
import { defaultClause } from "@/components/strategy/strategy-rules-clause-card";
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

/** Building-block canvas for StrategyRules (entry / exit / sizing). */
export function StrategyRulesEditor({ value, disabled, onChange }: Props) {
  const t = useTranslations("strategies");
  const dragRef = useRef<null | { list: "entry" | "exit"; index: number }>(
    null,
  );
  const edit = useStrategyBlocksStore((s) => s.edit);
  const openEdit = useStrategyBlocksStore((s) => s.openEdit);
  const closeEdit = useStrategyBlocksStore((s) => s.closeEdit);

  function patch(partial: Partial<StrategyRules>) {
    onChange({ ...value, ...partial });
  }

  function updateList(list: "entry" | "exit", next: RuleClause[]) {
    patch({ [list]: next });
  }

  function reorder(list: "entry" | "exit", from: number, to: number) {
    if (from === to) return;
    const arr = [...value[list]];
    const [item] = arr.splice(from, 1);
    if (!item) return;
    arr.splice(to, 0, item);
    updateList(list, arr);
  }

  const marketLabel =
    value.market === "hk"
      ? "HK"
      : value.market === "cn"
        ? "CN"
        : value.market === "crypto"
          ? t("marketCrypto")
          : t("marketStock");

  const editingClause =
    edit?.kind === "entry"
      ? value.entry[edit.index]
      : edit?.kind === "exit"
        ? value.exit[edit.index]
        : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div
        className="relative min-h-[min(68dvh,640px)] flex-1 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface-2)]/25 qt-scroll"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      >
        <div className="flex min-h-full min-w-max flex-col justify-center gap-8 p-5 sm:gap-10 sm:p-7">
          {/* Row 1: Start → Entry blocks */}
          <div className="flex items-stretch gap-0">
            <StrategyRulesBlockCard
              tone="start"
              title={t("blockStartTitle")}
              disabled
            >
              <BlockAccentText
                parts={[
                  { text: t("blockStartBody") },
                  { text: marketLabel, accent: true },
                ]}
              />
            </StrategyRulesBlockCard>
            <BlockFlowArrow />

            {value.entry.map((c, i) => (
              <div key={`entry-${i}-${c.type}`} className="flex items-stretch">
                {i > 0 ? (
                  <BlockFlowArrow label={t("rulesEntryHint")} />
                ) : null}
                <StrategyRulesBlockCard
                  tone="entry"
                  title={t(`clauseType_${c.type}` as "clauseType_ma_cross")}
                  disabled={disabled}
                  draggable={!disabled}
                  onDragStart={() => {
                    dragRef.current = { list: "entry", index: i };
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const from = dragRef.current;
                    dragRef.current = null;
                    if (!from || from.list !== "entry") return;
                    reorder("entry", from.index, i);
                  }}
                  onClick={() =>
                    !disabled && openEdit({ kind: "entry", index: i })
                  }
                >
                  <BlockAccentText
                    parts={clauseSentenceParts(c, (k) =>
                      t(k as "blockSentMa1"),
                    )}
                  />
                </StrategyRulesBlockCard>
              </div>
            ))}

            {!disabled && value.entry.length < 6 ? (
              <>
                <BlockFlowArrow />
                <button
                  type="button"
                  onClick={() =>
                    updateList("entry", [
                      ...value.entry,
                      defaultClause("ma_cross"),
                    ])
                  }
                  className="flex h-auto w-[120px] shrink-0 items-center justify-center self-center rounded-md border border-dashed border-[var(--border)] bg-[var(--panel)]/60 px-2 py-6 text-[12px] text-[var(--brand-text)] hover:border-[var(--brand)]"
                >
                  + {t("rulesAddEntry")}
                </button>
              </>
            ) : null}
          </div>

          {/* Row 2: Exit blocks */}
          <div className="flex items-stretch gap-0 pl-8">
            <div className="mr-2 flex w-6 shrink-0 flex-col items-center self-stretch">
              <div className="w-px flex-1 bg-[var(--border)]" />
              <span className="py-1 text-[9px] text-[var(--muted)]">
                {t("rulesExitHint")}
              </span>
              <div className="w-px flex-1 bg-[var(--border)]" />
            </div>

            {value.exit.map((c, i) => (
              <div key={`exit-${i}-${c.type}`} className="flex items-stretch">
                {i > 0 ? (
                  <BlockFlowArrow label={t("blockOr")} />
                ) : null}
                <StrategyRulesBlockCard
                  tone="exit"
                  title={t(`clauseType_${c.type}` as "clauseType_ma_cross")}
                  disabled={disabled}
                  draggable={!disabled}
                  onDragStart={() => {
                    dragRef.current = { list: "exit", index: i };
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const from = dragRef.current;
                    dragRef.current = null;
                    if (!from || from.list !== "exit") return;
                    reorder("exit", from.index, i);
                  }}
                  onClick={() =>
                    !disabled && openEdit({ kind: "exit", index: i })
                  }
                >
                  <BlockAccentText
                    parts={clauseSentenceParts(c, (k) =>
                      t(k as "blockSentMa1"),
                    )}
                  />
                </StrategyRulesBlockCard>
              </div>
            ))}

            {!disabled && value.exit.length < 6 ? (
              <>
                <BlockFlowArrow />
                <button
                  type="button"
                  onClick={() =>
                    updateList("exit", [
                      ...value.exit,
                      defaultClause("stop_pct"),
                    ])
                  }
                  className="flex h-auto w-[120px] shrink-0 items-center justify-center self-center rounded-md border border-dashed border-[var(--border)] bg-[var(--panel)]/60 px-2 py-6 text-[12px] text-[var(--brand-text)] hover:border-[var(--brand)]"
                >
                  + {t("rulesAddExit")}
                </button>
              </>
            ) : null}
          </div>

          {/* Row 3: Sizing */}
          <div className="flex items-stretch gap-0 pl-8">
            <StrategyRulesBlockCard
              tone="sizing"
              title={t("rulesSizing")}
              disabled={disabled}
              onClick={() => !disabled && openEdit({ kind: "sizing" })}
            >
              <BlockAccentText
                parts={sizingSentenceParts(value.sizing, (k) =>
                  t(k as "blockSentSizeCap"),
                )}
              />
            </StrategyRulesBlockCard>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[var(--muted)]">{t("rulesBlocksHint")}</p>

      <StrategyRulesBlockEditModal
        open={edit?.kind === "entry" || edit?.kind === "exit"}
        title={
          editingClause
            ? t(
                `clauseType_${editingClause.type}` as "clauseType_ma_cross",
              )
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
