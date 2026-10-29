# Q-Stock 全项目评估

> 评估时间：2026-10-29
> 评估方式：源码静态清点 + 配置核对 + 构建脚本审阅（未含真机性能剖面）
> 代码基线：`main` @ `2e2f6c4`

## 结论

**总分 7.2 / 10**

功能密度和 SEO 基础设施已经超过绝大多数个人项目，差距集中在「最后一公里」：
多语言残缺、错误边界缺失、时间无时区、类型检查在构建链路里被跳过。
这些都不是能力问题，是收尾问题。

两把尺子分开看：

| 标尺 | 分数 | 说明 |
|---|---|---|
| 个人项目 | 8.5 | 功能广度、SEO 基建、10 语言、BYOK 架构，这个量级极少有人做到 |
| 商业产品 | 7.2 | 差距不在功能清单，在深度使用后才会撞到的细节 |

## 六维评分

| 维度 | 分数 | 判定依据（一句话） |
|---|---|---|
| 产品功能 | **8.0** | 四市场 + 15 个个股页签 + 策略实验室 + 模拟交易闭环可用 |
| SEO | **7.5** | 基础设施接近专业水准，内容量与分享图拖后腿 |
| 好用 | **7.0** | 主路径通顺，冷启动慢，出错后没有恢复路径 |
| 精致 | **7.0** | 局部讲究，多语言与数字格式有明显残缺 |
| 前端工程 | **7.0** | 分层有想法，测试与类型兜底不足 |
| UI 一致性 | **6.5** | 两套样式体系并行，个股页不像同一个产品 |

加权（功能 25% / 好用 20% / UI 15% / 精致 15% / 前端 15% / SEO 10%）= 7.2

---

## 1. 产品功能 — 8.0

清点结果：30 个页面路由、239 个组件、631 个源文件。

**加分**
- 市场覆盖 A 股 / 港股 / 美股 / 加密，数据源 failover（longbridge → futu → finnhub / binance）
- 个股页 15 个页签：图表、概览、衍生品、基金、做空、筹码、新闻、财报、公告、公司、财务、高管、评论、情绪、AI
- 自选、组合、价格提醒、多图对比、复盘、策略实验室（含分享 token）、模拟交易、AI 对话 + 趋势分析
- 8 个计算工具（DCA / 复利 / 房贷 / 期权盈亏 / 风险收益 / 仓位）
- 37 篇学习内容，10 种语言，BYOK 凭证模型（AES-256-GCM）

**扣分**
- 30 个页面是并列罗列，没有主路径层级。新用户面对 5 个顶级导航 + 30 个落点，不知道该先做什么
- 提醒只覆盖价格类事件，没有财报日、异动、持仓风险

## 2. SEO — 7.5

**加分**
- `src/lib/seo/` 12 个模块：`page-metadata` / `symbol-metadata` / `locale-metadata` / `build-sitemap` / `write-daily-sitemap` / `site-url` …
- 25 个页面有 `generateMetadata`
- 每路由独立 canonical，且 `locale-metadata.ts` 顶部明确注释「不要在这里设 canonical，否则所有路由继承首页」
- sitemap index + 按市场切片（cn / hk / stock / crypto / static），带 `xhtml:link` hreflang 与 `x-default`
- JSON-LD 覆盖首页、个股页（WebPage + InvestmentOrSecurity + Offer + HowTo + BreadcrumbList）、分析页
- `robots.ts` 存在，sitemap 每日自动生成（`public/sitemaps/2026-10-29/`）

**扣分**
- **0 处 `openGraph.images`**：`twitter.card` 声明了 `summary_large_image` 却不给图，等于白声明
- 0 处 `Article` / `BreadcrumbList` / `FAQPage` 结构化数据，37 篇学习文章拿不到富摘要
- sitemap 仅 363 条 `<loc>`（250 个个股页 + 74 个学习页），长尾撑不起来
- `x-default` 指向 `zh-CN`，但无前缀 URL 实际返回英文（`localePrefix: as-needed` + `defaultLocale: en`），两者不一致，建议改为 `en`

## 3. 好用 — 7.0

**加分**
- 骨架屏（`panel-skeleton`）、空状态、`TopToast`、`PaginatedList`、`SubmitButton` 带耗时回显
- 个股页信息层级清晰，页签不堆叠
- `prefers-reduced-motion` 有降级（`globals.css:527`）
- 404 页有品牌化（`NotFoundView`）

**扣分**
- 首屏只预取 `initialQuote`，K 线走客户端 fetch，骨架屏挂 1–3 秒
- **0 个 `error.tsx`**（本次已修）：任意页面段抛错落到 Next 默认错误页，无品牌、无重试
- `formatTime` 用 `toLocaleTimeString("en-US")` 且不指定 `timeZone`：交易产品的时间没有时区标注，SSR 与客户端还可能不一致
- 键盘可达性弱：`aria-label` 130 处、`role=` 97 处，但 `focus-visible:` 仅 3 处、`tabIndex` 2 处

## 4. 精致 — 7.0

**加分**
- mask 渐隐、面板微动效、`qtFade` 入场、渐变数字的 404 页
- 深浅双主题、`--up` / `--down` 按中国市场习惯映射（涨红跌绿），且按 `data-change` 分区
- 涨跌色支持 us / cn 两套约定切换

**扣分**
- 语言包残缺：zh-CN 1813 键，en 缺 47、其余 8 种各缺 61（`symbol.peStatic` / `pbRatio` / `sharesOut` / `fundsNetIn` 等核心字段标签）。本次已补 en 并加运行时回退
- 支持 10 种语言，但 `formatNumber` / `formatDate` 统一 `en-US`，德语用户看到美式千分位
- 50 处硬编码 hex 绕过 27 个设计令牌

