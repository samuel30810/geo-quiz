# 程式碼目錄

**最後更新**：2026-05-15

## 檔案結構

```
geo-quiz/
├── index.html          # 首頁（兩步驟模式與地圖選擇）
├── quiz.html           # 測驗頁面（地圖 + 選項 + 結果畫面）
├── css/
│   └── style.css       # 全站樣式、設計令牌、RWD 斷點
├── js/
│   ├── data-taiwan.js  # 台灣地圖設定：名稱對照表、離島拆分邏輯
│   ├── data-world.js   # 世界地圖設定：國家名稱對照表、MultiPolygon 處理
│   ├── map.js          # SVG 地圖渲染、D3 zoom、path 樣式管理
│   └── engine.js       # 測驗流程：出題、計分、回饋、結果畫面
└── docs/
    ├── architecture.md
    ├── code-index.md   # 本文件
    └── ...
```

## 模組職責

| 檔案 | 職責 | 對外提供 |
| ---- | ---- | -------- |
| `index.html` | 首頁兩步驟流程（選模式 → 選地圖），純 DOM 切換不換頁 | — |
| `quiz.html` | 測驗頁 HTML 結構，含地圖容器、選項格、回饋區與結果畫面 | — |
| `css/style.css` | 全站設計令牌、元件樣式（首頁、測驗頁、結果頁）與 RWD 斷點 | CSS 自訂屬性 |
| `js/data-taiwan.js` | 台灣縣市英文名稱對照表與地圖設定物件，含離島座標切割邏輯 | `TAIWAN_MAP_CONFIG` |
| `js/data-world.js` | 世界國家中英文名稱對照表與地圖設定物件，含 MultiPolygon 保留清單 | `WORLD_MAP_CONFIG` |
| `js/map.js` | SVG 地圖渲染、D3 zoom 互動、path 高亮 / 正確 / 錯誤樣式管理 | `MapModule` |
| `js/engine.js` | 測驗流程控制：題庫建立、選項產生、答題判斷、計分與結果畫面渲染 | — （IIFE） |

## 載入 / 執行順序

`quiz.html` 依序載入：

1. `data-taiwan.js` → 宣告 `TAIWAN_MAP_CONFIG`（全域）
2. `data-world.js`  → 宣告 `WORLD_MAP_CONFIG`（全域）
3. `map.js`         → 宣告 `MapModule`（全域）
4. `engine.js`      → IIFE 執行，讀取 URL 參數 `map` / `mode`，消費對應 MAP_CONFIG 介面與 MapModule

兩個資料設定檔均需在 `engine.js` 之前載入，因為 engine 在執行期才依 URL 參數決定使用哪個。

## 核心資料流

```
使用者點擊首頁 → 選模式（practice / random）→ 選地圖（taiwan / world）
  → 跳轉 quiz.html?map=taiwan&mode=practice

quiz.html 載入
  → engine.js IIFE 啟動
  → fetch(config.topoUrl)（CDN）
  → config.processFeatures(topo)  ← data-taiwan.js / data-world.js
  → MapModule.init(svgEl, ...)    ← map.js
  → buildQueue() → shuffle features
  → nextQ()
      → MapModule.resetStyles() → MapModule.zoomTo(current)
      → buildChoices() → renderChoices()

使用者點選答案
  → onAnswer(chosen)
  → MapModule.markCorrect / markWrong
  → showFeedback()
  → nextBtn 顯示

全部題目完成
  → showResult()（practice：圓環；random：大字分數）
  → retry() 可重置或返回首頁
```

## 相關文件

- [架構文件](architecture.md)
- [Bugfix 記錄](bugfix-log.md)
- [設計稿交付](design-handoff-quiz-modes.md)
