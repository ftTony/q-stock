"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorView } from "@/components/marketing/error-view";

/**
 * `[locale]` 段的错误边界。
 *
 * 之前全项目没有 error.tsx，任何页面段抛错都会落到 Next 默认错误页：
 * 没有品牌、没有重试、只有一句 "Application error"，用户只能自己刷新。
 *
 * 文案取自 `common` / `nav` / `app` 三个命名空间——它们都在
 * `SHELL_NAMESPACES` 白名单里，所以在这个边界里一定有值，
 * 不会像当初 settings 误用 `marketing` 那样触发 MISSING_MESSAGE。
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const tApp = useTranslations("app");

  useEffect(() => {
    console.error("[locale-error]", error.digest ?? "", error);
  }, [error]);

  return (
    <ErrorView
      title={tCommon("error")}
      body={tCommon("errorBody")}
      retryLabel={tCommon("retry")}
      homeLabel={tNav("home")}
      brandName={tApp("name")}
      onRetry={reset}
      detail={process.env.NODE_ENV === "development" ? error.message : undefined}
    />
  );
}
