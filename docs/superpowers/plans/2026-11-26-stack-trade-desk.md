# Stack bottom「交易」→ 模拟交易台

## Goal
Replace stack trade ticket with account desk (图一): left account + tabs 持仓 / 订单 / 历史订单 / 交易.
Order entry stays in side dock (option 1).

## Files
- `src/components/symbol/trade-desk/symbol-trade-desk.tsx` — shell + tabs
- `src/components/symbol/trade-desk/trade-desk-tables.tsx` — positions / orders / history / fills
- Wire in `symbol-stack-bottom-panes.tsx` (drop TradePanel from stack)
- Keep left `SymbolPaperRiskBar variant=side` (or enhance with desk account)
- i18n `trading` / `tradeDesk` keys in zh-CN + en

## Non-goals
- Amend/cancel UI polish beyond existing cancel
- Removing dock TradePanel
