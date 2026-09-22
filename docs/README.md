# Q-Stock 文档中心

| 文档 | 说明 |
|---|---|
| [需求文档](./requirements.md) | 一期功能范围、技术选型、页面与验收要点 |
| [启动与环境](./getting-started.md) | 本地开发、环境变量、Docker、常见问题 |
| [架构说明](./architecture.md) | 系统结构、目录、数据流、缓存与安全边界 |
| [行情多源与模拟交易实现思路](./market-trading-tech.md) | Provider 抽象、长桥/富途/Finnhub 回退、模拟撮合与真实下单扩展点 |
| [API 参考](./api.md) | BFF 接口约定与示例 |
| [数据库说明](./database.md) | Prisma 模型、枚举、迁移与备份 |
| [生产部署](./deployment.md) | 上线检查清单、反代、容量与回滚 |
| [开发指南](./development.md) | 如何扩展页面 / API / 指标 / 主题 |
| [排障手册](./troubleshooting.md) | 按症状排查启动、行情、鉴权、提醒等问题 |
| [Longbridge 网页交易端技术整理](./longbridge-web-trade-tech.md) | trade.longbridge.com 的渲染、行情、表格、K 线、交易可靠性，以及前端挑战与必处理问题 |
| [金融图表常用技术](./financial-chart-tech.md) | K 线/分时等金融图的渲染底层、常用库、数据层与选型模板 |

快速入口：复制 [.env.example](../.env.example) 为 `.env` 后，按《启动与环境》操作即可。

设计导出文件（`screen*.png`、`code*.html` 等）仅作视觉参考，实现以代码与需求文档为准。
