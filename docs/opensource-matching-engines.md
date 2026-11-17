# 开源金融撮合系统调研

整理时间：2026-11-17

本文汇总 GitHub 上较常见的开源撮合 / 订单簿相关项目，并对照 Q-Stock 当前产品边界给出选型建议。

相关内部文档：

- [行情多源与模拟交易实现思路](./market-trading-tech.md)
- [Python 后端微服务规划](./python-backend-microservices.md)
- [策略与回测方向](./strategy-backtest-direction.md)

---

## 1. 先分清两类能力

| 类型 | 含义 | 典型用途 |
|---|---|---|
| **CLOB 撮合** | 买卖盘互撮（价格优先 + 时间优先等） | 交易所、暗池、多用户对敲 |
| **对行情成交模拟** | 用户订单对外部行情（最新价 / L2 / L3）触价或排队成交 | 模拟盘、回测、学习型交易终端 |

Q-Stock 当前模拟盘属于后者：**取行情价 → 改账户/持仓**，不是用户之间互撮。

后续若自建 Go 撮合服务，再考虑 CLOB；若只想增强模拟真实感（延迟、排队、部分成交），优先看「对行情成交」类项目。

---

## 2. CLOB 撮合引擎（真订单簿）

### 2.1 较完整 / 偏生产形态

| 项目 | 语言 | Stars（约） | License | 说明 | 链接 |
|---|---|---|---|---|---|
| **exchange-core** | Java | ~2.6k | Apache-2.0 | 撮合 + 风控记账 + journal/snapshot；基于 LMAX Disruptor；学架构很有价值，直接嵌进现有栈成本高 | https://github.com/exchange-core/exchange-core |
| **liquibook** | C++ | ~1.5k | 宽松 | 经典 header-only 订单簿库；偏「引擎积木」，不是完整交易所 | https://github.com/enewhuis/liquibook |
| **DistributedATS** | C++ | — | — | QuickFIX + Liquibook + FastDDS 的分布式 ATS；多网关多撮合 | https://github.com/mkipnis/DistributedATS |
| **CppTrader** | C++ | ~1.1k | — | 高性能交易组件集（撮合、订单簿处理等）；偏研究 | https://github.com/chronoxor/CppTrader |
| **fix-exchange** | C++ | — | — | 单进程权益交易所示例：FIX 接入 + 撮合线程 + UDP 行情 + SQLite | https://github.com/koralkulacoglu/fix-exchange |

### 2.2 Go 方向（与「FastAPI 上层 + Go 撮合」更贴）

| 项目 | Stars（约） | License | 说明 | 链接 |
|---|---|---|---|---|
| **trading_engine** | ~300 | BSD-2 | Go 交易引擎示例：撮合、订单处理、结算、通知；含 `pkg/matching` 可复用包 | https://github.com/yzimhao/trading_engine |
| **orderbook** (i25959341) | ~550 | MIT | 轻量 LOB：市价/限价/撤单；适合自己包一层服务 | https://github.com/i25959341/orderbook |
| **matching-engine** (0x5487) | ~24 | GPL-3.0 | 内存撮合 SDK；Disruptor 风格、事件溯源；注意 GPL | https://github.com/0x5487/matching-engine |
| **orderbook** (geseq) | ~16 | MIT | 低延迟实验性订单簿；偏性能研究 | https://github.com/geseq/orderbook |
| **orderbook** (intrepidkarthi) | ~30 | MIT | 功能较全的嵌入式 LOB（止损/冰山/OCO 等）；作者明确标注非生产 | https://github.com/intrepidkarthi/orderbook |

### 2.3 教学 / 协议示例

| 项目 | 说明 | 链接 |
|---|---|---|
| QuickFIX Go `ordermatch` | 简单订单簿 + FIX acceptor；看 NewOrderSingle / ExecutionReport 流程 | https://github.com/quickfixgo/examples/blob/main/cmd/ordermatch/README.md |
| QuickFIX/J `ordermatch` | Java 版同类示例 | https://github.com/quickfix-j/quickfixj |

---

## 3. 对行情成交 / 回测模拟（更贴近模拟盘）

| 项目 | 语言 | Stars（约） | License | 说明 | 链接 |
|---|---|---|---|---|---|
| **hftbacktest** | Python / Rust | ~5k | MIT | L2/L3 行情重放；考虑延迟与队列位置的成交模拟；**不是用户互撮**，是「你的单 vs 市场」 | https://github.com/nkaz001/hftbacktest |
| **LightMatchingEngine** | Python | ~350 | — | 轻量撮合示例，适合入门理解 | https://github.com/gavincyi/LightMatchingEngine |

---

## 4. 对 Q-Stock 的选型建议

### 4.1 现阶段（学习型模拟盘）

- 继续「市价 / 限价 / 止损对最新价」即可。
- 若要增强真实感：参考 **hftbacktest** 的成交假设（延迟、排队、部分成交），不必上完整 CLOB。
- 不必把 `exchange-core` / Liquibook 直接嵌进 1GB 小机。

### 4.2 以后自建 Go 撮合

推荐阅读顺序：

1. **i25959341/orderbook** — 订单簿核心数据结构与 API 形状  
2. **yzimhao/trading_engine** — 撮合如何接到订单/结算/事件  
3. **exchange-core** — journal、风控边界、确定性与高吞吐设计（对照学习，不必照搬 Java）

边界建议：

| 层 | 职责 |
|---|---|
| FastAPI | 鉴权、账户、风控文案、策略标签、对外 REST、复盘 |
| Go 撮合 | 订单簿、撮合规则、成交事件、挂单生命周期 |
| Postgres / Redis | 成交事实落库；避免两边各算一遍仓位 |

### 4.3 使用开源时的注意点

1. **几乎没有「拿来就能跑生产金融撮合」的成品**；多数是库、演示或回测框架。  
2. 审 **License**（尤其 GPL）。  
3. 审 **数值路径**：是否避免 float 做金额；是否有确定性回放。  
4. 审 **活跃度与维护**：Star 高不等于可商用。  
5. 小机约束：多一个常驻撮合进程要控内存；热路径预计算 / 事件驱动，勿塞进每个 HTTP 请求。

---

## 5. 结论（一句话）

- 学完整交易所架构 → **exchange-core**、**liquibook**  
- 落地 Go 自研 → **trading_engine** + **i25959341/orderbook**  
- 贴近 Q-Stock 模拟盘体验 → **hftbacktest**  

开源适合当蓝本与对照，不适合直接当产品核心依赖；自研时保持「FastAPI 产品层 + Go 撮合核」的清晰边界即可。
