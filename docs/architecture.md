# 專案架構

**最後更新**：2026-05-21（選項按鈕加入國家介紹）

## 系統概述

這是一個純前端靜態地理練習網站，目標使用者為學生（國小為主）。系統提供台灣縣市與離島（22 縣市 + 5 離島，共 27 個）與世界國家（150 個）兩種地圖，以及兩種練習模式：**練習模式**（題庫全出一次不重複，結束後顯示正確率圓環）和**隨機模式**（隨機抽 20 題不重複，一題 5 分滿分 100，結束後顯示分數）。首頁為兩步驟流程：先選模式、再選地圖。作答流程為：地圖高亮一個區域並自動 zoom 進去，使用者從四個文字選項中選出正確名稱，作答後即時顯示回饋，全部答完後顯示結束畫面。世界地圖模式下，每個選項按鈕直接顯示中文名、英文名與國家介紹（2 行截斷，超過 45 字留空）；回饋欄於作答後同樣顯示介紹。介面以手機優先設計，部署於 GitHub Pages，無後端、無登入，所有狀態存在記憶體，重整後重置。

## 架構

| 元件 | 職責 | 路徑 | 備註 |
| ---- | ---- | ---- | ---- |
| 首頁 | 兩步驟選擇入口：先選模式（練習/隨機）、再選地圖（台灣/世界） | `index.html` | 純 DOM 切換，不換頁 |
| 練習頁 | 共用的練習主畫面，包含地圖、選項區、回饋列 | `quiz.html` | 透過 URL 參數區分模式 |
| 題目引擎 | 出題、計分、回饋顯示，與地圖渲染解耦 | `js/engine.js` | 消費 MAP_CONFIG 介面 |
| 地圖模組 | SVG 地圖渲染、D3 zoom、path 樣式管理 | `js/map.js` | 資料無關，只處理視覺 |
| 台灣資料設定 | 台灣縣市 TopoJSON URL、屬性欄位、名稱取得方式、離島拆分邏輯 | `js/data-taiwan.js` | 實作 MAP_CONFIG 介面；`processFeatures` 依座標範圍從母縣市 MultiPolygon 拆出 5 座離島（蘭嶼、綠島、小琉球、龜山島、基隆嶼）為獨立 feature |
| 世界資料設定 | 世界國家 TopoJSON URL、ISO 名稱對照表、國家白名單、排名與介紹資料 | `js/data-world.js` | 實作 MAP_CONFIG 介面；`processFeatures` 將海外領土國家的 MultiPolygon 裁切為最大 Polygon，但群島國家（印尼、菲律賓、日本、馬來西亞、紐西蘭）保留完整 MultiPolygon；以三段式 fallback（原始 id → padStart → parseInt strip）修正 TopoJSON 前導零 ID 不匹配問題；透過內嵌 `WORLD_PATCH` 常數補齊 110m 資料集缺失的 6 個小島國（新加坡、巴林、馬爾地夫、馬爾他、模里西斯、巴貝多） |
| 難度選擇 overlay | 世界國家 + 隨機模式的難度選擇 UI（簡單/進階/困難） | `index.html` 內 `#difficulty-overlay` | 僅在世界+隨機時顯示，選擇後帶 `difficulty` 參數跳轉 quiz.html |
| 樣式 | 全域 CSS、RWD 斷點、地圖 path 狀態色 | `css/style.css` | |
| CI/CD | push to main 後自動部署至 GitHub Pages | `.github/workflows/` | 使用 actions/deploy-pages |

元件關係：

- `quiz.html` 依 URL 參數載入對應的資料設定模組（`data-taiwan.js` 或 `data-world.js`）
- `engine.js` 消費 MAP_CONFIG 介面進行出題邏輯，呼叫 `map.js` 執行視覺操作
- `map.js` 透過 D3.js（CDN）渲染 SVG，地圖資料由各資料模組提供的 TopoJSON URL 從 CDN 取得

核心流程：

1. 使用者在首頁選擇模式（練習/隨機）→ 選擇地圖 → 跳轉至 `quiz.html?map=taiwan&mode=practice`（或 random / world）→ engine 載入對應資料模組 → 建立題目佇列（練習：全部 shuffle；隨機：shuffle 取前 20）→ 地圖渲染完成後自動出第一題
2. 出題：engine 從題目佇列依序取出下一題 → map zoom 到目標區域並高亮 → 產生 4 個選項按鈕
3. 作答：engine 判斷對錯 → map 更新 path 樣式（正確/錯誤色）→ 顯示回饋文字 → 顯示「下一題」按鈕（最後一題改為「查看結果」）
4. 結束：題目佇列用盡 → 顯示結束畫面（練習：正確率圓環；隨機：大字分數 + 進度條）→ 可「再來一次」或「返回首頁」

## 關鍵決策

