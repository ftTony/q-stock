# Q-Stock 数据库说明

ORM：Prisma。数据库：PostgreSQL 16。Schema 源文件：[`prisma/schema.prisma`](../prisma/schema.prisma)。

## 1. 迁移命令

| 场景 | 命令 |
|---|---|
| 生产 / CI 应用已有迁移 | `npm run db:migrate`（`prisma migrate deploy`） |
| 本地改 schema 并生成迁移 | `npm run db:migrate:dev` |
| 快速对齐 schema（无迁移历史） | `npm run db:push` |
| 仅生成 Client | `npm run db:generate` |

Docker `web` 容器启动时会执行 `prisma migrate deploy`。

迁移目录：`prisma/migrations/`。

## 2. ER 关系（逻辑）

```text
User 1──* WatchlistItem
User 1──* PriceAlert 1──* AlertDeliveryLog
User 1──* Comment
User 1──* AlertDeliveryLog
User 1──1 PaperAccount
User 1──* PaperPosition
User 1──* PaperOrder
ApiCache（独立缓存表）
```

删除用户会级联删除自选、提醒、评论、投递日志与模拟交易数据（`onDelete: Cascade`）。

## 3. 枚举

| 枚举 | 取值 | 用途 |
|---|---|---|
| `AssetType` | `stock`, `hk`, `crypto` | 标的类型（美股 / 港股 / 加密） |
| `ThemeMode` | `light`, `dark`, `system` | 主题 |
| `ChangeColorScheme` | `cn`, `us` | 涨跌色（红涨 / 绿涨） |
| `LocaleCode` | `zh_CN`, `zh_TW`, `en` | 用户语言（DB 形态） |
| `AlertCondition` | `gte`, `lte` | 提醒条件 |
| `AlertStatus` | `active`, `triggered`, `disabled` | 提醒状态 |
| `OrderSide` | `buy`, `sell` | 模拟交易方向 |
| `OrderType` | `market`, `limit`, `stop` | 订单类型 |
| `OrderStatus` | `pending`, `filled`, `cancelled`, `rejected` | 订单状态 |

注意：路由 locale 为 `zh-CN`，入库为 `zh_CN`，转换见 `src/i18n/config.ts`。

## 4. 表说明

### 4.1 User

| 字段 | 类型 | 说明 |
|---|---|---|
| id | cuid | 主键 |
| email | string unique | 登录邮箱（小写存储） |
| passwordHash | string | bcrypt |
| name | string? | 昵称 |
| locale | LocaleCode | 默认 `zh_CN` |
| theme | ThemeMode | 默认 `system` |
| changeColorScheme | ChangeColorScheme | 默认 `cn` |
| createdAt / updatedAt | datetime | 审计字段 |

### 4.2 WatchlistItem

| 字段 | 说明 |
|---|---|
| userId + symbol + assetType | 唯一约束，防重复自选 |
| symbol | 规范化后的代码（如 `AAPL`、`BTC`） |

### 4.3 PriceAlert

| 字段 | 说明 |
|---|---|
| condition | `gte` / `lte` |
| triggerPrice | `Decimal(18,8)` |
| status | Worker 只处理 `active` |
| triggeredAt | 触发时间；重新启用时清空 |

索引：`status`、`userId`、`(symbol, assetType)`。

### 4.4 Comment

| 字段 | 说明 |
|---|---|
| content | 正文 |
| deletedAt | 软删除时间；列表查询过滤 `null` |

索引：`(symbol, assetType, createdAt)`。

### 4.5 AlertDeliveryLog

记录每次成功发信（或视为成功完成投递流程）的审计：

- `alertId` / `userId` / `email` / `price` / `createdAt`

用于排查重复发送与邮件问题。

### 4.6 PaperAccount / PaperPosition / PaperOrder

模拟交易（仅做多）：

| 表 | 说明 |
|---|---|
| PaperAccount | 每用户一账户；`cashBalance` 初始 `$100,000` USD |
| PaperPosition | `(userId, symbol, assetType)` 唯一；`qty` + `avgCost` |
| PaperOrder | 市价/限价/止损；`pending` 由 Worker 撮合 |

索引：`PaperOrder(status)`、`(userId, status)`、`(symbol, assetType, status)`。

### 4.7 ApiCache

| 字段 | 说明 |
|---|---|
| key | 缓存键（如 `fh:quote:stock:AAPL`） |
| value | JSON |
| expiresAt | 过期时间 |

与内存缓存配合；DB 写入失败时忽略（best-effort）。

## 5. 不落库的数据

以下由 Finnhub / Adanos 实时或缓存获取，**不**作为业务主表持久化：

- 实时报价、K 线 OHLCV
- 新闻、财报、公告原文
- 市场情绪原始响应

模拟成交价取触发时行情价，不单独存 tick 流水。

## 6. 备份与恢复建议

```bash
# 备份
pg_dump -U qstock -d qstock -F c -f qstock.dump

# 恢复
pg_restore -U qstock -d qstock --clean qstock.dump
```

Docker 数据卷名默认为 Compose 项目下的 `pgdata`。

## 7. 相关文档

- [启动与环境](./getting-started.md)
- [架构说明](./architecture.md)
- [API 参考](./api.md)
