import { Skel } from "@/components/ui/panel-skeleton";

/** Fixed layout mimicking a squarified treemap (percent of container). */
const TILES: Array<{ l: number; t: number; w: number; h: number }> = [
  { l: 0, t: 0, w: 36, h: 52 },
  { l: 36.5, t: 0, w: 28, h: 30 },
  { l: 65, t: 0, w: 35, h: 22 },
  { l: 65, t: 22.5, w: 17, h: 29.5 },
  { l: 82.5, t: 22.5, w: 17.5, h: 14 },
  { l: 82.5, t: 37, w: 17.5, h: 15 },
  { l: 36.5, t: 30.5, w: 14, h: 21.5 },
  { l: 51, t: 30.5, w: 13.5, h: 21.5 },
  { l: 0, t: 52.5, w: 18, h: 47.5 },
  { l: 18.5, t: 52.5, w: 17.5, h: 24 },
  { l: 18.5, t: 77, w: 17.5, h: 23 },
  { l: 36.5, t: 52.5, w: 28, h: 22 },
  { l: 36.5, t: 75, w: 13.5, h: 25 },
  { l: 50.5, t: 75, w: 14, h: 25 },
  { l: 65, t: 52.5, w: 17.5, h: 23 },
  { l: 83, t: 52.5, w: 17, h: 23 },
  { l: 65, t: 76, w: 35, h: 24 },
];

/** Treemap-shaped fill for the industry heatmap panel. */
export function IndustryHeatmapSkeleton({ label }: { label?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="absolute inset-0 bg-[var(--panel)] p-0.5"
    >
      {TILES.map((tile, i) => (
        <Skel
          key={i}
          className="absolute rounded-[2px]"
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
