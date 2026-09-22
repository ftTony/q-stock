# Q-Stock

**語言：** [简体中文](./README.md) · [English](./README.en.md) · [繁體中文](./README.zh-TW.md)

美股 / 加密貨幣行情 Web & H5 應用：多源行情、K 線指標、資訊評論、模擬交易、價格郵件提醒與市場情緒。

## 功能亮點

| 模組 | 說明 |
|---|---|
| 行情瀏覽 | 美股 / 加密熱門列表、搜尋、漲跌榜、靜默刷新 |
| 多源行情 | **長橋 → 富途 OpenAPI → Finnhub** 可設定優先級，失敗自動回退 |
| 個股詳情 | 日/季/年 K、MA / EMA / BOLL / RSI / MACD、開高低昨收 |
| 資訊 | 新聞、財報（驚喜/日曆/財務指標）、公告；加密無財報時友善提示 |
| 模擬交易 | 僅做多；市價 / 限價 / 止損；個股右側下單；Portfolio 資金/持倉/掛單 |
| 自選 & 資產 | 自選 CRUD、sparkline、資產概覽 KPI |
| 價格提醒 | 條件觸發郵件（Resend / SMTP）；後台 Worker 輪詢 |
| 情緒 | Adanos 輿情（長快取，額度不足時降級） |
| AI 分析 | OpenAI 相容介面；結合新聞 / 財報 / 報價輸出看多·中性·看空（約 30 分鐘快取） |
| 體驗 | 簡/繁/英、亮暗主題、紅漲綠跌 / 綠漲紅跌 |

技術棧：Next.js 15 · TypeScript · Tailwind · lightweight-charts · Auth.js · Prisma · PostgreSQL · Docker。

## 環境需求

- Node.js **20+**（建議 22）
- npm 10+
- Docker（可選，用於 Postgres 或全棧）

至少設定 **一個** 行情源憑證（長橋 / 富途 / Finnhub）。資訊依賴 Finnhub；情緒依賴 Adanos（可選）；AI 分析依賴 `OPENAI_API_KEY`（可選）。

## 快速開始

```bash
cp .env.example .env
# 編輯 .env，至少填寫 AUTH_SECRET、DATABASE_URL，以及一個行情源 Key

docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

另開終端啟動 Worker（價格提醒 + 模擬限價/止損撮合）：

```bash
npm run worker
```

瀏覽器開啟 [http://localhost:3000](http://localhost:3000)（預設進入 `/zh-CN`，可在介面切換語言）。

全棧一鍵：

```bash
docker compose up --build
```

## 環境設定

複製 [.env.example](./.env.example) 為 `.env`。常用變數：

### 應用與資料庫

| 變數 | 必填 | 說明 |
|---|---|---|
| `APP_URL` | 建議 | 如 `http://localhost:3000` |
| `AUTH_SECRET` | 是 | Auth.js 金鑰，足夠長的隨機字串 |
| `AUTH_TRUST_HOST` | 建議 | Docker / 反向代理時設 `true` |
| `DATABASE_URL` | 是 | PostgreSQL 連線字串 |

本機 Compose 資料庫預設：

```text
postgresql://qstock:qstock@localhost:5432/qstock?schema=public
```

### 行情資料源

| 變數 | 說明 |
|---|---|
| `MARKET_DATA_PROVIDERS` | 優先級 CSV，預設 `longbridge,futu,finnhub`；省略則依已設定憑證自動探測 |
| `LONGBRIDGE_APP_KEY` / `SECRET` / `ACCESS_TOKEN` | [長橋 OpenAPI](https://open.longbridge.com/)，三鍵齊全即啟用 |
| `FUTU_ACCESS_TOKEN` | [富途雲端 OpenAPI](https://open.futunn.com/zh-cn/api/overview/) Bearer（建議，無需 OpenD） |
| `FUTU_APP_KEY` + `FUTU_PRIVATE_KEY` | 富途 Legacy AppKey 簽名（可選） |
| `FINNHUB_API_KEY` | Finnhub：回退行情 + 新聞/財報/公告 |

### 其他

| 變數 | 說明 |
|---|---|
| `ADANOS_API_KEY` | 市場情緒；缺失則 UI 降級 |
| `OPENAI_API_KEY` | AI 趨勢分析（OpenAI 相容）；缺失則 Tab 降級 |
| `OPENAI_BASE_URL` | 可選，預設 `https://api.openai.com` |
| `OPENAI_MODEL` | 可選，預設 `gpt-4o-mini` |
| `EMAIL_FROM` / `RESEND_API_KEY` | 提醒郵件（優先 Resend） |
| `SMTP_*` | Resend 不可用時的 SMTP 回退 |
| `ALERT_POLL_INTERVAL_MS` | Worker 輪詢間隔，預設 `45000` |

## 常用指令

```bash
npm run dev              # 開發（Turbopack）
npm run build && npm start
npm run worker           # 提醒 + 模擬掛單撮合
npm run db:migrate       # 套用遷移
npm run db:migrate:dev   # 開發期改 schema
npm run lint
```

## 使用說明（產品側）

1. **註冊 / 登入**：郵箱密碼；登入後可自選、評論、提醒、模擬交易。
2. **市場頁**：切換美股 / 加密，搜尋進入詳情。
3. **詳情頁**：看 K 線與指標；右側做模擬買賣；下方 Tab 看新聞/財報/公告/評論/情緒/AI 分析。
4. **自選 / Portfolio**：管理關注標的；查看模擬帳戶資金、持倉浮盈、掛單。
5. **提醒**：詳情頁或提醒頁設定價格 ≥ / ≤ 觸發價，需設定郵件通道並由 Worker 運行。
6. **設定**：語言、主題、漲跌色偏好可持久化。

模擬交易初始資金 **$100,000**（僅做多）；可在 Portfolio 重置帳戶。真實券商下單介面已預留，尚未接通。

## 文件

| 文件 | 說明 |
|---|---|
| [docs/](./docs/) | 文件中心 |
| [需求](./docs/requirements.md) | 功能範圍與驗收 |
| [啟動與環境](./docs/getting-started.md) | 更細的安裝與排錯 |
| [行情多源與模擬交易實現思路](./docs/market-trading-tech.md) | Provider / 撮合設計 |
| [架構](./docs/architecture.md) · [API](./docs/api.md) · [資料庫](./docs/database.md) | 技術細節 |
| [部署](./docs/deployment.md) · [排障](./docs/troubleshooting.md) | 運維 |

## License

Private / 依倉庫約定使用。
