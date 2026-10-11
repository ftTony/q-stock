# 国内访问性能诊断：为什么 yi-tao.hk 快、q-stock.cn 慢

> 诊断时间：2026-10-11 17:25–17:45 CST（周日傍晚，跨境链路最差时段）
> 出口线路：长沙联通 AS4837 · 220.202.224.44
> 结论一句话：**两个站的 CDN 配置完全相同；差异来自首屏字节数 + 跨太平洋链路本身。**

## 一、测量方法（可复现）

```bash
# 关键：--noproxy 绕开本机代理，测的是真实运营商链路
curl -sS --noproxy '*' -4 --http1.1 -o /dev/null \
  -D - -w 'connect=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s size=%{size_download}B\n' \
  --max-time 20 'https://www.q-stock.cn/zh-CN'

# 锁定边缘 IP 交叉验证（分离「线路」与「站点」两个变量）
curl -sS --noproxy '*' -4 --http1.1 --resolve "www.q-stock.cn:443:172.66.42.212" \
  -o /dev/null -w '%{time_total}\n' https://www.q-stock.cn/

# 直接读 Cloudflare 边缘节点代码
curl -sS --noproxy '*' https://www.q-stock.cn/cdn-cgi/trace | grep -E 'colo|loc|ip|tls'
```

基准对照（同一时刻、同一线路）：`baidu.com` 0.24s、`apple.com`（国内节点 116.162.209.88）0.08s
→ 本机网络本身正常，慢的不是用户侧。

## 二、结论一：两个站的 CDN 配置完全相同

| 维度 | q-stock.cn | yi-tao.hk |
|---|---|---|
| 边缘节点 `/cdn-cgi/trace` | `colo=LAX`, `loc=CN` | `colo=LAX`, `loc=CN` |
| 客户端 IP | 220.202.224.44 (长沙联通) | 同（同一台机器） |
| HTML `cache-control` | `private, no-cache, no-store` | `no-cache, no-store, must-revalidate` |
| HTML `cf-cache-status` | `DYNAMIC` | `DYNAMIC` |
| 静态资源缓存 | `public, max-age=31536000, immutable` + `HIT` | 完全相同 |
| HTTPS / TLS | TLSv1.3 | TLSv1.3 |
| 其他 CF 特性 | `speculation-rules`（Speed Brain） | 相同 |

**两边都落在洛杉矶、都是动态回源、静态资源都是边缘 HIT + 1 年 immutable。**
所以"CDN 配置不一样"不成立 —— 这也解释了为什么单纯调缓存规则解决不了体感问题。

## 三、结论二：真正的差异是首屏字节数

| 指标 | q-stock.cn | yi-tao.hk |
|---|---|---|
| 首屏 HTML | **75 KB** | **7.2 KB** |
| 技术栈 | Next.js App Router（SSR） | Vite + React（SPA） |
| 首屏 TTFB | 2.4–5.5 s | 0.9–1.3 s |
| 首屏总耗时 | 5–20 s | 1–2.5 s（复访） |

## 四、结论三：瓶颈是跨太平洋链路，且非常不稳定

- **超时率**：20+ 次请求中约 1/3 直接 8–10s 超时、0 字节
- **吞吐**：成功时 3–12 KB/s（偶发 190 KB/s）
- **TCP connect**：0.18–0.28 s（≈180 ms RTT，符合长沙→LAX）
- **TLS 握手**：0.5–3.5 s（丢包触发多次重传，正常应 ~0.2 s）

用 yi-tao 的边缘 IP 打 q-stock、用 q-stock 的边缘 IP 打 yi-tao，**表现一致地差** —— 证明瓶颈在线路，不在站点，也不在具体某个 anycast IP。

> 注意：Cloudflare 免费/Pro 版在中国大陆没有节点，对国内运营商的选路经常落到 LAX，
> 这一段的丢包和限速无法通过源站优化解决。

