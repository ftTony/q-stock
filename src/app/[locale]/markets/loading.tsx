import { PanelSkeleton } from "@/components/ui/panel-skeleton";

export default function MarketsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-[var(--surface-2)]" />
          <div className="h-3 w-56 animate-pulse rounded bg-[var(--surface-2)]" />
        </div>
        <div className="h-9 w-64 animate-pulse rounded-lg bg-[var(--surface-2)]" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <PanelSkeleton key={i} rows={2} />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <PanelSkeleton key={i} rows={5} />
        ))}
      </div>
    </div>
  );
}
