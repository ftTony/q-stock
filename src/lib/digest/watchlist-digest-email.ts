import { localizedPath } from "@/i18n/config";
import {
  resolveAlertMailTransport,
  sendMail,
} from "@/lib/email";
import type {
  DigestLocale,
  DigestRow,
  WatchlistDigestPayload,
} from "@/lib/digest/gather-watchlist-digest";
import type { AssetType } from "@/lib/types";

function appBaseUrl(): string {
  return (
    process.env.APP_URL?.replace(/\/+$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}

function watchlistUrl(locale: DigestLocale): string {
  return `${appBaseUrl()}${localizedPath(locale, "/watchlist")}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPrice(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 2 : abs >= 1 ? 2 : 4;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function formatPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function assetLabel(assetType: AssetType, locale: DigestLocale): string {
  if (locale === "en") {
    if (assetType === "hk") return "HK";
    if (assetType === "crypto") return "Crypto";
    if (assetType === "cn") return "CN";
    return "US";
  }
  if (assetType === "hk") return "港股";
  if (assetType === "crypto") return "加密";
  if (assetType === "cn") return "A股";
  return "美股";
}

function pctColor(n: number | null): string {
  if (n == null || !Number.isFinite(n) || n === 0) return "#64748b";
  return n > 0 ? "#16a34a" : "#dc2626";
}

function copy(locale: DigestLocale) {
  if (locale === "en") {
    return {
      title: "Watchlist close digest",
      subtitle: (d: string) => `US session ${d} · after close`,
      market: "US market sentiment",
      headers: ["Symbol", "Close", "Change", "Sentiment", "AI advice"] as const,
      empty: "No watchlist quotes available.",
      subject: (d: string) => `Q-Stock watchlist digest · ${d}`,
      cta: "Open watchlist",
    };
  }
  if (locale === "zh-TW") {
    return {
      title: "自選股收盤摘要",
      subtitle: (d: string) => `美股交易日 ${d} · 收盤後`,
      market: "美股市場情緒",
      headers: ["標的", "收盤價", "漲跌幅", "市場情緒", "AI 建議"] as const,
      empty: "暫無自選行情。",
      subject: (d: string) => `錢力股自選摘要 · ${d}`,
      cta: "打開自選",
    };
  }
  return {
    title: "自选股收盘摘要",
    subtitle: (d: string) => `美股交易日 ${d} · 收盘后`,
    market: "美股市场情绪",
    headers: ["标的", "收盘价", "涨跌幅", "市场情绪", "AI建议"] as const,
    empty: "暂无自选行情。",
    subject: (d: string) => `钱力股自选摘要 · ${d}`,
    cta: "打开自选",
  };
}

function rowHtml(row: DigestRow, locale: DigestLocale): string {
  const sym = escapeHtml(row.symbol);
  const market = escapeHtml(assetLabel(row.assetType, locale));
  const price = escapeHtml(formatPrice(row.price));
  const pct = escapeHtml(formatPct(row.percentChange));
  const color = pctColor(row.percentChange);
  const sentiment = escapeHtml(row.sentiment);
  const ai = escapeHtml(row.aiAdvice);
  return `<tr>
    <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-weight:600">${sym}<br/><span style="font-size:11px;font-weight:400;color:#94a3b8">${market}</span></td>
    <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;font-variant-numeric:tabular-nums">${price}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;color:${color};font-variant-numeric:tabular-nums">${pct}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#475569">${sentiment}</td>
    <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155">${ai}</td>
  </tr>`;
}

function buildHtml(payload: WatchlistDigestPayload): string {
  const t = copy(payload.locale);
  const base = appBaseUrl();
  /** Dark header → logo-dark (light artwork on navy). */
  const logo = `${base}/logo-dark.png`;
  const watchlistHref = watchlistUrl(payload.locale);
  const bodyRows =
    payload.rows.length > 0
      ? payload.rows.map((r) => rowHtml(r, payload.locale)).join("")
      : `<tr><td colspan="5" style="padding:16px;color:#64748b">${escapeHtml(t.empty)}</td></tr>`;

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.55;color:#1a1a1a;max-width:720px;margin:0 auto">
    <div style="padding:24px 20px;border-radius:12px;background:linear-gradient(135deg,#0b1220 0%,#1e3a5f 100%);color:#fff">
      <img src="${logo}" alt="钱力股 Q-Stock" width="120" height="106" style="display:block;height:40px;width:auto;max-width:160px;margin:0 0 12px;border:0" />
      <h1 style="margin:0;font-size:20px;font-weight:600">${escapeHtml(t.title)}</h1>
      <p style="margin:6px 0 0;opacity:0.9;font-size:13px">${escapeHtml(t.subtitle(payload.tradeDate))}</p>
    </div>
    <p style="margin:16px 8px 8px;font-size:13px;color:#475569">
      <strong>${escapeHtml(t.market)}</strong>：${escapeHtml(payload.marketSentiment)}
    </p>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:13px">
      <thead>
        <tr style="background:#f1f5f9;color:#475569;text-align:left">
          <th style="padding:8px;font-weight:600">${escapeHtml(t.headers[0])}</th>
          <th style="padding:8px;font-weight:600;text-align:right">${escapeHtml(t.headers[1])}</th>
          <th style="padding:8px;font-weight:600;text-align:right">${escapeHtml(t.headers[2])}</th>
          <th style="padding:8px;font-weight:600">${escapeHtml(t.headers[3])}</th>
          <th style="padding:8px;font-weight:600">${escapeHtml(t.headers[4])}</th>
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <p style="margin:0 8px 20px">
      <a href="${watchlistHref}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#3b82f6;color:#fff;text-decoration:none;font-size:14px">${escapeHtml(t.cta)}</a>
    </p>
    <p style="font-size:12px;color:#94a3b8;padding:0 8px 8px;margin:0">钱力股 Q-STOCK · 行情与提醒仅供参考，不构成投资建议。<br/>Market data and alerts are for reference only — not investment advice.</p>
  </div>`;
}

function buildText(payload: WatchlistDigestPayload): string {
  const t = copy(payload.locale);
  const lines = [
    t.title,
    t.subtitle(payload.tradeDate),
    `${t.market}: ${payload.marketSentiment}`,
    "",
    ...payload.rows.map((r) => {
      const pct = formatPct(r.percentChange);
      return `${r.symbol} (${assetLabel(r.assetType, payload.locale)})  ${formatPrice(r.price)}  ${pct}  | ${r.sentiment} | ${r.aiAdvice}`;
    }),
    "",
    `${t.cta}: ${watchlistUrl(payload.locale)}`,
  ];
  return lines.join("\n");
}

export async function sendWatchlistDigestForUser(opts: {
  userId: string;
  to: string;
  payload: WatchlistDigestPayload;
}): Promise<void> {
  const transport = await resolveAlertMailTransport(opts.userId);
  const t = copy(opts.payload.locale);
  await sendMail(
    {
      to: opts.to,
      subject: t.subject(opts.payload.tradeDate),
      html: buildHtml(opts.payload),
      text: buildText(opts.payload),
    },
    transport,
  );
}
