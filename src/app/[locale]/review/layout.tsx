import { ScopedMessages } from "@/components/providers/scoped-messages";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * `/review` 的 page.tsx 是客户端组件，无法在自己的文件里包一层服务端 Provider，
 * 所以在这里就近下发该页需要的翻译命名空间。
 */
export default async function ReviewLayout({ children }: Props) {
  return (
    <ScopedMessages namespaces={["ai", "review"]}>{children}</ScopedMessages>
  );
}
