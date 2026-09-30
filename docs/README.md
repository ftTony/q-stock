# Q-Stock 文档中心

当前产品覆盖：**美股 / 港股 / A 股 / 加密** 行情，多源 failover（平台 env Key 优先，否则用户 BYOK），模拟交易、价格提醒、情绪与 AI 分析。扶摇行情代码保留但**路由层已禁用**。

| 文档 | 说明 |
|---|---|
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

快速入口：复制 [.env.example](../.env.example) → `.env`，再按《启动与环境》启动。根目录 [README](../README.md) 含功能总览与三语版本。

设计导出图仅作视觉参考，以实现代码与需求文档为准。
