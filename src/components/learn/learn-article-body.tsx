import { LearnIndicatorIllustration } from "@/components/learn/learn-indicator-illustration";
import { LearnStrategyWalkthrough } from "@/components/learn/learn-strategy-walkthrough";
import type { LearnBlock } from "@/lib/learn/types";

type Block =
  | { type: "lead"; text: string }
  | { type: "p"; text: string }
  | { type: "steps"; items: string[] };

const CN_STEP = /^[一二三四五六七八九十]、\s*/;
const WEST_STEP = /^\d+[.)]\s*/;

function isStep(text: string) {
  return CN_STEP.test(text) || WEST_STEP.test(text);
}

function stripStepPrefix(text: string) {
  return text.replace(CN_STEP, "").replace(WEST_STEP, "");
}

function splitEmbeddedSteps(text: string): string[] | null {
  const cn = text
    .split(/(?=[一二三四五六七八九十]、)/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (cn.length >= 2 && CN_STEP.test(cn[0]!)) return cn.map(stripStepPrefix);

  const western = text
    .split(/(?=\d+[.)]\s)/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (western.length >= 2 && WEST_STEP.test(western[0]!)) {
    return western.map(stripStepPrefix);
  }
  return null;
}

/** Prefer "标题：正文" / "Title: body" split for step cards. */
function splitStepLabel(text: string): { label: string; body: string } {
  const idx = text.search(/[：:]/);
  if (idx > 0 && idx < 16) {
    return {
      label: text.slice(0, idx).trim(),
      body: text.slice(idx + 1).trim(),
    };
  }
  return { label: "", body: text };
}

function toBlocks(paragraphs: string[]): Block[] {
  if (paragraphs.length === 0) return [];

  const [lead, ...rest] = paragraphs;
  const blocks: Block[] = [{ type: "lead", text: lead! }];

  let i = 0;
  while (i < rest.length) {
    const para = rest[i]!;

    if (isStep(para)) {
      const items: string[] = [];
      while (i < rest.length && isStep(rest[i]!)) {
        items.push(stripStepPrefix(rest[i]!));
        i += 1;
      }
      blocks.push({ type: "steps", items });
      continue;
    }

    const embedded = splitEmbeddedSteps(para);
    if (embedded) {
      blocks.push({ type: "steps", items: embedded });
      i += 1;
      continue;
    }

    blocks.push({ type: "p", text: para });
    i += 1;
  }

  return blocks;
}

function headingId(text: string, index: number) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `s${index}${base ? `-${base}` : ""}`;
}

/** Rich body: headings, lists and tables give crawlers a real document outline. */
function RichBlocks({
  blocks,
  illustrationSlug,
  locale,
}: {
  blocks: LearnBlock[];
  illustrationSlug?: string;
  locale: string;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          const isLead = i === 0;
          return (
            <div key={i}>
              <p
                className={
                  isLead
                    ? "border-l-[3px] border-[var(--brand-text)] pl-4 text-base font-medium leading-8 text-[var(--foreground)] sm:text-[17px] sm:leading-8"
                    : "text-[15px] leading-7 text-[var(--foreground)]/90"
                }
              >
                {block.text}
              </p>
              {isLead && illustrationSlug?.startsWith("strategy-") ? (
                <LearnStrategyWalkthrough locale={locale} />
              ) : isLead && illustrationSlug ? (
                <LearnIndicatorIllustration
                  slug={illustrationSlug}
                  locale={locale}
                />
              ) : null}
            </div>
          );
        }

        if (block.type === "h2") {
          return (
            <h2
              key={i}
              id={headingId(block.text, i)}
              className="scroll-mt-24 pt-2 text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={i} className="space-y-2 pl-1">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="flex gap-3 text-[15px] leading-7 text-[var(--foreground)]/90"
                >
                  <span
                    aria-hidden
                    className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--brand-text)" }}
                  />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "table") {
          return (
            <figure key={i} className="space-y-2">
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr style={{ background: "var(--brand-soft)" }}>
                      {block.head.map((cell, j) => (
                        <th
                          key={j}
                          scope="col"
                          className="whitespace-nowrap px-3 py-2.5 font-semibold text-[var(--brand-text)]"
                        >
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j} className="border-t border-[var(--border)]">
                        {row.map((cell, k) => (
                          <td
                            key={k}
                            className="px-3 py-2.5 align-top leading-6 text-[var(--foreground)]/90"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {block.caption ? (
                <figcaption className="text-[11px] leading-relaxed text-[var(--muted)]">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        return (
          <p
            key={i}
            className="rounded-xl border-l-[3px] px-4 py-3 text-[13px] leading-6 text-[var(--muted)]"
            style={{
              borderColor: "var(--border)",
              background: "color-mix(in srgb, var(--surface-2) 60%, transparent)",
            }}
          >
            {block.text}
          </p>
        );
      })}
    </>
  );
}

export function LearnArticleBody({
  paragraphs,
  sections,
  illustrationSlug,
  locale,
}: {
  paragraphs: string[];
  sections?: LearnBlock[];
  illustrationSlug?: string;
  locale: string;
}) {
  if (sections?.length) {
    return (
      <div className="w-full max-w-2xl space-y-6">
        <RichBlocks
          blocks={sections}
          illustrationSlug={illustrationSlug}
          locale={locale}
        />
      </div>
    );
  }

  const blocks = toBlocks(paragraphs);

  return (
    <div className="w-full max-w-2xl space-y-6">
      {blocks.map((block, i) => {
        if (block.type === "lead") {
          return (
            <div key={i}>
              <p className="border-l-[3px] border-[var(--brand-text)] pl-4 text-base font-medium leading-8 text-[var(--foreground)] sm:text-[17px] sm:leading-8">
                {block.text}
              </p>
              {illustrationSlug?.startsWith("strategy-") ? (
                <LearnStrategyWalkthrough locale={locale} />
              ) : illustrationSlug ? (
                <LearnIndicatorIllustration
                  slug={illustrationSlug}
                  locale={locale}
                />
              ) : null}
            </div>
          );
        }

        if (block.type === "steps") {
          return (
            <ol key={i} className="grid gap-4 sm:gap-5">
              {block.items.map((step, j) => {
                const { label, body } = splitStepLabel(step);
                return (
                  <li
                    key={j}
                    className="relative overflow-hidden rounded-2xl border border-[var(--border)] p-5 sm:min-h-[6.5rem] sm:p-6"
                    style={{
                      background:
                        "linear-gradient(165deg, color-mix(in srgb, var(--brand) 7%, var(--panel)), var(--panel))",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white"
                        style={{ background: "var(--brand)" }}
                      >
                        {j + 1}
                      </span>
                      <div className="min-w-0 space-y-2 pt-0.5">
                        {label ? (
                          <p className="text-[15px] font-semibold tracking-tight text-[var(--brand-text)] sm:text-base">
                            {label}
                          </p>
                        ) : null}
                        <p className="text-[15px] leading-7 text-[var(--foreground)] sm:text-base sm:leading-8">
                          {body}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          );
        }

        return (
          <p
            key={i}
            className="text-[15px] leading-7 text-[var(--foreground)]/90"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