## 5. 前端工程 — 7.0

**加分**
- 23 处 `dynamic()` 拆包，重组件不进首屏
- RSC 取数 + 客户端交互分离，个股页服务端预取后下传
- `SHELL_NAMESPACES` 白名单把客户端字典从 31 KB 压到外壳所需，`check-i18n-scope.ts` 静态导入图校验漏配
- `format-number.ts` 显式做成 SSR/客户端稳定的格式化，避免水合不一致

**扣分**
- **222/239 组件是 `"use client"`（93%）**，RSC 基本没吃到，服务端渲染退化成空壳 + 客户端水合
- **Middleware 产物 372 kB**（`next build` 实测），每个请求都要先过这一层；首屏共享 JS 只有 103 kB，中间件比整个首屏还重 3 倍，主要来自 `next-intl/middleware` + 路由匹配
- **631 个源文件只有 5 个测试文件**，行情降级、凭证解密、订单结算均无覆盖
- Docker builder 里 `SKIP_TYPECHECK=1`，而 CI 虽然有 `npm run typecheck`（`.github/workflows/ci.yml:33`），类型错误仍在 `main` 上堆积了 6 个 —— 说明 CI 是红的但没拦住合入
- 无错误监控上报，`console.error` 之后没有出口

## 6. UI 一致性 — 6.5

**加分**
- 27 个设计令牌统一在 `:root` / `html.dark`
- 价格涨跌色走属性驱动而非散落各处
- 有 14 个 UI 原语（`confirm-dialog` / `side-drawer` / `segmented-tabs` / `qt-select` …）

**扣分**
- **两套并行样式体系**：`qt-*` 257 处、`aw-*` 348 处，对应 `apple-workbench.css`(1015 行) / `apple-ai-desk.css`(380 行) / `apple-quote-chrome.css`(121 行)。个股页工作台与 markets / portfolio / settings 是两种设计语言
- 14 个原语撑 239 个组件，分段控件、选择器、抽屉在不同页面各写一份
- 50 处硬编码颜色，深浅主题下需逐一人工核对

---

## 本次已修（2026-10-29）

| 项 | 文件 | 说明 |
|---|---|---|
| 错误边界 | `src/app/[locale]/error.tsx`、`src/app/global-error.tsx`、`src/components/marketing/error-view.tsx` | 段级重试 + 根级兜底；文案走 `common` / `nav` / `app`（均在外壳白名单） |
| 分享图 | `scripts/make-og-image.py` → `public/og/og-default.png`、`src/lib/seo/og-image.ts` | 1200×630 静态图，接进 `page-metadata` / `locale-metadata` / `symbol-metadata` |
| 语言回退 | `src/i18n/request.ts` | 缺失键逐级回退 `locale → en → zh-CN`，按语言缓存合并结果 |
| 英文补齐 | `messages/en.json` | 47 个缺失键补齐（`symbol.*` / `symbolRail.*`），覆盖率 97.4% → 100% |
| 作用域缺陷 | `alerts/layout.tsx`、`portfolio/layout.tsx` | 补 `watchlist` 命名空间；这两个页原本会抛 MISSING_MESSAGE |
| 语言对等闸门 | `scripts/check-i18n-keys.ts` + `ci.yml` | 硬性要求 zh-CN / en 100%，其余语言报覆盖率；并检查孤儿键与 ICU 占位符 |
| Docker 构建 | `Dockerfile`、`docker-compose.prod.yml` | npm 重试 + 失败清缓存 + 镜像源回退，修 `ECONNRESET` / 坏 tarball |

## 待修清单（按投入产出比）

1. **首屏预取 K 线**：与 `initialQuote` 同批在服务端取首屏 candles，消灭 1–3 秒骨架屏
2. **`formatTime` 显式 `timeZone` + 时区标签**：交易产品的正确性问题
3. **补 8 种语言的 61 个键**：现在靠回退保底，但仍是「英文出现在日语界面」
4. **`formatNumber` 按 locale 输出**：10 语言却统一 `en-US`
5. **合并 `qt-*` / `aw-*` 两套体系**：先统一分段控件与选择器，这两类重复最多
6. **补 `Article` / `BreadcrumbList` 结构化数据**：37 篇学习文章的直接收益
7. **把 `next build` 纳入 CI**：现在只有类型检查，构建期错误要到部署才发现
8. **`x-default` 改为 `en`**：与无前缀默认语言保持一致

## 方法论

- 页面与组件数：`find src/app -name page.tsx`、`find src/components -name "*.tsx"`
- 客户端占比：`grep -rl '"use client"'` 计数 / 组件总数
- 语言键位：解析 10 个 JSON 展平成路径集合，与 zh-CN 求差集
- 设计令牌：`grep -o "\-\-[a-z-]*:" src/app/globals.css`；硬编码色：`grep -rn "#[0-9a-fA-F]\{6\}" src/components`
- SEO 覆盖：`grep -rn "openGraph\|images:"`、`grep -c "<loc>" public/sitemaps/*.xml`
- 构建实测（2026-10-29）：`NODE_OPTIONS= CODEBUDDY_SAFE_DELETE_ENABLED=0 npm run build` 通过，
  首屏共享 JS 103 kB、Middleware 372 kB；预渲染 HTML 中已确认输出
  `<meta property="og:image" content="https://www.q-stock.cn/og/og-default.png">` 与 `twitter:image`
- 旁证：`tsc --noEmit` 0 error、`eslint` 0 error / 35 warning、`vitest` 15 项全过
- 未做：Lighthouse / 真机 TTI 实测、数据库与 API 层压测、跨浏览器回归
