import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";

type Props = {
  copy: Pick<
    SymbolSeoCopy,
    | "intro"
    | "factsTitle"
    | "factsLine"
    | "howTitle"
    | "howSteps"
    | "learnTitle"
    | "learnBody"
    | "rulesTitle"
    | "rulesBody"
    | "disclaimer"
  >;
};

/** Shared SEO / about copy — SSR crawl + client drawer. */
export function SymbolSeoAboutBody({ copy }: Props) {
  return (
    <div className="space-y-3 text-[12px] leading-relaxed text-[var(--muted)]">
      <p>{copy.intro}</p>
      <section>
        <h2 className="font-medium text-[var(--foreground)]/85">
          {copy.factsTitle}
        </h2>
        <p className="mt-1">{copy.factsLine}</p>
      </section>
      <div>
        <h2 className="font-medium text-[var(--foreground)]/85">
          {copy.howTitle}
        </h2>
        <ol className="mt-1 list-decimal space-y-0.5 pl-4">
          {copy.howSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <section>
        <h2 className="font-medium text-[var(--foreground)]/85">
          {copy.learnTitle}
        </h2>
        <p className="mt-1">{copy.learnBody}</p>
      </section>
      <section>
        <h2 className="font-medium text-[var(--foreground)]/85">
          {copy.rulesTitle}
        </h2>
        <p className="mt-1">{copy.rulesBody}</p>
      </section>
      <p className="text-[11px]">{copy.disclaimer}</p>
    </div>
  );
}
