# Q-Stock 文档中心

当前产品覆盖：**美股 / 港股 / A 股 / 加密** 行情，多源 failover（平台 env Key 优先，否则用户 BYOK），模拟交易、价格提醒、情绪与 AI 分析。扶摇行情代码保留但**路由层已禁用**。

| 文档 | 说明 |
|---|---|
| [产品现状盘点](./product-status.md) | 已上线能力、数据源、占位项与差异化（规划用） |
| [产品机会头脑风暴](./product-opportunity-brainstorm.md) | 可做什么：漏斗、形态切法、组合拳与商业选项 |
| [可落地路线图](./product-roadmap.md) | 短期切片、中期尖 fort、验收表与里程碑 |
| [产品留存、品牌与推广计划](./product-brand-growth-plan.md) | 研究复盘留存闭环、品牌定位、推广渠道、会员验证与指标 |
| [理财工具 PRD](./prd/README.md) | 仓位 / 定投 / 复利 / 期权各工具需求与验收 |
| [个股高级盘口 + 富途模拟交易规划](./prd/symbol-advanced-and-futu-paper.md) | 美/港分时·盘口·分笔·资金·卖空·筹码；富途 sim-trade |
| [个股专业交易台 UI](./prd/symbol-trading-ui.md) | 报价条+主图+右栏下单/冷静；次级含衍生品；AI 问股/贪婪恐惧/分享；完整示意稿 |
| [模拟盘风险控制 PRD](./prd/risk-control.md) | 下单前风险摘要、账户上限/单日熔断、与仓位工具·AI 冷静衔接 |
| [交易策略与回测 PRD](./prd/strategy-and-backtest.md) | 规则实验室：模板/我的策略、单标的回放、与模拟盘标签衔接 |
| [复盘笔记 PRD](./prd/review-notes.md) | 跨标的过程资产台：确定性摘要、偏差列表、可选 AI 解读 |
| [策略与回测方向：用规则削弱贪婪与恐惧](./strategy-backtest-direction.md) | 五个外部项目的启发、产品分期、回测可信度与纪律化决策设计 |
| [市场竞品调查：策略回放、模拟交易与交易纪律](./market-comparison-strategy-discipline.md) | 相邻产品能力、Q-Stock 差异化假设与验证指标 |
| [投资知识内容规划](./learn-content-plan.md) | Learn 专栏定位、选题目录、首发包与写作模板 |
| [推荐书单与学习路线](./learn-reading-list.md) | 理财书讲了什么、启发、三条路线与导读 slug |
| [需求文档](./requirements.md) | 功能范围、页面、验收要点（与现网代码对齐） |
| [启动与环境](./getting-started.md) | 本地开发、环境变量、Docker、常见问题 |
| [架构说明](./architecture.md) | 系统结构、目录、行情/凭证数据流、安全边界 |
| [行情多源与模拟交易实现思路](./market-trading-tech.md) | Provider、符号映射、撮合与实盘扩展点 |
| [API 参考](./api.md) | BFF 接口约定与示例 |
| [数据库说明](./database.md) | Prisma 模型、枚举、迁移与备份 |
| [生产部署](./deployment.md) | 上线检查清单、反代、容量与回滚 |
| [开发指南](./development.md) | 扩展页面 / API / 指标 / 主题 |
| [排障手册](./troubleshooting.md) | 启动、行情、鉴权、提醒排错 |
| [Longbridge 网页交易端技术整理](./longbridge-web-trade-tech.md) | 外部参考：trade.longbridge.com 技术观察 |
| [金融图表常用技术](./financial-chart-tech.md) | K 线选型与渲染参考 |
| [图表 Canvas vs SVG](./chart-canvas-vs-svg.md) | 主图/附属图渲染选型与项目对照 |

快速入口：复制 [.env.example](../.env.example) → `.env`，再按《启动与环境》启动。根目录 [README](../README.md) 含功能总览与三语版本。

设计导出图仅作视觉参考，以实现代码与需求文档为准。
