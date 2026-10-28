# C 端付费闭环 PRD

> 对齐 [product-roadmap 切片 F](../product-roadmap.md) 与品牌计划 Freemium / Pro / BYOK。  
> **不卖**荐股信号、收益承诺或默认 L2（L2 仍走 `/advanced-quotes` 询价）。

## 目标

把「AI 次数 + 邀请/BYOK 文案」升级为可计量的 **Free / Pro / BYOK** 漏斗：权益门控 → 转化触点 →（可选）Stripe 订阅。

## 档位与权益

| 能力 | Free | Pro |
|---|---|---|
| 行情 / K 线 / 模拟盘 | 全开（平台 Key 或 BYOK） | 同左 |
| 自选 | 20 | 100 |
| 价格提醒 | 5 | 30 |
| 平台 AI | 终身 5 + 邀请 +5 | 每月 100（UTC 自然月） |
| AI BYOK | 不占平台配额 | 同左 |
| 研究卡 | 1 | 500 |
| 收盘自选摘要邮件 | 关（站内研究卡试用） | 开（Worker 仅投递有效 Pro） |
| Learn / Tools | 全开 | 全开 |

BYOK（设置页用户 AI Key）调用**不消耗**平台配额。

## 转化三出路

配额或额度触壁时统一：**邀请 / BYOK / 升级 Pro**（设置兑换码或 Stripe Checkout）。

## 技术落点

| 能力 | 路径 |
|---|---|
| 权益 | `src/lib/billing/entitlements.ts`、`limits.ts` |
| 配额 | `src/lib/ai/usage.ts`（Free 终身 / Pro 月池） |
| 兑换 | `POST /api/billing/redeem`；`npm run billing:create-code` |
| 人工开通 | `npm run billing:grant-pro -- email days` |
| Stripe | `POST /api/billing/checkout`、`portal`、`webhook` |
| 漏斗事件 | `ConversionEvent` + `POST /api/billing/events` |
| 研究卡 | `POST/GET /api/research-cards`；个股计划栏面板 |
| 定价页 | `/pricing` 上半在线 Free/Pro，下半源码 mailto |

## 环境变量

见 `.env.example`：`STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、`STRIPE_PRICE_PRO_MONTHLY`、`STRIPE_PRICE_PRO_YEARLY`（可选）。未配置时仍可用兑换码验证门控。

## 验收

- [ ] `/pricing` 在线与源码分栏，CTA 不混用  
- [ ] Free 触壁可见三条出路；点击写入 `ConversionEvent`  
- [ ] 自选 / 提醒 / 研究卡超限返回 `PLAN_LIMIT_EXCEEDED`  
- [ ] 兑换码可开通 Pro；`planExpiresAt` 生效  
- [ ] 配置 Stripe 后：Checkout → webhook → Pro；Portal 可取消降级  
- [ ] BYOK 用户 AI 调用不增加平台 `aiUsageCount` / 月计数  

## 非目标

微信/支付宝、复杂发票、源码与 Pro 混 SKU、无限平台 AI、付费策略信号。
