import { Skel } from "@/components/ui/panel-skeleton";

type Props = {
  className?: string;
  label?: string;
};

/**
 * Loading chrome for the desktop plan rail — same `.aw-skel` bone as quote /
 * watchlist; canvas panel (`.aw-workbench-rail`), not parchment wash.
 */
export function SymbolDesktopRailSkeleton({
  className = "",
  label,
}: Props) {
  return (
    <aside
      role="status"
      aria-busy="true"
      aria-label={label}
      className={`aw-workbench-rail ${className}`.trim()}
    >
      <div className="shrink-0 space-y-2.5 px-3 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <Skel className="h-4 w-14" />
            <Skel className="h-3 w-24" />
          </div>
          <Skel className="h-7 w-7" />
        </div>
        <Skel className="h-7 w-28" />
        <div className="flex items-center gap-2">
          <Skel className="h-3.5 w-16" />
          <Skel className="h-3.5 w-14" />
        </div>
        <Skel className="h-3 w-40" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <Skel className="h-2.5 w-10" />
              <Skel className="h-2.5 w-14" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 gap-4 border-b border-[var(--aw-hairline,var(--border))] px-3">
        <Skel className="mb-2.5 h-3 w-10" />
        <Skel className="mb-2.5 h-3 w-10" />
        <Skel className="mb-2.5 h-3 w-10" />
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden p-3">
        <Skel className="h-3 w-full" />
        <Skel className="h-8 w-full" />
        <Skel className="h-24 w-full" />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <Skel className="h-3.5 flex-1" />
            <Skel className="h-7 w-12" />
          </div>
        ))}
      </div>
      {label ? <span className="sr-only">{label}</span> : null}
    </aside>
  );
}