## 五、结论四：yi-tao.hk 的"快"来自缓存与体积，不是 CDN 更好

冷启动实测（同一线路、同一时刻）：

| 资源 | 体积 | 耗时 |
|---|---|---|
| `/assets/vendor-react-*.js` | 164 KB | **21.4 s** |
| `/assets/index-*.js` | 9.6 KB | 30 s 超时 |
| `/assets/vendor-i18n-*.js` | 323 KB | 1.7 s（HIT） |

**yi-tao.hk 冷启动同样慢。** 它平时"打开就出来"，是因为 `/assets/*` 全部带
`max-age=31536000, immutable`，复访时浏览器缓存直接命中，网络上只剩 7.2 KB 的空壳 HTML。

而 q-stock.cn 的 HTML 是 `no-store`，**每次导航都要跨境重取 75 KB**。

## 六、75 KB HTML 的构成（可优化点）

```
HTML 总字节        75,087
  内联 <script>    52,052  (69%)
    ├─ 30,191 B   NextIntlClientProvider 序列化整份 i18n 字典（577 条键值对）
    └─ 其余         RSC flight 数据（self.__next_f.push）
  标签与文本        23,035
可见文本            仅 771 字符
```

一次导航就要传 577 条翻译文案，其中绝大多数属于当前页面用不到的命名空间。

## 七、行动清单（按性价比排序）

### P0 · 给 HTML 减重（零成本、立刻见效、与边缘位置无关）
1. `NextIntlClientProvider` 不要下发整份 messages，按命名空间/页面裁剪（`pick()` 或只传当前页所需）。
   预期：HTML 从 75 KB 降到 40 KB 以下。
2. 营销落地页（`src/components/marketing/marketing-landing.tsx`）改为服务端组件 + 极简客户端岛，
   避免把整棵组件树的 RSC payload 内联进 HTML。目标 HTML < 20 KB。
3. 验收：`curl -s --noproxy '*' https://<域名>/zh-CN | wc -c`，目标 < 20,000 字节。

### P1 · 把边缘从 LAX 挪到香港/新加坡（真正解决跨境，免备案）
- Bunny CDN：约 $0.01/GB，有香港/新加坡/日本节点
- 阿里云 / 腾讯云 **国际版** CDN 的香港节点
- 验收：`/cdn-cgi/trace` 或对应厂商工具确认边缘落在 HK/SG，TTFB 目标 < 300 ms
- 注意：这一步做完，`docs/deployment.md` §5 的 HTML 边缘缓存才会真正兑现价值

### P2 · WebSocket 单独拆分
`ws.q-stock.cn` 指到香港节点直连，行情推送延迟可从数百 ms 降到 30–60 ms。

### P3 · 备案 + 国内 CDN（20–50 ms）
唯一能进"国内快"档的方案，但证券行情类站点备案通常需金融资质，投入前先向接入商确认。

### 不建议
- **Cloudflare 优选 IP**：本次交叉测试显示同一 IP 打两个站表现一致地差，收益不稳定，不值得投入运维成本。
- **Cloudflare Argo**：对"国内→LAX"的落地选择帮助有限。

## 八、与 `docs/deployment.md` §5 的关系

`deployment.md` §5 的 ISR + CF Cache Rules 解决的是"边缘→源站"那一跳（把 TTFB 里的回源时间去掉）。
它**不减少"边缘→用户"要传输的字节数**。在边缘仍在 LAX 的前提下，HTML 缓存对国内用户的收益有限 ——
必须和 P0（减重）、P1（换边缘）配合才有完整效果。

## 九、P0 实施结果（已完成）

### 体积口径修正

前面写的 75 KB 是**未压缩**的。浏览器实收 gzip 后只有 **22.3 KB**，
其中 i18n 字典占 **12.2 KB（55%）**。所有体积结论都应以 gzip 口径复述。

### 根因

