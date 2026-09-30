# Q-Stock

**語言：** [简体中文](./README.md) · [English](./README.en.md) · [繁體中文](./README.zh-TW.md)

美股 / 港股 / A 股 / 加密貨幣行情 Web & H5：多源行情、K 線指標、資訊評論、模擬交易、價格郵件提醒、市場情緒與 AI 分析。

## 功能亮點

| 模組 | 說明 |
|---|---|
| 行情瀏覽 | 美股 / 港股 / **A 股** / 加密熱門與漲跌榜；搜尋；約 45s 靜默刷新 |
| 多源行情 | 股票：**長橋 ↔ 富途 → Finnhub**；加密：**Binance ↔ OKX → Finnhub**；憑證 **平台 env 優先，否則使用者 BYOK** |
| 市場頁 | KPI、排行榜（愛心自選）、行業熱力、港股 IPO、情緒；頂欄指數輪播 |
| 個股詳情 | 日/季/年 K、指標與畫線；緊湊報價頭 + 愛心；右側模擬下單 |
| 資訊 Tab | 新聞（長橋→富途→Finnhub）、財報/公告、公司/高管、評論、情緒、AI |
| 標的分析 | `/analysis` 熱門卡片 |
| 自選 & 資產 | CRUD（含 cn）、sparkline；Portfolio 資金/持倉/掛單/重置 |
| 價格提醒 | ≥ / ≤ 郵件；Worker 輪詢 |
| 模擬交易 | 僅做多；市價/限價/止損；初始 **$100,000** |
| 設定 | 語言/主題/漲跌色；長橋·富途·幣安·OKX BYOK；多廠商 AI；邀請碼 |
| 體驗 | 10 語言、亮暗主題；側欄可收起；H5 底欄 |

技術棧：Next.js 15 · TypeScript · Tailwind · KLineChart · Auth.js · Prisma · PostgreSQL · Docker。

> 扶搖（Fuyao）程式仍在倉庫，**路由層已屏蔽**且設定頁不展示；A 股走長橋/富途/Finnhub。

## 環境需求

- Node.js **20+**（建議 22）
- npm 10+
- Docker（可選）

至少設定 **一個** 行情源（平台 env 與/或設定頁 BYOK）。

## 快速開始

```bash
cp .env.example .env
# 編輯 AUTH_SECRET、DATABASE_URL、CREDENTIALS_ENCRYPTION_KEY，以及至少一個行情源

docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

```bash
npm run worker
```

開啟 [http://localhost:3000](http://localhost:3000)（預設 locale `/en`）。

```bash
docker compose up --build
```

## 環境設定

見 [.env.example](./.env.example)。

憑證解析：**伺服器環境變數優先**，否則使用者 BYOK（加密存庫）。

| 變數 | 說明 |
|---|---|
| `LONGBRIDGE_*` / `FUTU_*` | 平台長橋 / 富途 |
| `BINANCE_*` / `OKX_*` | 可選加密 Key |
| `FINNHUB_API_KEY` | 回退行情 + 資訊 |
| `CREDENTIALS_ENCRYPTION_KEY` | 加密使用者 BYOK |
| `ADANOS_API_KEY` / `DEEPSEEK_API_KEY` | 情緒 / 平台 AI |
| `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` | 可選 OAuth |

實作細節：[docs/market-trading-tech.md](./docs/market-trading-tech.md)、[docs/architecture.md](./docs/architecture.md)。

## 常用指令

```bash
npm run dev
npm run build && npm start
npm run worker
npm run db:migrate
npm run lint
```

## 使用說明

1. **註冊 / 登入**：郵箱密碼；可選 Google / GitHub。
2. **市場頁**：美股/港股/A股/加密；愛心加入自選。
3. **詳情頁**：K 線、模擬交易、Tab、價格提醒。
4. **自選 / Portfolio**：關注清單與模擬帳戶。
5. **提醒**：需郵件 + Worker。
6. **設定**：偏好、BYOK、AI Key、邀請碼；側欄可收起為圖示。

## 文件

| 文件 | 說明 |
|---|---|
| [docs/](./docs/) | 文件中心 |
| [需求](./docs/requirements.md) | 功能範圍 |
| [啟動與環境](./docs/getting-started.md) | 安裝 |
| [行情與模擬交易](./docs/market-trading-tech.md) | Provider / 撮合 |
| [架構](./docs/architecture.md) · [API](./docs/api.md) · [資料庫](./docs/database.md) | 技術 |
| [部署](./docs/deployment.md) · [排障](./docs/troubleshooting.md) | 運維 |

## License

Private / 依倉庫約定使用。
