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

export function LearnArticleBody({ paragraphs }: { paragraphs: string[] }) {
  const blocks = toBlocks(paragraphs);

  return (
    <div className="w-full max-w-2xl space-y-6">
      {blocks.map((block, i) => {
        if (block.type === "lead") {
          return (
            <p
              key={i}
              className="border-l-[3px] border-[var(--brand-text)] pl-4 text-base font-medium leading-8 text-[var(--foreground)] sm:text-[17px] sm:leading-8"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "steps") {
          return (
            <ol key={i} className="grid gap-3">
              {block.items.map((step, j) => {
                const { label, body } = splitStepLabel(step);
                return (
                  <li
                    key={j}
                    className="relative overflow-hidden rounded-2xl border border-[var(--border)] p-4 sm:p-5"
                    style={{
                      background:
                        "linear-gradient(165deg, color-mix(in srgb, var(--brand) 7%, var(--panel)), var(--panel))",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                        style={{ background: "var(--brand)" }}
                      >
                        {j + 1}
                      </span>
                      <div className="min-w-0 space-y-1.5">
                        {label ? (
                          <p className="text-sm font-semibold tracking-tight text-[var(--brand-text)]">
                            {label}
                          </p>
                        ) : null}
                        <p className="text-sm leading-relaxed text-[var(--foreground)] sm:leading-7">
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
