"use client";

import { ReviewChecklist } from "@/components/review/review-checklist";
import type { ReviewContent } from "@/hooks/query/use-review-notes";

function BulletList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="text-xs font-medium text-[var(--muted)]">{title}</h3>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

type Props = {
  content: ReviewContent;
  noteId: string | null;
  labels: {
    summary: string;
    well: string;
    improve: string;
    emotions: string;
    checklist: string;
  };
};

export function ReviewAiBody({ content, noteId, labels }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-medium text-[var(--muted)]">
          {labels.summary}
        </h3>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
          {content.summary}
        </p>
      </div>
      <BulletList title={labels.well} items={content.whatWentWell} />
      <BulletList title={labels.improve} items={content.whatToImprove} />
      <BulletList title={labels.emotions} items={content.emotionFlags} />
      <ReviewChecklist
        noteId={noteId}
        items={content.nextChecklist}
        title={labels.checklist}
      />
    </div>
  );
}
