/**
 * 把 error.tsx 需要的 `common.errorBody` 文案写进全部 10 个语言包。
 *
 * 只做文本插入（插在 `"common": {` 里的 `"error"` 之后），
 * 不用 JSON.parse + stringify 重写整个文件——那会把现有格式全部打散，
 * 一个键的改动变成上千行 diff。
 *
 * 用法：node scripts/add-error-body-key.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname ?? ".", "..");

const COPY = {
  "zh-CN": "刚才的操作没有完成。重试一次通常就能恢复，也可以先回首页。",
  "zh-TW": "剛才的操作沒有完成。重試一次通常就能恢復，也可以先回首頁。",
  en: "This page didn't finish loading. Retrying usually fixes it — or head back home.",
  ja: "処理を完了できませんでした。もう一度試すと復帰することがほとんどです。ホームに戻ることもできます。",
  ko: "작업을 완료하지 못했습니다. 다시 시도하면 대부분 복구됩니다. 홈으로 돌아갈 수도 있습니다.",
  fr: "Cette page n'a pas pu se charger. Réessayer suffit généralement — ou revenez à l'accueil.",
  de: "Die Seite konnte nicht geladen werden. Ein erneuter Versuch hilft meist — oder zurück zur Startseite.",
  es: "La página no terminó de cargarse. Reintentar suele resolverlo, o vuelve al inicio.",
  ms: "Halaman ini tidak selesai dimuatkan. Cuba semula biasanya berkesan, atau kembali ke laman utama.",
  th: "หน้านี้โหลดไม่สำเร็จ ลองอีกครั้งมักจะกลับมาใช้งานได้ หรือกลับไปที่หน้าแรก",
};

for (const [locale, text] of Object.entries(COPY)) {
  const file = join(ROOT, "messages", `${locale}.json`);
  const raw = readFileSync(file, "utf8");

  if (raw.includes('"errorBody"')) {
    console.log(`${locale}: 已存在，跳过`);
    continue;
  }

  // 定位 "error" 这一行，插在它后面并保留原有的缩进
  const lines = raw.split("\n");
  const commonAt = lines.findIndex((l) => l.trimStart().startsWith('"common": {'));
  if (commonAt < 0) throw new Error(`${locale}: 找不到 common 段`);

  let inserted = false;
  for (let i = commonAt + 1; i < lines.length; i += 1) {
    const m = lines[i].match(/^(\s*)"error"\s*:/);
    if (!m) continue;
    const indent = m[1];
    lines.splice(
      i + 1,
      0,
      `${indent}"errorBody": ${JSON.stringify(text)},`,
    );
    inserted = true;
    break;
  }
  if (!inserted) throw new Error(`${locale}: common 段里找不到 "error"`);

  writeFileSync(file, lines.join("\n"));
  console.log(`${locale}: 已写入 errorBody`);
}
