import { PrismaClient } from "@prisma/client";
import { getQuote } from "../lib/finnhub/client";
import { sendAlertEmail } from "../lib/email";

const prisma = new PrismaClient();

const intervalMs = Number(process.env.ALERT_POLL_INTERVAL_MS || 45000);

async function tick() {
  const alerts = await prisma.priceAlert.findMany({
    where: { status: "active" },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!alerts.length) {
    console.info(`[alerts] no active alerts @ ${new Date().toISOString()}`);
    return;
  }

  const unique = new Map<string, { symbol: string; assetType: "stock" | "crypto" }>();
  for (const a of alerts) {
    unique.set(`${a.assetType}:${a.symbol}`, {
      symbol: a.symbol,
      assetType: a.assetType,
    });
  }

  const quotes = new Map<string, number>();
  for (const item of unique.values()) {
    try {
      const q = await getQuote(item.symbol, item.assetType);
      quotes.set(`${item.assetType}:${item.symbol}`, q.price);
    } catch (err) {
      console.error(`[alerts] quote failed ${item.symbol}`, err);
    }
  }

  for (const alert of alerts) {
    const price = quotes.get(`${alert.assetType}:${alert.symbol}`);
    if (price === undefined || Number.isNaN(price)) continue;

    const trigger = Number(alert.triggerPrice);
    const hit =
      alert.condition === "gte" ? price >= trigger : price <= trigger;
    if (!hit) continue;

    try {
      await sendAlertEmail({
        to: alert.user.email,
        symbol: alert.symbol,
        assetType: alert.assetType,
        condition: alert.condition,
        triggerPrice: trigger,
        currentPrice: price,
      });

      await prisma.$transaction([
        prisma.priceAlert.update({
          where: { id: alert.id },
          data: { status: "triggered", triggeredAt: new Date() },
        }),
        prisma.alertDeliveryLog.create({
          data: {
            alertId: alert.id,
            userId: alert.userId,
            email: alert.user.email,
            price,
          },
        }),
      ]);

      console.info(
        `[alerts] triggered ${alert.symbol} ${alert.condition} ${trigger} @ ${price}`,
      );
    } catch (err) {
      console.error(`[alerts] delivery failed ${alert.id}`, err);
    }
  }
}

async function main() {
  console.info(`[alerts] worker started, interval=${intervalMs}ms`);
  for (;;) {
    try {
      await tick();
    } catch (err) {
      console.error("[alerts] tick error", err);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
