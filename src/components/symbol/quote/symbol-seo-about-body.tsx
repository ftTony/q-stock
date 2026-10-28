import type { SymbolSeoCopy } from "@/lib/seo/symbol-metadata";

type Props = {
  copy: Pick<
    SymbolSeoCopy,
    "intro" | "howTitle" | "howSteps" | "disclaimer"
  >;
};

/** Shared SEO / about copy — SSR crawl + client drawer. */
export function SymbolSeoAboutBody({ copy }: Props) {
  return (
    <div className="space-y-2 text-[12px] leading-relaxed text-[var(--muted)]">
      <p>{copy.intro}</p>
      <div>
        <p className="font-medium text-[var(--foreground)]/85">{copy.howTitle}</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-4">
          {copy.howSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <p className="text-[11px]">{copy.disclaimer}</p>
    </div>
  );
}
