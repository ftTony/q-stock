import { ScopedMessages } from "@/components/providers/scoped-messages";

type Props = {
  children: React.ReactNode;
};

/** `/strategies` pages are client components; scope i18n here. */
export default function StrategiesLayout({ children }: Props) {
  return (
    <ScopedMessages namespaces={["strategies"]}>{children}</ScopedMessages>
  );
}
