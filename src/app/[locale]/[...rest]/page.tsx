import { notFound } from "next/navigation";

/**
 * Catch-all so unknown paths under `[locale]` call `notFound()` and render
 * `[locale]/not-found.tsx` (next-intl). Without this, Next falls through to
 * a broken root `_not-found` build (ENOENT app-build-manifest).
 */
export default function CatchAllPage() {
  notFound();
}
