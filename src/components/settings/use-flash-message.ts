"use client";

import { useEffect, useState } from "react";

export type FlashKind = "ok" | "error";

/** Ephemeral status line for settings forms (auto-clears). */
export function useFlashMessage(ttlMs = 3500) {
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<FlashKind>("ok");

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), ttlMs);
    return () => clearTimeout(timer);
  }, [message, ttlMs]);

  function flash(kind: FlashKind, text: string) {
    setMessageKind(kind);
    setMessage(text);
  }

  function clearFlash() {
    setMessage(null);
  }

  return { message, messageKind, flash, clearFlash };
}
