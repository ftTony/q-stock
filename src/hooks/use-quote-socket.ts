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
  /** Hub reported Longbridge push available */
  push: boolean;
  /**
   * Prefer HTTP poll: WS offline / reconnecting / disabled,
   * or connected but push unavailable (REST-only hub).
   */
  degraded: boolean;
  status: QuoteSocketStatus;
};

/**
 * Subscribe to quote-ws channels with shared ref-count (same symbol, many components).
 * On disconnect or missing push → `degraded=true` so callers fall back to HTTP.
 */
export function useQuoteChannels(
  channels: StreamChannel[] | null | undefined,
  onMessage: (msg: ServerMessage) => void,
): UseQuoteChannelsResult {
  const enabled = Boolean(readQuoteWsUrl());
  const [status, setStatus] = useState<QuoteSocketStatus>(
    enabled ? "connecting" : "disabled",
  );
  const [push, setPush] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const channelSig =
    channels?.map((c) => channelKey(c)).sort().join("|") ?? "";

  const stableChannels = useMemo(() => {
    if (!channels?.length) return [] as StreamChannel[];
    return channels.map((ch) => {
      if (ch.type === "indices") return { type: "indices" } as const;
      return {
        type: ch.type,
        assetType: ch.assetType,
        symbol: ch.symbol.trim().toUpperCase(),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- channelSig
  }, [channelSig]);

  useEffect(() => {
    if (!enabled) {
      setStatus("disabled");
      setPush(false);
      return;
    }
    const client = getQuoteSocketClient();
    if (!client) {
      setStatus("disabled");
      setPush(false);
      return;
    }
    const offStatus = client.onStatus(setStatus);
    const offPush = client.onPush(setPush);
    return () => {
      offStatus();
      offPush();
    };
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
  // No live push → HTTP (and hub REST) must carry prices.
  const degraded = status !== "connected" || !push;

  return { enabled, connected, degraded, push, status };
}

/** Suggested HTTP poll interval while live vs degraded / no-push. */
export function quotePollIntervalMs(opts: {
  enabled: boolean;
  connected: boolean;
  degraded: boolean;
  /** When false, poll REST more often even if the socket is open. */
  push?: boolean;
}): number {
  if (!opts.enabled) return 8_000;
  const pushOk = opts.push !== false && !opts.degraded && opts.connected;
  if (pushOk) return 60_000;
  // reconnecting / offline / push unavailable — tighter REST backup
  return 5_000;
}
