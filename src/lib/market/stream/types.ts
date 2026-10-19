/** Server + shared re-exports (implementation lives in protocol.ts). */
export {
  channelKey,
  depthChannelKey,
  indicesChannelKey,
  parseChannelKey,
  symbolChannelKey,
  tradesChannelKey,
  type ClientMessage,
  type DepthBookWire,
  type DepthChannel,
  type IndicesChannel,
  type ServerMessage,
  type StreamChannel,
  type SymbolChannel,
  type TradeTickWire,
  type TradesChannel,
} from "@/lib/market/stream/protocol";
