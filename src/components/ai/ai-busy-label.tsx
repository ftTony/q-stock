"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/submit-button";

/** Inline spinner + elapsed seconds for AI panels without a button. */
export function AiBusyLabel(props: { className?: string }) {
  const t = useTranslations("ai");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);
    const started = Date.now();
    const id = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - started) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p
      role="status"
      aria-busy="true"
      className={`inline-flex items-center gap-2 text-[14px] text-[var(--muted)] ${props.className ?? ""}`}
    >
      <Spinner />
      <span>{t("elapsed", { seconds })}</span>
    </p>
  );
}
