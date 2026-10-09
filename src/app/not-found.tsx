import { NotFoundView } from "@/components/marketing/not-found-view";

/** Root fallback when locale segment is missing — no next-intl provider. */
export default function NotFound() {
  return (
    <NotFoundView
      title="Page not found"
      body="This page does not exist or has been moved. Head home or open the markets dashboard."
      homeLabel="Back home"
      marketsLabel="Open markets"
      ctaEnter="Open markets"
      brandName="Q-Stock"
      plainLinks
    />
  );
}
