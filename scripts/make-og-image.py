#!/usr/bin/env python3
"""生成 Open Graph / Twitter 分享图（1200×630）。

为什么用 Python 而不是 next/og：
`next/og`（ImageResponse）在构建期依赖 edge runtime 字体加载，本项目已经因为
「Google Fonts 在部分国内 host 拉取失败」放弃了 next/font，同理不引入构建期的
远程字体依赖。这里在本地一次性产出静态 PNG，构建只负责引用。

用法：python3 scripts/make-og-image.py
输出：public/og/og-default.png
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og" / "og-default.png"

BG_TOP = (6, 9, 15)
BG_BOTTOM = (13, 20, 32)
BRAND = (0, 102, 204)
WHITE = (237, 242, 255)
MUTED = (138, 152, 173)
UP = (225, 29, 72)
DOWN = (22, 163, 74)

CJK_FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"
LATIN_CANDIDATES = [
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Avenir Next.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
]


def font(size: int, latin: bool = True) -> ImageFont.FreeTypeFont:
    candidates = LATIN_CANDIDATES if latin else [CJK_FONT]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def vertical_gradient(w: int, h: int, top, bottom) -> Image.Image:
    grad = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / max(h - 1, 1)
        grad.putpixel(
            (0, y),
            tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)),
        )
    return grad.resize((w, h), Image.BILINEAR)


def draw_candles(draw: ImageDraw.ImageDraw, x0: int, y0: int, w: int, h: int) -> None:
    """右侧淡化的 K 线纹理，给分享图一点「行情」的暗示。"""
    bars = 13
    gap = w / bars
    body_w = gap * 0.42
    seed = [0.52, 0.61, 0.57, 0.68, 0.74, 0.70, 0.79, 0.72, 0.83, 0.88, 0.84, 0.93, 0.90]
    for i, level in enumerate(seed):
        cx = x0 + gap * (i + 0.5)
        prev = seed[i - 1] if i else level - 0.05
        up = level >= prev
        color = UP if up else DOWN
        alpha = 26 + i * 4
        fill = (*color, min(alpha, 90))
        body_top = y0 + h * (1 - level)
        body_h = max(h * 0.055, 6)
        # wick
        draw.line(
            [(cx, body_top - h * 0.05), (cx, body_top + body_h + h * 0.04)],
            fill=fill,
            width=3,
        )
        draw.rounded_rectangle(
            [cx - body_w / 2, body_top, cx + body_w / 2, body_top + body_h],
            radius=3,
            fill=fill,
        )


def main() -> None:
    canvas = vertical_gradient(W, H, BG_TOP, BG_BOTTOM).convert("RGBA")
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # 网格
    for gx in range(0, W, 60):
        draw.line([(gx, 0), (gx, H)], fill=(255, 255, 255, 8), width=1)
    for gy in range(0, H, 60):
        draw.line([(0, gy), (W, gy)], fill=(255, 255, 255, 8), width=1)

    # 品牌光斑
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [W * 0.55, -H * 0.45, W * 1.35, H * 0.95], fill=(*BRAND, 46)
    )
    from PIL import ImageFilter

    glow = glow.filter(ImageFilter.GaussianBlur(120))
    layer = Image.alpha_composite(layer, glow)
    draw = ImageDraw.Draw(layer)

    draw_candles(draw, int(W * 0.60), int(H * 0.30), int(W * 0.36), int(H * 0.40))

    canvas = Image.alpha_composite(canvas, layer)
    draw = ImageDraw.Draw(canvas)

    # logo
    logo = Image.open(ROOT / "public" / "logo-light.png").convert("RGBA")
    logo_size = 76
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    canvas.alpha_composite(logo, (72, 64))

    draw.text((72 + logo_size + 22, 76), "Q-Stock", font=font(46), fill=WHITE)
    draw.text(
        (72 + logo_size + 24, 132), "钱力股", font=font(24, latin=False), fill=MUTED
    )

    # 主标题
    draw.text((72, 236), "看得懂的行情", font=font(64, latin=False), fill=WHITE)
    draw.text(
        (72, 316),
        "A股 · 港股 · 美股 · 加密",
        font=font(36, latin=False),
        fill=(176, 190, 210),
    )

    # 能力清单
    bullets = ["实时报价", "模拟交易", "复盘与策略", "10 种语言"]
    bx = 74
    for item in bullets:
        draw.rounded_rectangle(
            [bx, 392, bx + 8, 400], radius=4, fill=(*BRAND, 255)
        )
        draw.text((bx + 20, 384), item, font=font(26, latin=False), fill=MUTED)
        bx += 24 + int(draw.textlength(item, font=font(26, latin=False))) + 26

    # 底部域名
    draw.line([(72, 500), (W - 72, 500)], fill=(255, 255, 255, 26), width=1)
    draw.text((72, 524), "q-stock.cn", font=font(26), fill=(150, 165, 186))
    domain_label = "多市场行情终端"
    dw = draw.textlength(domain_label, font=font(24, latin=False))
    draw.text(
        (W - 72 - dw, 526), domain_label, font=font(24, latin=False), fill=(110, 124, 145)
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
