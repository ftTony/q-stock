import { readFileSync, writeFileSync } from "fs";

const map = {
  "en.json": ["Fullscreen", "Exit fullscreen"],
  "zh-CN.json": ["全屏", "退出全屏"],
  "zh-TW.json": ["全螢幕", "退出全螢幕"],
  "ja.json": ["全画面", "全画面を終了"],
  "ko.json": ["전체 화면", "전체 화면 종료"],
  "de.json": ["Vollbild", "Vollbild beenden"],
  "fr.json": ["Plein écran", "Quitter le plein écran"],
  "es.json": ["Pantalla completa", "Salir de pantalla completa"],
  "ms.json": ["Skrin penuh", "Keluar skrin penuh"],
  "th.json": ["เต็มหน้าจอ", "ออกจากเต็มหน้าจอ"],
};

for (const [name, [fsLabel, exitLabel]] of Object.entries(map)) {
  let buf = readFileSync(`messages/${name}`);
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    buf = buf.subarray(3);
  }
  let text = buf.toString("utf8");

  if (/"fullscreen"\s*:/.test(text)) {
    text = text.replace(
      /"fullscreen"\s*:\s*"[^"]*"/,
      `"fullscreen": ${JSON.stringify(fsLabel)}`,
    );
    text = text.replace(
      /"exitFullscreen"\s*:\s*"[^"]*"/,
      `"exitFullscreen": ${JSON.stringify(exitLabel)}`,
    );
  } else {
    text = text.replace(
      /("drawClear"\s*:\s*"[^"]*")/,
      `$1,\n    "fullscreen": ${JSON.stringify(fsLabel)},\n    "exitFullscreen": ${JSON.stringify(exitLabel)}`,
    );
  }

  // Also repair common mojibake from PowerShell if alerts.gte got corrupted in en
  JSON.parse(text);
  writeFileSync(`messages/${name}`, text, "utf8");
  console.log(name, "ok", JSON.parse(text).symbol.fullscreen);
}
