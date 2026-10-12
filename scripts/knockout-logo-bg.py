"""Make logo PNG square backgrounds transparent."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public"


def flood_clear(im: Image.Image, *, tol: int) -> int:
    w, h = im.size
    px = im.load()
    samples = [
        px[0, 0],
        px[w - 1, 0],
        px[0, h - 1],
        px[w - 1, h - 1],
        px[3, 3],
        px[w - 4, 3],
    ]
    opaque = [s for s in samples if s[3] > 200] or samples
    br = sum(s[0] for s in opaque) // len(opaque)
    bg = sum(s[1] for s in opaque) // len(opaque)
    bb = sum(s[2] for s in opaque) // len(opaque)

    def is_bg(c: tuple[int, int, int, int]) -> bool:
        if c[3] == 0:
            return True
        return (
            abs(c[0] - br) <= tol
            and abs(c[1] - bg) <= tol
            and abs(c[2] - bb) <= tol
        )

    visited = [[False] * h for _ in range(w)]
    stack: list[tuple[int, int]] = []
    for x in range(w):
        stack += [(x, 0), (x, h - 1)]
    for y in range(h):
        stack += [(0, y), (w - 1, y)]

    cleared = 0
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or visited[x][y]:
            continue
        visited[x][y] = True
        c = px[x, y]
        if not is_bg(c):
            continue
        if c[3] != 0:
            px[x, y] = (c[0], c[1], c[2], 0)
            cleared += 1
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                stack.append((nx, ny))
    return cleared


def clear_enclosed_dark(im: Image.Image, *, luma_max: int = 24) -> int:
    """Remove near-black low-chroma fills enclosed by the mark (dark theme)."""
    px = im.load()
    w, h = im.size
    cleared = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            luma = (r * 299 + g * 587 + b * 114) // 1000
            if luma <= luma_max and (max(r, g, b) - min(r, g, b)) < 36:
                px[x, y] = (r, g, b, 0)
                cleared += 1
    return cleared


def main() -> None:
    light = ROOT / "logo-light.png"
    dark = ROOT / "logo-dark.png"

    im = Image.open(light).convert("RGBA")
    n = flood_clear(im, tol=40)
    im.save(light, optimize=True)
    print(f"logo-light.png: cleared {n}; corner={im.getpixel((0, 0))}")

    im = Image.open(dark).convert("RGBA")
    n1 = flood_clear(im, tol=48)
    n2 = clear_enclosed_dark(im)
    im.save(dark, optimize=True)
    print(
        f"logo-dark.png: edge {n1}, enclosed-dark {n2}; corner={im.getpixel((0, 0))}"
    )

    cn = ROOT / "logo-cn.png"
    cn.write_bytes(light.read_bytes())
    print("logo-cn.png synced from logo-light.png")

    for bak in ROOT.glob("logo-*.opaque.bak.png"):
        bak.unlink()
        print(f"removed {bak.name}")


if __name__ == "__main__":
    main()
