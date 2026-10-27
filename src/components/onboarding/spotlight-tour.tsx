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

/** v2: mask tour (v1 was the old card banner). */
export const PATH_GUIDE_STORAGE_KEY = "qstock:path-guide-dismissed:v2";

type Step = {
  selector: string;
  titleKey: string;
  bodyKey: string;
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="nav-watchlist"]',
    titleKey: "stepWatchTitle",
    bodyKey: "stepWatchBody",
  },
  {
    selector: '[data-tour="nav-alerts"]',
    titleKey: "stepAlertTitle",
    bodyKey: "stepAlertBody",
  },
  {
    selector: '[data-tour="nav-portfolio"]',
    titleKey: "stepPaperTitle",
    bodyKey: "stepPaperBody",
  },
  {
    selector: '[data-tour="nav-review"]',
    titleKey: "stepReviewTitle",
    bodyKey: "stepReviewBody",
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

function resolveSteps(): Step[] {
  return STEPS.filter((s) => firstVisible(s.selector));
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

/** Masked product tour: highlight nav areas with step copy. */
export function SpotlightTour({
  forceShow = false,
}: {
  forceShow?: boolean;
}) {
  const t = useTranslations("pathGuide");
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [hole, setHole] = useState<Hole | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    try {
      if (wantsForceGuide()) {
        window.localStorage.removeItem(PATH_GUIDE_STORAGE_KEY);
        setActive(true);
        return;
      }
      const dismissed =
        window.localStorage.getItem(PATH_GUIDE_STORAGE_KEY) === "1";
      setActive(forceShow || !dismissed);
    } catch {
      setActive(true);
    }
  }, [forceShow]);

  const refresh = useCallback(() => {
    const next = resolveSteps();
    setSteps(next);
    if (next.length === 0) {
      setHole(null);
      return;
    }
    const safeIndex = Math.min(index, next.length - 1);
    if (safeIndex !== index) setIndex(safeIndex);
    setHole(measure(next[safeIndex]!.selector));
  }, [index]);

  useEffect(() => {
    if (!active || !mounted) return;
    refresh();
    const onResize = () => refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    // Sidebar / auth chrome may paint after first frame.
    const timers = [80, 240, 600, 1200].map((ms) =>
      window.setTimeout(refresh, ms),
    );
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [active, mounted, refresh]);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  function finish() {
    try {
      window.localStorage.setItem(PATH_GUIDE_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setActive(false);
  }

  function go(delta: number) {
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return 0;
      if (next >= steps.length) {
        finish();
        return i;
      }
      return next;
    });
  }

  if (!mounted || !active || steps.length === 0) return null;

  const step = steps[Math.min(index, steps.length - 1)]!;
  const tipW = Math.min(280, window.innerWidth - 24);
  let tipTop = 80;
  let tipLeft = 12;
  if (hole) {
    const below = hole.top + hole.height + 12;
    const above = hole.top - 148;
    tipTop =
      below + 140 < window.innerHeight
        ? below
        : Math.max(12, above);
    tipLeft = Math.min(
      window.innerWidth - tipW - 12,
      Math.max(12, hole.left + hole.width / 2 - tipW / 2),
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      {/* Full catcher: box-shadow hole alone does not receive outside clicks */}
      <button
        type="button"
        aria-label={t("dismiss")}
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
          {index + 1} / {steps.length}
        </p>
        <h2 className={spotlightTipTitleClassName}>{t(step.titleKey)}</h2>
        <p className={spotlightTipBodyClassName}>{t(step.bodyKey)}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            className={spotlightTipDismissClassName}
            onClick={finish}
          >
            {t("dismiss")}
          </button>
          <div className="flex gap-1.5">
            {index > 0 ? (
              <button
                type="button"
                className="qt-btn qt-btn-ghost h-8 px-2.5 text-[12px]"
                onClick={() => go(-1)}
              >
                {t("prev")}
              </button>
            ) : null}
            <button
              type="button"
              className="qt-btn qt-btn-primary h-8 px-2.5 text-[12px]"
              onClick={() => go(1)}
            >
              {index >= steps.length - 1 ? t("done") : t("next")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
