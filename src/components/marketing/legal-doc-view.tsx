import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { LEGAL_UPDATED, type LegalDoc } from "@/lib/legal/legal-docs";

/**
 * 法务文档通用版式（隐私政策 / 服务条款）。
 * 与免责声明页一致：内容列宽 max-w-5xl，整页不出现文档级滚动条，
 * 只有中间的文档卡片内部滚动（标题与页脚固定）。
 * 注意：ScopedMessages 由调用方页面负责包裹，便于 i18n 作用域检查。
 */
export function LegalDocView({
  doc,
  fallbackNote,
}: {
  doc: LegalDoc;
  /** 非中/英文语言时提示以英文版本为准；无则为 null。 */
  fallbackNote: string | null;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden animate-[qtFade_0.45s_ease]">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-5">
        <header className="shrink-0 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
            {doc.subtitle}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {doc.title}
          </h1>
          <p className="mt-2 font-mono text-xs tabular-nums text-[var(--muted)]">
            {doc.updatedLabel}: {LEGAL_UPDATED}
          </p>
        </header>

        {fallbackNote ? (
          <p
            className="mt-3 shrink-0 rounded-lg px-3 py-2 text-xs leading-relaxed text-[var(--muted)]"
            style={{
              background: "color-mix(in srgb, var(--panel) 60%, transparent)",
              border: "1px solid var(--border)",
            }}
            role="note"
          >
            {fallbackNote}
          </p>
        ) : null}

        <div className="mt-4 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden min-h-0 lg:block">
            <nav
              aria-label={doc.tocLabel}
              className="qt-panel flex h-full flex-col overflow-y-auto overscroll-y-contain px-4 py-4"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">
                {doc.tocLabel}
              </p>
              <ol className="mt-3 space-y-2">
                {doc.sections.map((s, i) => (
                  <li key={s.id} className="flex gap-2 text-[13px] leading-snug">
                    <span
                      aria-hidden
                      className="font-mono text-[11px] tabular-nums text-[var(--muted)]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`#${s.id}`}
                      className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="qt-panel min-h-0 min-w-0 overflow-y-auto overscroll-y-contain">
            <ul className="border-b border-[var(--border)] px-4 py-3.5 sm:px-6">
              {doc.highlights.map((h) => (
                <li
                  key={h}
                  className="flex gap-2.5 py-1 text-[13px] leading-relaxed text-[var(--muted)]"
                >
                  <span
                    aria-hidden
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-text)]"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="divide-y divide-[var(--border)]">
              {doc.sections.map((section, i) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-4 px-4 py-4 sm:px-6 sm:py-5"
                >
                  <h2 className="flex gap-3 text-[15px] font-semibold tracking-tight">
                    <span
                      aria-hidden
                      className="font-mono text-xs font-semibold tabular-nums text-[var(--brand-text)]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{section.heading}</span>
                  </h2>
                  <div className="mt-2 space-y-2.5 pl-0 sm:pl-7">
                    {section.blocks.map((block, bi) =>
                      block.kind === "p" ? (
                        <p
                          key={bi}
                          className="text-sm leading-relaxed text-[var(--foreground)] sm:leading-6"
                        >
                          {block.text}
                        </p>
                      ) : (
                        <ul key={bi} className="space-y-1.5">
                          {block.items.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2.5 text-sm leading-relaxed text-[var(--foreground)] sm:leading-6"
                            >
                              <span
                                aria-hidden
                                className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--muted)]"
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>
      <MarketingCtaBand compact />
    </div>
  );
}

/** 非中文语言的效力提示文案（中/英以外回落英文）。 */
export function legalFallbackNote(locale: string): string | null {
  if (locale === "en" || locale === "zh-CN") return null;
  if (locale === "zh-TW" || locale === "zh-HK") {
    return "本頁提供英文與簡體中文版本，內容如有歧義，以英文版本為準。";
  }
  return "This document is available in English and Simplified Chinese. In case of any discrepancy, the English version prevails.";
}
