"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { StrategyRulesEditor } from "@/components/strategy/strategy-rules-editor";
import { strategyRulesToPython } from "@/lib/strategy/rules-to-python";
import type { StrategyRules } from "@/lib/strategy/rules";

export type RulesMode = "blocks" | "code";
type CodeFormat = "python" | "json";

type Props = {
  canEdit: boolean;
  mode: RulesMode;
  onModeChange: (mode: RulesMode) => void;
  rules: StrategyRules | null;
  rulesJson: string;
  onRulesChange: (next: StrategyRules) => void;
  onRulesJsonChange: (json: string) => void;
};

export function StrategyDetailRulesPanel({
  canEdit,
  mode,
  onModeChange,
  rules,
  rulesJson,
  onRulesChange,
  onRulesJsonChange,
}: Props) {
  const t = useTranslations("strategies");
  const [codeFormat, setCodeFormat] = useState<CodeFormat>("python");

  const python = useMemo(
    () => (rules ? strategyRulesToPython(rules) : ""),
    [rules],
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3">
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[14px] font-medium">{t("rules")}</h2>
          <div className="inline-flex rounded-md border border-[var(--border)] p-0.5 text-[13px]">
            <button
              type="button"
              className={`rounded px-2.5 py-1 ${
                mode === "blocks"
                  ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => onModeChange("blocks")}
            >
              {t("rulesModeBlocks")}
            </button>
            <button
              type="button"
              className={`rounded px-2.5 py-1 ${
                mode === "code"
                  ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => onModeChange("code")}
            >
              {t("rulesModeCode")}
            </button>
          </div>
          {mode === "code" ? (
            <div className="inline-flex rounded-md border border-[var(--border)] p-0.5 text-[13px]">
              <button
                type="button"
                className={`rounded px-2.5 py-1 ${
                  codeFormat === "python"
                    ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setCodeFormat("python")}
              >
                Python
              </button>
              <button
                type="button"
                className={`rounded px-2.5 py-1 ${
                  codeFormat === "json"
                    ? "bg-[var(--brand-soft)] font-medium text-[var(--brand-text)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setCodeFormat("json")}
              >
                JSON
              </button>
            </div>
          ) : null}
        </div>
        <Link
          href="/tools/position"
          className="text-[13px] text-[var(--brand-text)] hover:underline"
        >
          {t("positionLink")}
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        {mode === "blocks" ? (
          rules ? (
            <StrategyRulesEditor
              value={rules}
              disabled={!canEdit}
              onChange={onRulesChange}
            />
          ) : (
            <p className="text-[12px] text-[var(--muted)]">{t("rulesInvalid")}</p>
          )
        ) : codeFormat === "python" ? (
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <pre className="qt-scroll min-h-[min(68dvh,640px)] flex-1 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface-2)]/30 p-2.5 font-mono text-[11px] leading-relaxed text-[var(--foreground)]">
              {python || t("rulesInvalid")}
            </pre>
            {python ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="text-[11px] font-medium text-[var(--brand-text)] hover:underline"
                  onClick={() => {
                    void navigator.clipboard?.writeText(python);
                  }}
                >
                  {t("rulesCopyPython")}
                </button>
                <p className="text-[10px] text-[var(--muted)]">
                  {t("rulesPythonHint")}
                </p>
              </div>
            ) : null}
          </div>
        ) : canEdit ? (
          <textarea
            className="qt-input qt-scroll min-h-[min(68dvh,640px)] w-full flex-1 overflow-auto p-2.5 font-mono text-[11px] leading-relaxed"
            value={rulesJson}
            onChange={(e) => onRulesJsonChange(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <pre className="qt-scroll min-h-[min(68dvh,640px)] flex-1 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface-2)]/30 p-2.5 font-mono text-[11px] leading-relaxed">
            {rulesJson}
          </pre>
        )}
        {canEdit && mode === "code" && codeFormat === "json" ? (
          <p className="mt-1.5 shrink-0 text-[10px] text-[var(--muted)]">
            {t("rulesEditHint")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
