import type { ReactNode } from "react";

/**
 * Pass-through root layout so Next can emit `_not-found` correctly.
 * Real `<html>` / `<body>` live in `[locale]/layout.tsx` (see next-intl).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
