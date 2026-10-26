"use client";

import { useEffect, useState } from "react";

const storageKey = (noteId: string) => `qstock.review.checklist.${noteId}`;

type Props = {
  noteId: string | null;
  items: string[];
  title: string;
};

export function ReviewChecklist({ noteId, items, title }: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!noteId || typeof window === "undefined") {
      setChecked({});
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(noteId));
      if (raw) {
        setChecked(JSON.parse(raw) as Record<number, boolean>);
      } else {
        setChecked({});
      }
    } catch {
      setChecked({});
    }
  }, [noteId]);

  function toggle(i: number) {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      if (noteId && typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey(noteId), JSON.stringify(next));
        } catch {
          /* ignore quota */
        }
      }
      return next;
    });
  }

  if (!items?.length) return null;

  return (
    <div>
      <h3 className="text-xs font-medium text-[var(--muted)]">{title}</h3>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((item, i) => (
          <li key={`${i}-${item}`} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={Boolean(checked[i])}
              onChange={() => toggle(i)}
              aria-label={item}
            />
            <span
              className={
                checked[i] ? "text-[var(--muted)] line-through" : undefined
              }
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
