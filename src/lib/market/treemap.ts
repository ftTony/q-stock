/**
 * Squarified treemap layout (Bruls et al.).
 * Input weights → absolute pixel rects inside [0,0,width,height].
 */

export type TreemapNode = {
  id: string;
  weight: number;
  /** Passthrough payload */
  data: unknown;
};

export type TreemapRect = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data: unknown;
};

type Box = { x: number; y: number; w: number; h: number };

function worst(row: number[], length: number): number {
  if (!row.length || length <= 0) return Infinity;
  const sum = row.reduce((a, b) => a + b, 0);
  if (!(sum > 0)) return Infinity;
  const max = Math.max(...row);
  const min = Math.min(...row);
  if (!(min > 0)) return Infinity;
  const s2 = sum * sum;
  const l2 = length * length;
  return Math.max((l2 * max) / s2, s2 / (l2 * min));
}

function layoutRow(
  row: { id: string; area: number; data: unknown }[],
  box: Box,
  horizontal: boolean,
): TreemapRect[] {
  const sum = row.reduce((a, b) => a + b.area, 0);
  const out: TreemapRect[] = [];
  if (horizontal) {
    const rowH = box.w > 0 ? sum / box.w : 0;
    let x = box.x;
    for (const item of row) {
      const w = rowH > 0 ? item.area / rowH : 0;
      out.push({ id: item.id, x, y: box.y, w, h: rowH, data: item.data });
      x += w;
    }
  } else {
    const rowW = box.h > 0 ? sum / box.h : 0;
    let y = box.y;
    for (const item of row) {
      const h = rowW > 0 ? item.area / rowW : 0;
      out.push({ id: item.id, x: box.x, y, w: rowW, h, data: item.data });
      y += h;
    }
  }
  return out;
}

export function squarify(
  nodes: TreemapNode[],
  width: number,
  height: number,
  gap = 1,
): TreemapRect[] {
  const total = nodes.reduce((a, n) => a + Math.max(0, n.weight), 0);
  if (!nodes.length || total <= 0 || width <= 0 || height <= 0) return [];

  const areaTotal = width * height;
  const items = nodes
    .map((n) => ({
      id: n.id,
      area: (Math.max(0, n.weight) / total) * areaTotal,
      data: n.data,
    }))
    .filter((n) => n.area > 0)
    .sort((a, b) => b.area - a.area);

  const result: TreemapRect[] = [];
  let box: Box = { x: 0, y: 0, w: width, h: height };
  let row: typeof items = [];

  const flush = () => {
    if (!row.length) return;
    const horizontal = box.w >= box.h;
    const side = horizontal ? box.w : box.h;
    const rects = layoutRow(row, box, horizontal);
    const used = row.reduce((a, b) => a + b.area, 0);
    if (horizontal) {
      const rowH = side > 0 ? used / side : 0;
      box = { x: box.x, y: box.y + rowH, w: box.w, h: box.h - rowH };
    } else {
      const rowW = side > 0 ? used / side : 0;
      box = { x: box.x + rowW, y: box.y, w: box.w - rowW, h: box.h };
    }
    result.push(...rects);
    row = [];
  };

  for (const item of items) {
    const side = box.w >= box.h ? box.w : box.h;
    const next = [...row.map((r) => r.area), item.area];
    if (row.length && worst(next, side) > worst(row.map((r) => r.area), side)) {
      flush();
    }
    row.push(item);
  }
  flush();

  // apply gap by shrinking each rect slightly
  if (gap <= 0) return result;
  return result.map((r) => ({
    ...r,
    x: r.x + gap / 2,
    y: r.y + gap / 2,
    w: Math.max(0, r.w - gap),
    h: Math.max(0, r.h - gap),
  }));
}
