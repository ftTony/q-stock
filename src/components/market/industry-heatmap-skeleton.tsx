import { Skel } from "@/components/ui/panel-skeleton";

/**
 * Flush treemap mock — tiles touch container edges; hairline gaps only between cells.
 * Percent boxes leave a 0.4% channel between neighbors (no outer inset).
 */
const TILES: Array<{ l: number; t: number; w: number; h: number }> = [
  { l: 0, t: 0, w: 36, h: 52 },
  { l: 36.4, t: 0, w: 28.2, h: 30 },
  { l: 65, t: 0, w: 35, h: 22 },
  { l: 65, t: 22.4, w: 17.2, h: 29.6 },
  { l: 82.6, t: 22.4, w: 17.4, h: 14.2 },
  { l: 82.6, t: 37, w: 17.4, h: 15 },
  { l: 36.4, t: 30.4, w: 14, h: 21.6 },
  { l: 50.8, t: 30.4, w: 13.8, h: 21.6 },
  { l: 0, t: 52.4, w: 18, h: 47.6 },
  { l: 18.4, t: 52.4, w: 17.6, h: 24.2 },
  { l: 18.4, t: 77, w: 17.6, h: 23 },
  { l: 36.4, t: 52.4, w: 28.2, h: 22.2 },
  { l: 36.4, t: 75, w: 13.8, h: 25 },
  { l: 50.6, t: 75, w: 14, h: 25 },
  { l: 65, t: 52.4, w: 17.2, h: 23.2 },
  { l: 82.6, t: 52.4, w: 17.4, h: 23.2 },
  { l: 65, t: 76, w: 35, h: 24 },
];

/** Treemap-shaped fill for the industry heatmap panel. */
export function IndustryHeatmapSkeleton({ label }: { label?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="absolute inset-0 bg-[var(--panel)]"
    >
      {TILES.map((tile, i) => (
        <Skel
          key={i}
          className="absolute rounded-none"
          style={{
            left: `${tile.l}%`,
            top: `${tile.t}%`,
            width: `${tile.w}%`,
            height: `${tile.h}%`,
            animationDelay: `${(i % 7) * 70}ms`,
          }}
        />
      ))}
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