`src/app/[locale]/layout.tsx` 调用 `getMessages()` 拿到**全量字典（31,251 B）**交给
`NextIntlClientProvider`，Next.js 会把它序列化进每一页的 HTML，**并在每次客户端导航的
RSC payload 里再传一份**。此外 `settings`（6,014 B）被整体下发，而外壳实际只用到 4 个键。

### 实现

| 文件 | 作用 |
|---|---|
| `src/i18n/client-messages.ts`（新） | `SHELL_NAMESPACES` + 收窄的 `SHELL_SETTINGS_KEYS` + `shellMessages()` / `clientMessages()` |
| `src/components/providers/scoped-messages.tsx`（新） | 服务端组件，按需合并「外壳 + 本页」的命名空间 |
| `src/app/[locale]/layout.tsx` | 改为只下发外壳 |
| 12 个路由 | 按需包 `<ScopedMessages namespaces={[…]}>` |
| `scripts/check-i18n-scope.ts`（新） | `npm run check:i18n`：静态导入图比对，漏配直接 exit 1 |
| `src/app/[locale]/review/layout.tsx`（新） | `/review` 的 page 是客户端组件，必须有 layout 才能挂服务端 Provider |

路由改造的分工：page 是服务端组件的（`/`、`/analysis`、`/symbol/...`）直接包在 `page.tsx`；
page 是 `"use client"` 的（login/register/forgot-password/reset-password/auth-continue/
portfolio/watchlist/settings）包在各自的 `layout.tsx`。

> 关键约束：**嵌套 `NextIntlClientProvider` 的 `messages` 是整体替换而非合并**
> （next-intl 官方文档："individual props are treated as atomic"）。
> 所以内层必须显式并入外壳，否则 AppShell 的文案会全部丢失。

### 实测结果（gzip 后真实传输字节）

| 路由 | 改前 | 改后 | 降幅 |
|---|---|---|---|
| `/zh-CN` | 22,135 B | **11,297 B** | −49.0% |
| `/zh-CN/login` | 18,328 B | **6,894 B** | −62.4% |
| `/zh-CN/register` | 18,785 B | **7,314 B** | −61.1% |
| `/zh-CN/markets` | 20,533 B | **8,512 B** | −58.5% |
| `/zh-CN/watchlist` | 20,438 B | **8,540 B** | −58.2% |
| `/zh-CN/portfolio` | 20,420 B | **9,237 B** | −54.8% |
| `/zh-CN/settings` | 20,529 B | **10,972 B** | −46.6% |
| **合计** | **141,168 B** | **62,766 B** | **−55.5%** |

各页下发的字典量：`31,251 B` → `3,240 B`（仅外壳）～`7,126 B`（外壳 + 本页）。

### 验证方式

- `next build` exit=0；`npx eslint` 新改文件 exit=0；`npm run check:i18n` 通过
- 生产服务器实测 14 条路由全部 `HTTP 200`，页面可见文本正常（SSR 阶段无 `MISSING_MESSAGE`）
- 预渲染产物 `.next/server/app/zh-CN.html` 中出现**两份** `"messages"`：
  第一份是外壳 `[alerts,app,common,market,nav,settings]`，
  第二份是「外壳 + 本页」—— 首页追加 `marketing`、login 追加 `auth`、portfolio 追加 `portfolio,trading`
- 用「命名空间里最长的文案」做存在性探测：首页有 `marketing`，
  且 `analysis/trading/auth/portfolio/seo/about/learn` 均已消失；`seo`/`about`/`learn` 任何页都不再下发

### 收益折算

首页每次浏览少传 **10.8 KB**。在实测 3–12 KB/s 的跨境链路上约合 **1–3.6 秒**；
客户端导航的 RSC payload 同样变轻，多页浏览整体受益。

### 下一步（P1）

边缘仍在 LAX，P0 省下的字节依然要跨太平洋传输 —— 要真正压到百毫秒级，必须换香港/新加坡边缘。
另见 §7 P2/P3。

