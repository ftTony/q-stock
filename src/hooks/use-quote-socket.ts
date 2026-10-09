"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getQuoteSocketClient,
  readQuoteWsUrl,
  type QuoteSocketStatus,
} from "@/lib/market/stream/quote-socket-client";
import {
  channelKey,
  type ServerMessage,
  type StreamChannel,
} from "@/lib/market/stream/protocol";

export function quoteWsUrl(): string | null {
  return readQuoteWsUrl();
}

export type UseQuoteChannelsResult = {
  /** WS URL configured */
  enabled: boolean;
  /** Live socket open */
  connected: boolean;
  /** Use HTTP poll: offline, reconnecting, or WS disabled */
  degraded: boolean;
  status: QuoteSocketStatus;
};

/**
 * Subscribe to quote-ws channels with shared ref-count (same symbol, many components).
 * On disconnect → `degraded=true` so callers can fall back to HTTP polling.
 */
export function useQuoteChannels(
  channels: StreamChannel[] | null | undefined,
  onMessage: (msg: ServerMessage) => void,
): UseQuoteChannelsResult {
  const enabled = Boolean(readQuoteWsUrl());
  const [status, setStatus] = useState<QuoteSocketStatus>(
    enabled ? "connecting" : "disabled",
  );
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const channelSig =
    channels?.map((c) => channelKey(c)).sort().join("|") ?? "";

  const stableChannels = useMemo(() => {
    if (!channels?.length) return [] as StreamChannel[];
    return channels.map((ch) =>
      ch.type === "indices"
        ? ({ type: "indices" } as const)
        : {
            type: "symbol" as const,
            assetType: ch.assetType,
            symbol: ch.symbol.trim().toUpperCase(),
          },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- channelSig
  }, [channelSig]);

  useEffect(() => {
    if (!enabled) {
      setStatus("disabled");
      return;
    }
    const client = getQuoteSocketClient();
    if (!client) {
      setStatus("disabled");
      return;
    }
    return client.onStatus(setStatus);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !stableChannels.length) return;
    const client = getQuoteSocketClient();
    if (!client) return;

    const listener = (msg: ServerMessage) => onMessageRef.current(msg);
    client.subscribe(stableChannels, listener);
    return () => client.unsubscribe(stableChannels, listener);
  }, [enabled, stableChannels]);

  const connected = status === "connected";
  // Poll backup whenever not fully live (disabled / connecting / reconnecting).
  const degraded = status !== "connected";

  return { enabled, connected, degraded, status };
}

/** Suggested HTTP poll interval while live vs degraded. */
export function quotePollIntervalMs(opts: {
  enabled: boolean;
  connected: boolean;
  degraded: boolean;
}): number {
  if (!opts.enabled) return 20_000;
  if (opts.connected && !opts.degraded) return 60_000;
  // reconnecting / offline — tighter backup
  return 12_000;
}
