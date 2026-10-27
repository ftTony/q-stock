"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import {
  SPOTLIGHT_SCRIM,
  spotlightHoleShadow,
  spotlightTipBodyClassName,
  spotlightTipClassName,
  spotlightTipDismissClassName,
  spotlightTipMutedClassName,
  spotlightTipTitleClassName,
} from "@/components/onboarding/spotlight-chrome";

/** v2: mask tour (v1 was the in-rail card list). */
export const SYMBOL_RAIL_GUIDE_STORAGE_KEY =
  "qstock:symbol-rail-guide-dismissed:v2";

type Props = {
  onGoPlan: () => void;
  onGoOrder: () => void;
  onGoReview: () => void;
};

type Step = {
  selector: string;
  titleKey: "guidePlanTitle" | "guideOrderTitle" | "guideReviewTitle";
  bodyKey: "guidePlanBody" | "guideOrderBody" | "guideReviewBody";
  prepare: "plan" | "order" | "review";
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="rail-plan"]',
    titleKey: "guidePlanTitle",
    bodyKey: "guidePlanBody",
    prepare: "plan",
  },
  {
    selector: '[data-tour="rail-order"]',
    titleKey: "guideOrderTitle",
    bodyKey: "guideOrderBody",
    prepare: "order",
  },
  {
    selector: '[data-tour="rail-review"]',
    titleKey: "guideReviewTitle",
    bodyKey: "guideReviewBody",
    prepare: "review",
  },
];

type Hole = { top: number; left: number; width: number; height: number };

function firstVisible(selector: string): Element | null {
  const nodes = document.querySelectorAll(selector);
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    if (r.width >= 2 && r.height >= 2) return el;
  }
  return null;
}

function measure(selector: string): Hole | null {
  const el = firstVisible(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const pad = 6;
  return {
    top: Math.max(0, r.top - pad),
    left: Math.max(0, r.left - pad),
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
}

function wantsForceGuide() {
  try {
    const q = new URLSearchParams(window.location.search);
    const v = q.get("guide") ?? q.get("onboarding");
    return v === "1" || v === "true";
  } catch {
    return false;
  }
}

/** Mask tour on symbol rail: 计划 → 下单入口 → 复盘. */
export function SymbolRailGuide({ onGoPlan, onGoOrder, onGoReview }: Props) {
  const t = useTranslations("symbolRail");
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    try {
      if (wantsForceGuide()) {
        window.localStorage.removeItem(SYMBOL_RAIL_GUIDE_STORAGE_KEY);
        setActive(true);
        return;
      }
      setActive(
        window.localStorage.getItem(SYMBOL_RAIL_GUIDE_STORAGE_KEY) !== "1",
      );
    } catch {
      setActive(true);
    }
  }, []);

  const prepare = useCallback(
    (key: Step["prepare"]) => {
      if (key === "plan") onGoPlan();
      else if (key === "order") onGoOrder();
      else onGoReview();
    },
    [onGoPlan, onGoOrder, onGoReview],
  );

  const refresh = useCallback(() => {
    const step = STEPS[Math.min(index, STEPS.length - 1)];
    if (!step) {
      setHole(null);
      return;
    }
    setHole(measure(step.selector));
  }, [index]);

  useEffect(() => {
    if (!active || !mounted) return;
    prepare(STEPS[Math.min(index, STEPS.length - 1)]!.prepare);
    const timers = [40, 160, 400].map((ms) => window.setTimeout(refresh, ms));
    refresh();
    const onResize = () => refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [active, mounted, index, prepare, refresh]);

  function finish() {
    try {
      window.localStorage.setItem(SYMBOL_RAIL_GUIDE_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setActive(false);
  }

  function go(delta: number) {
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return 0;
      if (next >= STEPS.length) {
        finish();
        return i;
      }
      return next;
    });
  }

  if (!mounted || !active) return null;

  const step = STEPS[Math.min(index, STEPS.length - 1)]!;
  const tipW = Math.min(280, typeof window !== "undefined" ? window.innerWidth - 24 : 280);
  let tipTop = 80;
  let tipLeft = 12;
  if (hole && typeof window !== "undefined") {
    const below = hole.top + hole.height + 12;
    const above = hole.top - 148;
    tipTop = below + 140 < window.innerHeight ? below : Math.max(12, above);
    tipLeft = Math.min(
      window.innerWidth - tipW - 12,
      Math.max(12, hole.left + hole.width / 2 - tipW / 2),
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={t("guideDismiss")}
        className="absolute inset-0 cursor-default border-0 bg-transparent p-0"
        onClick={finish}
      />
      {hole ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl transition-all duration-200"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            boxShadow: spotlightHoleShadow(),
          }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: SPOTLIGHT_SCRIM }}
        />
      )}

      <div
        className={spotlightTipClassName}
        style={{ top: tipTop, left: tipLeft, width: tipW }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={`text-[11px] tabular-nums ${spotlightTipMutedClassName}`}>
          {index + 1} / {STEPS.length}
        </p>
        <h2 className={spotlightTipTitleClassName}>{t(step.titleKey)}</h2>
        <p className={spotlightTipBodyClassName}>{t(step.bodyKey)}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            className={spotlightTipDismissClassName}
            onClick={finish}
          >
            {t("guideDismiss")}
          </button>
          <div className="flex gap-1.5">
            {index > 0 ? (
              <button
                type="button"
                className="qt-btn qt-btn-ghost h-8 px-2.5 text-[12px]"
                onClick={() => go(-1)}
              >
                {t("guidePrev")}
              </button>
            ) : null}
            <button
              type="button"
              className="qt-btn qt-btn-primary h-8 px-2.5 text-[12px]"
              onClick={() => go(1)}
            >
              {index >= STEPS.length - 1 ? t("guideDone") : t("guideNext")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