| 決策 | 選擇 | 原因 | 時間 |
| ---- | ---- | ---- | ---- |
| 技術棧 | 原生 HTML + CSS + JS（無框架、無建置步驟） | 純靜態部署、零建置步驟、維護簡單 | 2026-05-14 |
| 多地圖架構 | 單一 quiz.html + 可抽換資料模組（MAP_CONFIG 介面） | 未來擴展新地圖只需新增資料設定檔，不動核心邏輯 | 2026-05-14 |
| 地圖渲染 | SVG + D3.js v7 | 可操控個別 path class，動畫流暢 | 2026-05-14 |
| Zoom 實作 | d3.zoom() 操控 SVG `<g>` transform | D3 原生支援、不影響 path 點擊判斷 | 2026-05-14 |
| 世界地圖資料 | Natural Earth 110m + 手動國家白名單（150 國） | 檔案小（約 100KB），主流國家輪廓精度足夠；面積極小國家可能無法渲染需排除 | 2026-05-14 |
| 部署平台 | GitHub Pages | 與 git 工作流自然整合，工程師維護成本低 | 2026-05-14 |
| 離島拆分方式 | 在 `processFeatures` 內依硬寫的座標 bounding box 從母縣市 MultiPolygon 拆出離島 polygon | 不引入額外資料源、不改 TopoJSON，邏輯集中在資料設定檔內；同一離島的多個 polygon 合併為 MultiPolygon | 2026-05-15 |
| 模式切換方式 | 首頁 DOM 切換（Step 1 模式選擇 → Step 2 地圖選擇），不另開頁面 | 減少頁面跳轉，體驗更流暢；模式與地圖透過 URL 參數 `mode` + `map` 傳遞給 quiz.html | 2026-05-15 |
| 群島國家 MultiPolygon 保留 | `processFeatures` 對印尼、菲律賓、日本、馬來西亞、紐西蘭、巴布亞紐幾內亞、斐濟、巴哈馬、千里達及托巴哥（共 9 國）跳過 MultiPolygon → Polygon 裁切 | 這些國家的多個 polygon 構成本體形狀（群島），裁切會導致只剩單一島嶼無法辨識；其他有海外領土的國家（法國、美國等）仍裁切以確保 zoom 聚焦本土 | 2026-05-15 |
| 雙語顯示方式 | 問題副標 + 選項按鈕雙行 + Feedback 中英格式 | 雙語教學需求，學生可對照學習；MAP_CONFIG 介面擴充 `questionTextEn` 與 `getEnName()` | 2026-05-15 |
| 小國渲染風險保留 | 牙買加、賽普勒斯（中風險）照常加入白名單 | 使用者知情確認，優先完整性；渲染失敗僅影響單一題目視覺，不崩潰（新加坡、巴林已由 WORLD_PATCH 補丁解決，不再是風險項） | 2026-05-15 |
| TopoJSON ID 前導零修正 | `processFeatures` 的 filter / key lookup 及 `getEnName` / `getDesc` / `getRank` 均採三段式 fallback：原始 id → `padStart(3,'0')` → `String(parseInt(id,10))` | Natural Earth 110m 的 feature id 是帶前導零的字串（如 `"004"`），但 `COUNTRY_NAMES` 等字典的 key 為短字串（`"4"`）；`padStart` 對已滿 3 位的字串是 no-op，導致 14 個國家被 filter 吃掉；`parseInt` strip 作為第三段 fallback 解決此問題 | 2026-05-21 |
| 110m 小島國 GeoJSON 補丁 | 6 個在 110m 資料集中完全缺失的小島國（新加坡、巴林、馬爾地夫、馬爾他、模里西斯、巴貝多）以 `WORLD_PATCH` 常數內嵌於 `data-world.js`，geometry 從 50m 資料集擷取後精簡存入 | 保留輕量 110m 主資料（105 KB），只補丁 6 國（+4 KB），避免整包換成 50m（739 KB）造成 7 倍載入負擔 | 2026-05-21 |
| 首頁題數動態更新 | `index.html` 的 async preview 區塊在 `processFeatures` 後以實際 features 長度覆寫 `totalCount` | `totalCount` 若硬寫會與實際出題數不一致（原 150 硬寫，實際 130）；改為動態取值後選擇畫面與測驗頁永遠一致，也無需手動維護 | 2026-05-21 |
| 民主剛果中文名稱 | `'剛果民主共和國'` → `'民主剛果'` | 對齊使用者提供之新國家名單（非版面考量），同時將英文名更新為 `'Democratic Republic of the Congo'` | 2026-05-15 |
| 國家排名抽題 | 使用靜態排名資料（`COUNTRY_RANK`）將 150 國分為三層，依難度分層抽題 | 排名資料固定不變、不需動態更新；分層抽取確保不同難度涵蓋不同知名度的國家 | 2026-05-21 |
| 選項按鈕顯示國家介紹 | 世界地圖模式下，每個選項按鈕加入 `.choice-desc`（10px、`-webkit-line-clamp:2`）；`buildChoices` 呼叫 `config.getDesc`，超過 45 字或無資料則留空；台灣地圖不受影響 | 讓學生在作答前即可看到提示，降低純靠記憶的壓力；截 2 行保持 4 顆按鈕高度一致；45 字閾值排除極少數過長描述避免排版破版 | 2026-05-21 |
