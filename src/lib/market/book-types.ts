/** Browser-safe depth / tick shapes (no Longbridge / Node imports). */

export type DepthLevel = {
  price: number;
  volume: number;
  orderNum: number;
};

export type DepthBook = {
  bids: DepthLevel[];
  asks: DepthLevel[];
};

export type TradeTick = {
  price: number;
  volume: number;
  time: number;
  direction: "up" | "down" | "neutral";
};
