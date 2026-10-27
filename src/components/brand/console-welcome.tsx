"use client";

import { useEffect } from "react";

let printed = false;

type WelcomeCopy = {
  title: string;
  tagline: string;
};

const COPY: Record<"zh-CN" | "zh-TW" | "en" | "ja" | "ko", WelcomeCopy> = {
  "zh-CN": {
    title: "欢迎来到钱力股平台",
    tagline: "Qianli Gu · 规则先于结论 · 学习参考，不构成投资建议",
  },
  "zh-TW": {
    title: "歡迎來到錢力股平台",
    tagline: "Qianli Gu · 規則先於結論 · 學習參考，不構成投資建議",
  },
  en: {
    title: "Welcome to Qianli Gu",
    tagline:
      "Qianli Gu · Rules before conclusions · For learning only — not investment advice",
  },
  ja: {
    title: "銭力股へようこそ",
    tagline: "Qianli Gu · 規則を結論より先に · 学習用であり投資助言ではありません",
  },
  ko: {
    title: "전리구에 오신 것을 환영합니다",
    tagline: "Qianli Gu · 규칙이 결론보다 먼저 · 학습용이며 투자 조언이 아닙니다",
  },
};

const HEART = `
        *****           *****
     ***********     ***********
   *************** ***************
  *********************************
  *********************************
  *********************************
   *******************************
     ***************************
       ***********************
         *******************
           ***************
             ***********
               *******
                 ***
                  *
`.replace(/^\n|\n$/g, "");

function resolveCopy(): WelcomeCopy {
  const langs =
    typeof navigator !== "undefined"
      ? [...(navigator.languages ?? []), navigator.language]
      : [];
  for (const raw of langs) {
    const l = (raw || "").toLowerCase();
    if (l.startsWith("zh-tw") || l.startsWith("zh-hk") || l === "zh-hant") {
      return COPY["zh-TW"];
    }
    if (l.startsWith("zh")) return COPY["zh-CN"];
    if (l.startsWith("ja")) return COPY.ja;
    if (l.startsWith("ko")) return COPY.ko;
    if (l.startsWith("en")) return COPY.en;
  }
  return COPY.en;
}

/** One-time styled console greeting for the brand. */
export function ConsoleWelcome() {
  useEffect(() => {
    if (printed || typeof window === "undefined") return;
    printed = true;
    const { title, tagline } = resolveCopy();
    /* eslint-disable no-console -- intentional brand greeting */
    console.log(
      `%c${title}`,
      "font-size:16px;font-weight:700;color:#2563eb;padding:4px 0;",
    );
    console.log(
      `%c${HEART}`,
      "color:#e11d48;font-size:11px;line-height:1.05;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;",
    );
    console.log(`%c${tagline}`, "font-size:12px;color:#64748b;");
    /* eslint-enable no-console */
  }, []);

  return null;
}
