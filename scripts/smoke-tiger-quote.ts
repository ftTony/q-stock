import { PrismaClient } from "@prisma/client";
import { decryptJson } from "@/lib/crypto/secret-box";
import { runWithMarketCreds } from "@/lib/market/creds-context";
import type { TigerBearerCreds } from "@/lib/market/creds-types";
import { tigerProvider } from "@/lib/market/providers/tiger";

const prisma = new PrismaClient();

async function main() {
  const row = await prisma.userMarketCredential.findFirst({
    where: { provider: "tiger" },
    orderBy: { updatedAt: "desc" },
  });
  if (!row) {
    console.log("smoke: no tiger user credential in DB — skip live quote");
    return;
  }

  const creds = decryptJson<TigerBearerCreds>(row.payload);
  if (!creds?.accessToken) {
    console.log("smoke: tiger payload missing accessToken — skip");
    return;
  }

  const quote = await runWithMarketCreds(
    {
      userId: row.userId,
      equityVendor: "tiger",
      brokerCredsSource: "user",
      tiger: creds,
    },
    () => tigerProvider.getQuote("AAPL", "stock"),
  );
  console.log("smoke:quote", {
    symbol: quote.symbol,
    price: quote.price,
    source: quote.source,
    pct: quote.percentChange,
  });
}

main()
  .catch((err) => {
    console.error(
      "smoke:failed",
      err instanceof Error ? err.message : String(err),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
