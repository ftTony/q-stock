# 生产构建性能：基线、方案与已落地优化

> 更新：2026-10-29  
> 范围：`npm run build` / `npm run build:prod` / Docker `web` 镜像构建  
> 不含：运行时首屏、CDN（见 [cdn-performance-diagnosis.md](./cdn-performance-diagnosis.md)）

---

## 1. 基线（本机增量构建）

环境：Windows · 已有 `.next` 缓存 · `npx next build`（未开 SSG 裁剪）

| 阶段 | 约耗时 | 说明 |
|---|---|---|
| Compile | ~50s | Webpack 编译 |
| Lint + Typecheck | 数秒～数十秒 | 与 CI 的 `lint` / `tsc` **重复** |
| Generating static pages | 大头 | 本仓库曾到 **605** 页 |
| Collecting build traces | 数秒～十几秒 | `output: "standalone"` |
| **合计（增量）** | **~144s** | 冷构建 / Docker 通常更长 |

### 优化后对照（同机、复用 `.next`）

| 指标 | 优化前 | 优化后（`SSG_LOCALES=en,zh-CN,zh-TW` + `SKIP_TYPECHECK=1`） |
|---|---|---|
| Compile | ~50s | ~43s |
| Lint / types | 会跑 Lint+tsc | `Skipping linting`（types 按 SKIP） |
| 静态页 | **605** | **220** |
| 合计 | **~144s** | **~93s（约 −35%）** |

冷构建与 Docker 首构仍受 `npm ci` / 无缓存影响；二次 Docker（BuildKit cache）收益更大。

日志特征：

```text
✓ Compiled successfully in 50s
  Linting and checking validity of types ...
  Generating static pages (0/605) ...
✓ Generating static pages (605/605)
```

**605 页从哪来：** `[locale]` 有 **10** 个 UI 语种 ×（营销/Learn/Tools/应用壳等路由）。Learn 文章再按 slug 展开，乘上语种后 SSG 扇出最大。

其它拖慢因素：

| 因素 | 影响 |
|---|---|
| `prisma generate` 绑在 `build` + Docker 曾再跑一遍 | 重复 2～3s+，Docker 更明显 |
| `longbridge` optional 原生包 + Docker `npm ci --include=optional` | deps 层慢、体积大 |
| 重依赖：`klinecharts`、`@xyflow/react`、多厂商 AI SDK | Compile 变重 |
| Middleware First Load ~370kB | 主要影响产物/运行，间接拖 trace |
| Windows 杀毒锁 Prisma engine | 偶发 `EPERM` rename，体感「卡住」 |

---

## 2. 优化方案（分层）

### P0 — 已落地（低风险、立刻生效）

| 项 | 做法 | 预期 |
|---|---|---|
| 构建期跳过 ESLint | `next.config.ts` → `eslint.ignoreDuringBuilds: true`（CI 仍 `npm run lint`） | 去掉 build 内整轮 lint |
| 可选跳过 typecheck | `SKIP_TYPECHECK=1` 时 `typescript.ignoreBuildErrors`（Docker / `build:prod` 默认开） | 去掉与 CI `tsc` 重复的检查 |
| SSG 语种裁剪 | `SSG_LOCALES` + [`src/i18n/ssg-locales.ts`](../src/i18n/ssg-locales.ts)；未预渲染语种仍可访问（`dynamicParams`） | 静态页约 **10 → 3 语种**，页数近似 ÷3～÷4 |
| 包导入优化 | `experimental.optimizePackageImports`：`date-fns` / `zod` / `@tanstack/react-query` / `next-intl` | 编译与拆包略快 |
| Docker 去重 prisma | builder **不再**单独 `npx prisma generate`（`npm run build` 已含） | 少一轮 generate |
| Docker BuildKit 缓存 | `npm` cache + `.next/cache` mount | 二次构建明显加快 |
| `.dockerignore` 收紧 | 排除 `docs`、`.github`、测试与日志等 | 加快 context 上传 |

### P1 — 建议后续（需一点产品/工程取舍）

