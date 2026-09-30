import { hasLongbridgeCreds } from "@/lib/market/providers/longbridge-client";
import { isFutuConfigured } from "@/lib/market/providers/futu-http";

/**
 * Broker trading gateway (Phase 2).
 * Market data uses `@/lib/market`; live order placement will plug in here
 * via Longbridge TradeContext / Futu OpenAPI trade endpoints.
 */

export type BrokerId = "longbridge" | "futu";

export type BrokerOrderRequest = {
  symbol: string;
  assetType: "stock" | "hk" | "crypto";
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

/** Reflects env or current-request BYOK; trade wiring is still Phase 2. */
export function listBrokerGateways(): {
  id: BrokerId;
  configured: boolean;
  ready: boolean;
}[] {
  return [
    {
      id: "longbridge",
      configured: hasLongbridgeCreds(),
      ready: false,
    },
    {
      id: "futu",
      configured: isFutuConfigured(),
      ready: false,
    },
  ];
}
