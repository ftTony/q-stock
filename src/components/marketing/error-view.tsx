"use client";

import { Link } from "@/i18n/routing";

type Props = {
  code?: string;
  title: string;
  body: string;
  retryLabel: string;
  homeLabel: string;
  brandName: string;
  onRetry: () => void;
  /** 仅开发环境展示的原始报错，生产环境不暴露堆栈。 */
  detail?: string;
};

/**
 * 500 / 运行时报错的兜底视图。
 *
 * 与 `NotFoundView` 共用同一套视觉（大号渐变数字 + 单列文案），
 * 差别是这里必须有「重试」——错误边界能把出错的 segment 重新挂载，
 * 而 404 只能引导跳转。所以这是客户端组件。
 */
export function ErrorView({
  code = "500",
  title,
  body,
  retryLabel,
  homeLabel,
  brandName,
  onRetry,
  detail,
}: Props) {
  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <p
        className="select-none text-[clamp(5.5rem,18vw,9rem)] font-semibold leading-none tracking-tight"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--brand) 45%, transparent), color-mix(in srgb, var(--brand-text) 14%, transparent))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
        aria-hidden
      >
        {code}
      </p>

      <div className="mt-2 max-w-lg space-y-3 animate-[qtFade_0.45s_ease]">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          {body}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <button
            type="button"
            onClick={onRetry}
            className="qt-btn qt-btn-primary inline-flex h-11 items-center justify-center px-5 text-sm"
          >
            {retryLabel}
          </button>
          <Link
            href="/"
            className="qt-btn qt-btn-ghost inline-flex h-11 items-center justify-center px-5 text-sm"
          >
            {homeLabel}
          </Link>
        </div>
        {detail ? (
          <p className="pt-2 font-mono text-[11px] leading-relaxed break-words text-[var(--muted)] opacity-70">
            {detail}
          </p>
        ) : null}
        <p className="pt-1 text-[11px] text-[var(--muted)] opacity-60">
          {brandName}
        </p>
      </div>
    </div>
  );
}
