"use client";

import { useEffect } from "react";

/**
 * 最后一层兜底：`[locale]/layout.tsx` 自身抛错时，段级 error.tsx 不会生效，
 * 只能由根级 global-error 接管。
 *
 * 这里**不能**用 next-intl：根 layout 已被替换，`NextIntlClientProvider`
 * 不在这棵树上，`globals.css` 也未必被加载。所以文案中英并列、样式内联。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error.digest ?? "", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06090f",
          color: "#edf2ff",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
        }}
      >
        <main style={{ maxWidth: 460, padding: "0 24px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 72,
              lineHeight: 1,
              fontWeight: 600,
              color: "#0066cc",
            }}
          >
            500
          </p>
          <h1 style={{ margin: "16px 0 8px", fontSize: 22, fontWeight: 600 }}>
            应用加载失败 · Application error
          </h1>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#8a98ad" }}>
            页面没能启动。可以重试，或稍后再访问 q-stock.cn。
            <br />
            The app failed to start. Try again, or come back in a moment.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                height: 44,
                padding: "0 20px",
                borderRadius: 12,
                border: "none",
                background: "#0066cc",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              重试 · Retry
            </button>
            {/* 这里刻意用原生 <a>：应用已崩，需要整页重载而不是客户端路由跳转。
                用 next/link 会复用已经坏掉的 router 状态。 */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                height: 44,
                padding: "0 20px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#edf2ff",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              回首页 · Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
