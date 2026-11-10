"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MinePage } from "@/components/settings/mine-page";
import type { SettingsSection } from "@/components/settings/settings-panel";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";

const SECTIONS = new Set<SettingsSection>([
  "general",
  "trading",
  "market",
  "notifications",
  "account",
  "feedback",
  "about",
]);

function MinePageInner() {
  const searchParams = useSearchParams();
  const setupKeys = searchParams.get("setupKeys") === "1";
  const raw = searchParams.get("section");
  const section =
    raw && SECTIONS.has(raw as SettingsSection)
      ? (raw as SettingsSection)
      : setupKeys
        ? "market"
        : null;
  return <MinePage setupKeys={setupKeys} section={section} />;
}

export default function MineRoutePage() {
  return (
    <Suspense fallback={<PanelSkeleton rows={6} />}>
      <MinePageInner />
    </Suspense>
  );
}
