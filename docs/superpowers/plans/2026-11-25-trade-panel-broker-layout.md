# Trade panel → 图一「下单面板」

## Goal
Dock `TradePanel` / `TradePanelDefaultLayout` matches reference image 1 (broker ticket).

## IA (top → bottom)
1. Title 下单面板（drawer chrome may keep close）
2. Account: 模拟交易 + 模拟 badge；余额/权益/浮动盈亏/今日；margin used line
3. Symbol + last；预设（无，可 stub）
4. 卖出 | 买入 大块按钮
5. 市价单 | 限价单 | 止损单 tabs
6. 股数 | 美元 | %权益 | 风险；qty input；margin hint；快捷 100/250/500/1000；订单价值估算
7. 限价/止损价（按类型）；止损/止盈可选 + 使用 1%/2%
8. 提交「买入 N SYM, 市价」；模拟说明；下单前确认 / 紧急停止 toggles；限额脚注

## Keep
- Existing submit API / paper risk assert
- Plan/emotion: remove from primary ticket (link optional in footer later)

## Files
- `trade-panel-default.tsx` + new section components under `src/components/trading/`
- `trade-order-fields.tsx` / header / account strip rewrite
- `trade-panel.tsx` state: qtyMode, takeProfit, confirmBefore, emergencyStop
- i18n `messages/zh-CN.json` (+ en minimal keys)
- CSS: aw-trade-* / qt-* only, App 直角

## Non-goals (v1)
- Real multi-account switcher
- ATR/Tick sizing engine (UI tabs can stub → price mode)
- Emergency stop wiring beyond local disable submit
