import { WebSocketServer } from "ws";
import { attachClient, startQuoteHub } from "../lib/market/stream/hub";

export function quoteWsPort(): number {
  const n = Number(process.env.QUOTE_WS_PORT || 3001);
  if (!Number.isFinite(n)) return 3001;
  return Math.min(65535, Math.max(1, Math.floor(n)));
}

export function quoteWsEnabled(): boolean {
  const v = process.env.QUOTE_WS_ENABLED;
  if (v == null || v === "") return true;
  return v !== "0" && v.toLowerCase() !== "false";
}

/** Start WebSocket quote hub (idempotent). */
export async function startQuoteWsServer(): Promise<WebSocketServer | null> {
  if (!quoteWsEnabled()) {
    console.info("[quote-ws] disabled (QUOTE_WS_ENABLED=false)");
    return null;
  }

  await startQuoteHub();
  const port = quoteWsPort();
  const wss = new WebSocketServer({ port, path: "/ws/quotes" });

  wss.on("connection", (ws) => {
    attachClient(ws);
  });

  wss.on("listening", () => {
    console.info(`[quote-ws] listening ws://0.0.0.0:${port}/ws/quotes`);
  });

  wss.on("error", (err) => {
    console.error("[quote-ws] server error", err);
  });

  return wss;
}

const entry = (process.argv[1] || "").replace(/\\/g, "/");
if (/quote-ws\.(ts|js|mjs)$/.test(entry)) {
  startQuoteWsServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
