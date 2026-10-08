"use client";

import { useEffect, useState } from "react";

/** false on SSR + first client paint; true after mount (safe for theme / locale UI). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
