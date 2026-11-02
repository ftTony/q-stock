/**
 * Body-portaled menus leave `.aw` / `.wb-shell` / `.settings-ui`, so they
 * inherit marketing soft `--radius-*`. Stamp a *token-only* shell on the
 * portal — never the full `.aw` class (that paints parchment `--background`).
 */
export function qtPortalShellClass(from: Element | null): string {
  if (!from) return "";
  if (from.closest(".aw, .wb-shell, .settings-ui")) {
    return "qt-portal-shell";
  }
  return "";
}
