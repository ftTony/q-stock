/**
 * Body-portaled menus leave `.aw` / `.wb-shell` / `.settings-ui`, so they
 * inherit marketing soft `--radius-*`. Stamp the matching shell class on the
 * portal root so App 直角 tokens apply.
 */
export function qtPortalShellClass(from: Element | null): string {
  if (!from) return "";
  if (from.closest(".aw")) return "aw";
  if (from.closest(".wb-shell")) return "wb-shell";
  if (from.closest(".settings-ui")) return "settings-ui";
  return "";
}
