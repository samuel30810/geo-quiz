# 專案架構

**最後更新**：2026-05-15

## 系統概述

這是一個純前端靜態地理練習網站，目標使用者為學生（國小為主）。系統提供台灣縣市與離島（22 縣市 + 5 離島，共 27 個）與世界國家（約 50 個）兩種地圖模式，無需建置步驟，直接以瀏覽器開啟即可使用。練習模式為：地圖隨機高亮一個區域並自動 zoom 進去，使用者從四個文字選項中選出正確名稱，作答後即時顯示回饋。介面以手機優先設計，部署於 GitHub Pages，無後端、無登入，所有狀態存在記憶體，重整後重置。

## 架構

| 元件 | 職責 | 路徑 | 備註 |
| ---- | ---- | ---- | ---- |
| 首頁 | 模式選擇入口，讓使用者選擇台灣或世界版 | `index.html` | 靜態頁面，無邏輯 |
| 練習頁 | 共用的練習主畫面，包含地圖、選項區、回饋列 | `quiz.html` | 透過 URL 參數區分模式 |
| 題目引擎 | 出題、計分、回饋顯示，與地圖渲染解耦 | `js/engine.js` | 消費 MAP_CONFIG 介面 |
| 地圖模組 | SVG 地圖渲染、D3 zoom、path 樣式管理 | `js/map.js` | 資料無關，只處理視覺 |
| 台灣資料設定 | 台灣縣市 TopoJSON URL、屬性欄位、名稱取得方式、離島拆分邏輯 | `js/data-taiwan.js` | 實作 MAP_CONFIG 介面；`processFeatures` 依座標範圍從母縣市 MultiPolygon 拆出 5 座離島（蘭嶼、綠島、小琉球、龜山島、基隆嶼）為獨立 feature |
| 世界資料設定 | 世界國家 TopoJSON URL、ISO 名稱對照表、國家白名單 | `js/data-world.js` | 實作 MAP_CONFIG 介面 |
| 樣式 | 全域 CSS、RWD 斷點、地圖 path 狀態色 | `css/style.css` | |
| CI/CD | push to main 後自動部署至 GitHub Pages | `.github/workflows/` | 使用 actions/deploy-pages |

元件關係：

- `quiz.html` 依 URL 參數載入對應的資料設定模組（`data-taiwan.js` 或 `data-world.js`）
- `engine.js` 消費 MAP_CONFIG 介面進行出題邏輯，呼叫 `map.js` 執行視覺操作
- `map.js` 透過 D3.js（CDN）渲染 SVG，地圖資料由各資料模組提供的 TopoJSON URL 從 CDN 取得

核心流程：

1. 使用者在首頁選擇模式 → 跳轉至 `quiz.html?mode=taiwan`（或 world）→ engine 載入對應資料模組 → 地圖渲染完成後自動出第一題
2. 出題：engine 隨機抽取一個 feature → map zoom 到目標區域並高亮 → 產生 4 個選項按鈕
3. 作答：engine 判斷對錯 → map 更新 path 樣式（正確/錯誤色）→ 顯示回饋文字 → 顯示「下一題」按鈕

## 關鍵決策

| 決策 | 選擇 | 原因 | 時間 |
| ---- | ---- | ---- | ---- |
| 技術棧 | 原生 HTML + CSS + JS（無框架、無建置步驟） | 純靜態部署、零建置步驟、維護簡單 | 2026-05-14 |
| 多地圖架構 | 單一 quiz.html + 可抽換資料模組（MAP_CONFIG 介面） | 未來擴展新地圖只需新增資料設定檔，不動核心邏輯 | 2026-05-14 |
| 地圖渲染 | SVG + D3.js v7 | 可操控個別 path class，動畫流暢 | 2026-05-14 |
| Zoom 實作 | d3.zoom() 操控 SVG `<g>` transform | D3 原生支援、不影響 path 點擊判斷 | 2026-05-14 |
| 世界地圖資料 | Natural Earth 110m + 手動國家白名單（約 50 國） | 檔案小（約 100KB），主流國家輪廓精度足夠；面積極小國家可能無法渲染需排除 | 2026-05-14 |
| 部署平台 | GitHub Pages | 與 git 工作流自然整合，工程師維護成本低 | 2026-05-14 |
| 離島拆分方式 | 在 `processFeatures` 內依硬寫的座標 bounding box 從母縣市 MultiPolygon 拆出離島 polygon | 不引入額外資料源、不改 TopoJSON，邏輯集中在資料設定檔內；同一離島的多個 polygon 合併為 MultiPolygon | 2026-05-15 |