| 项 | 做法 | 备注 |
|---|---|---|
| Learn SSG 策略 | 仅预渲染热门 slug，或冷文章 `force-dynamic` / 空 `generateStaticParams` | 进一步砍页数 |
| Middleware 瘦身 | 少导入重模块、拆 matcher | 降 370kB 与 trace 成本 |
| xyflow / klinecharts | 保持 `dynamic()`；避免在 layout 静态图进主链 | 已有部分 dynamic，可再扫入口 |
| CI 缓存 | GitHub Actions 缓存 `.next/cache`（若 CI 增加 build job） | 与 Docker cache 互补 |
| 升级评估 | Next 16+ 生产 Turbopack build（若稳定） | 15.5 CLI 尚无正式 `build --turbopack` |

### P2 — 明确不做 / 慎做

| 项 | 原因 |
|---|---|
| 本地默认也砍掉全部语种 SSG | 易漏测 ja/ko 等；故默认 `SSG_LOCALES` 未设 = 全语种 |
| 构建期永久关闭 typecheck 且无 CI | 质量回退；仅允许「CI 已 tsc」后的镜像构建跳过 |
| 为加速删 `output: "standalone"` | 部署形态依赖 standalone |

---

## 3. 怎么用

### 本地全量（与改前行为一致：10 语种 SSG + typecheck）

```bash
npm run build
```

### 本地 / 脚本：生产取向（推荐发版前）

```bash
npm run build:prod
# 等价默认：
#   SSG_LOCALES=en,zh-CN,zh-TW
#   SKIP_TYPECHECK=1
#   prisma generate && next build
```

覆盖示例：

```bash
# 仍要构建期 typecheck
SKIP_TYPECHECK=0 npm run build:prod

# 只预渲染中英
SSG_LOCALES=en,zh-CN npm run build:prod
```

仅 Next（Prisma 已 generate）：

```bash
npm run build:web
```

### Docker

```bash
DOCKER_BUILDKIT=1 docker build --target runner -t q-stock-web .
```

镜像内已设：`SSG_LOCALES=en,zh-CN,zh-TW`、`SKIP_TYPECHECK=1`，并缓存 npm / `.next/cache`。

发版前请保证流水线已跑：`lint` + `typecheck` + `test`（见 `.github/workflows/ci.yml`）。

---

## 4. 已改文件清单

| 文件 | 变更 |
|---|---|
| [`next.config.ts`](../next.config.ts) | 跳过 build ESLint；`SKIP_TYPECHECK`；`optimizePackageImports` |
| [`src/i18n/ssg-locales.ts`](../src/i18n/ssg-locales.ts) | SSG 语种列表 |
| [`src/app/[locale]/layout.tsx`](../src/app/[locale]/layout.tsx) | `generateStaticParams` 用 `ssgLocales()` |
| [`scripts/build-prod.ts`](../scripts/build-prod.ts) | `npm run build:prod` |
| [`package.json`](../package.json) | `build:web` / `build:prod` |
| [`Dockerfile`](../Dockerfile) | BuildKit cache、去重 prisma、SSG/SKIP env |
| [`.dockerignore`](../.dockerignore) | 收紧上下文 |
| [`.gitignore`](../.gitignore) | `build-timing-log.txt` |

---

## 5. 验收怎么量

```bash
# 对比全量 vs 生产取向（清缓存更准）
# Windows PowerShell:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Measure-Command { npm run build }
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Measure-Command { npm run build:prod }
```

关注日志中的：

- `Compiled successfully in Xs`
- 是否还出现 `Linting and checking validity of types`
- `Generating static pages (N/N)` 的 **N**（生产取向应明显小于 605）

---

## 6. 风险与回滚

| 风险 | 缓解 |
|---|---|
| 未预渲染语种首击略慢 / 依赖 Node 运行时生成 | 接受；或扩大 `SSG_LOCALES` |
| Docker 跳过 typecheck 漏错 | CI 必跑 `tsc`；禁止在无 CI 的机器上长期 `SKIP_TYPECHECK=1` 当唯一门禁 |
| BuildKit 旧 Docker 不支持 cache mount | 升级 Docker 或去掉 `RUN --mount=...` |

回滚：还原上述文件；或构建时不设 `SSG_LOCALES` / `SKIP_TYPECHECK`，行为回到「全语种 + 构建内 typecheck」（ESLint 仍建议保持 ignoreDuringBuilds，因 CI 已覆盖）。
