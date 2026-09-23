import { PrismaClient } from "@prisma/client";
import { getQuote } from "../lib/market";
import { sendAlertEmail } from "../lib/email";
import {
  fillPendingOrder,
  shouldTriggerPending,
  TradingError,
} from "../lib/trading/execute";

const prisma = new PrismaClient();

const intervalMs = Number(process.env.ALERT_POLL_INTERVAL_MS || 45000);

async function tickAlerts() {
  const alerts = await prisma.priceAlert.findMany({
    where: { status: "active" },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!alerts.length) {
    console.info(`[alerts] no active alerts @ ${new Date().toISOString()}`);
    return;
  }

  const unique = new Map<string, { symbol: string; assetType: "stock" | "hk" | "crypto" }>();
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

async function tickPaperOrders() {
  const pending = await prisma.paperOrder.findMany({
    where: { status: "pending", type: { in: ["limit", "stop"] } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  if (!pending.length) {
    console.info(`[trading] no pending orders @ ${new Date().toISOString()}`);
    return;
  }

  const unique = new Map<string, { symbol: string; assetType: "stock" | "hk" | "crypto" }>();
  for (const o of pending) {
    unique.set(`${o.assetType}:${o.symbol}`, {
      symbol: o.symbol,
      assetType: o.assetType,
    });
  }

  const quotes = new Map<string, number>();
  for (const item of unique.values()) {
    try {
      const q = await getQuote(item.symbol, item.assetType);
      quotes.set(`${item.assetType}:${item.symbol}`, q.price);
    } catch (err) {
      console.error(`[trading] quote failed ${item.symbol}`, err);
    }
  }

  for (const order of pending) {
    const price = quotes.get(`${order.assetType}:${order.symbol}`);
    if (price === undefined || Number.isNaN(price) || !(price > 0)) continue;

    const hit = shouldTriggerPending({
      type: order.type as "limit" | "stop",
      side: order.side,
      price,
      limitPrice: order.limitPrice != null ? Number(order.limitPrice) : null,
      stopPrice: order.stopPrice != null ? Number(order.stopPrice) : null,
    });
    if (!hit) continue;

    try {
      const filled = await fillPendingOrder(order.id, price);
      if (filled) {
        console.info(
          `[trading] filled ${order.side} ${order.type} ${order.symbol} qty=${order.qty} @ ${price}`,
        );
      }
    } catch (err) {
      if (err instanceof TradingError) {
        await prisma.paperOrder.update({
          where: { id: order.id },
          data: {
            status: "rejected",
            rejectReason: err.message,
          },
        });
        console.warn(
          `[trading] rejected ${order.id}: ${err.message}`,
        );
      } else {
        console.error(`[trading] fill failed ${order.id}`, err);
      }
    }
  }
}

async function tick() {
  await tickAlerts();
  await tickPaperOrders();
}

async function main() {
  console.info(`[worker] started, interval=${intervalMs}ms`);
  for (;;) {
    try {
      await tick();
    } catch (err) {
      console.error("[worker] tick error", err);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
