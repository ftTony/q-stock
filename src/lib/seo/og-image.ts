import { siteOrigin } from "@/lib/seo/site-url";

/**
 * 分享图（Open Graph / Twitter）。
 *
 * 图片由 `scripts/make-og-image.py` 本地生成到 `public/og/og-default.png`，
 * 不依赖 `next/og` 的构建期远程字体加载（同 `next/font` 的取舍原因）。
 *
 * 注意：`twitter.card` 声明的是 `summary_large_image`，若不给 `images`，
 * X/Twitter 会退化成纯文本卡，等于白声明——所以 images 必须与 card 成对出现。
 */
export const OG_IMAGE = {
  path: "/og/og-default.png",
  width: 1200,
  height: 630,
  type: "image/png",
} as const;

/**
 * 与 Next 的 `OGImage` 结构对齐的最小类型。
 * 不用 `Metadata["openGraph"]["images"][number]` 取类型——那个位置是
 * `OGImage | OGImage[] | string | URL | null` 的联合，取下标不成立。
 */
type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
};

export function ogImages(alt: string): OgImage[] {
  return [
    {
      url: `${siteOrigin()}${OG_IMAGE.path}`,
      width: OG_IMAGE.width,
      height: OG_IMAGE.height,
      type: OG_IMAGE.type,
      alt,
    },
  ];
}
