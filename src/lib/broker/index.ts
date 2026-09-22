/**
 * Broker trading gateway (Phase 2).
 * Market data uses `@/lib/market`; live order placement will plug in here
 * via Longbridge TradeContext / Futu OpenD TrdPlaceOrder.
 */

export type BrokerId = "longbridge" | "futu";

export type BrokerOrderRequest = {
  symbol: string;
  assetType: "stock" | "crypto";
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  qty: number;
  limitPrice?: number | null;
  stopPrice?: number | null;
};

export type BrokerOrderResult = {
  brokerOrderId: string;
  status: string;
  raw?: unknown;
};

export interface BrokerGateway {
  readonly id: BrokerId;
  isConfigured(): boolean;
  placeOrder(req: BrokerOrderRequest): Promise<BrokerOrderResult>;
  cancelOrder(brokerOrderId: string): Promise<void>;
}

/** Phase 1: no live broker wired. Returns null so callers keep using paper trading. */
export function getBrokerGateway(): BrokerGateway | null {
  return null;
}

export function listBrokerGateways(): {
  id: BrokerId;
  configured: boolean;
  ready: boolean;
}[] {
  return [
    {
      id: "longbridge",
      configured: Boolean(
        process.env.LONGBRIDGE_APP_KEY &&
          process.env.LONGBRIDGE_APP_SECRET &&
          process.env.LONGBRIDGE_ACCESS_TOKEN,
      ),
      ready: false, // TradeContext wiring is Phase 2
    },
    {
      id: "futu",
      configured: Boolean(
        process.env.FUTU_ACCESS_TOKEN ||
          (process.env.FUTU_APP_KEY &&
            (process.env.FUTU_PRIVATE_KEY || process.env.FUTU_PRIVATE_KEY_PATH)),
      ),
      ready: false, // Futu OpenAPI trade wiring is Phase 2
    },
  ];
}
