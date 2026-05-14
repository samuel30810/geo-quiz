# Handoff: 地圖練習工具（方案 A · 清新教育版）

## Overview

純前端靜態地理練習網站。首頁讓使用者選「台灣縣市」或「世界國家」，進入練習頁後地圖隨機放大一個區域，使用者從下方四個文字選項中選出正確名稱，作答後顯示即時回饋，按「下一題」繼續。手機優先設計，部署至 GitHub Pages。

設計確認版本：**方案 A · 清新教育版**（米白底色 / 圓潤卡片 / Noto Sans TC / 綠色系）。

---

## About the Design Files

`design_refs/` 內的 `.html` / `.jsx` 檔案是 **設計參考**，不是直接拿去 production 的程式碼。它們是用 React + Babel 在瀏覽器即時編譯做的高保真原型，僅用來展示外觀、版面、行為與互動。

**實作方式**：依照原始 PRD（`original_planning.md`）所定的技術選型 — **原生 HTML + CSS + JS（無框架）+ D3 v7 + taiwan-atlas + world-atlas** — 在新的乾淨 repo 中重建。本份 README 已把所有設計細節（色票、字級、間距、互動）寫清楚，原則上你可以只看 README 就能實作出來；HTML 檔僅供「不確定某個畫面長怎樣」時對照用。

---

## Fidelity

**High-fidelity (hifi)**：本份設計提供完整的色彩 / 字體 / 間距 / 互動規格，目標是 pixel-perfect 重建。

---

## Tech Stack（同 PRD）

| 項目 | 決定 |
|------|------|
| 框架 | 原生 HTML + CSS + JS（無框架、無建置步驟） |
| 地圖渲染 | SVG + D3.js v7 |
| Zoom | `d3.zoom()` 操控 `<g>` transform |
| 字體 | Google Fonts: Noto Sans TC（400 / 500 / 600 / 700 / 800） |
| 部署 | GitHub Pages（push to `main` 自動部署） |
| 台灣資料 | `https://cdn.jsdelivr.net/npm/taiwan-atlas@2021.9.20/counties-10t.json` |
| 世界資料 | `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` |

---

## 重要的資料注意事項

> ⚠️ **taiwan-atlas 用「台」字（U+53F0），不是「臺」字（U+81FA）。** 設計時掉進這個坑過。資料裡實際是 `台北市`、`台中市`、`台南市`、`台東縣`。比對名稱時要用「台」。

> ⚠️ **世界國家需要白名單 + 中文名稱對照表**（Natural Earth 110m 預設只有英文 `name`，且包含 ~170 國 — 不全部納入題庫）。完整對照表見「附錄 A · 世界國家白名單」。

> ⚠️ **面積極小的國家**（新加坡、以色列、盧森堡等）在 110m 精度地圖上輪廓可能小到看不清。實作完後請目視驗證，若 zoom 後仍無法辨識輪廓，從白名單移除。

---

## Design Tokens

### 色彩

```css
/* 背景 / 表面 */
--bg:            #fbf8f1;   /* 整體頁面背景（暖米白） */
--card:          #ffffff;   /* 卡片 / 表面 */
--border:        rgba(31, 43, 37, 0.10);  /* 邊框 */

/* 文字 */
--ink:           #1f2b25;   /* 主要文字 */
--ink-dim:       #6a7770;   /* 次要文字 */

/* 主色（綠） */
--primary:       #1D9E75;   /* 主綠（按鈕 / 強調） */
--primary-dark:  #147a59;   /* 深綠（hover / 文字 on 淺背景） */
--primary-soft:  #e1f5ee;   /* 淺綠（標籤 / pill 背景） */

/* 縣市 / 國家狀態色（沿用 PRD 6.6） */
--county-default:    #cfe9dc;  /* 預設淺綠 */
--county-default-stroke: #ffffff;
--county-highlight:  #1D9E75;  /* 高亮（出題） */
--county-highlight-stroke: #0c5b41;
--county-correct:    #639922;  /* 答對閃爍 */
--county-wrong:      #E24B4A;  /* 答錯閃爍 */
--county-dim:        #e3ddcc;  /* 淡化其餘區域 */
--county-dim-stroke: #d6cfbb;

/* 海洋 / 地圖底色 */
--ocean:         #f1ead8;

/* 回饋色 */
--good:          #1D9E75;
--good-soft-bg:  #eaf6e3;
--good-text:     #3d5e16;
--bad:           #d44141;
--bad-soft-bg:   #fdecec;
--bad-text:      #a82d2d;
```

### 字體

- 全站使用 **Noto Sans TC**，fallback 為 `system-ui, sans-serif`
- 等寬字（顯示倍率、coords 等小註解）使用 `ui-monospace, "JetBrains Mono", monospace`

### 字級 / 字重（手機優先）

| 用途 | size / weight | 備註 |
|------|---------------|------|
| 首頁主標 | 30px / 800 | line-height 1.15, letter-spacing -0.02em |
| 首頁副文 | 14px / 400 | line-height 1.55, color: ink-dim |
| 題目主標 | 22px / 800 | letter-spacing -0.01em |
| QUESTION 標籤 | 11px / 600 | letter-spacing 0.16em, uppercase, color: ink-dim |
| 選項按鈕 | 16px / 600 | letter-spacing 0.02em |
| 回饋文字 | 14px / 600 | line-height 1.35 |
| 下一題按鈕 | 16px / 700 | |
| 頂部 score | 13px (數字 15px / 700) | color: primary-dark |
| 卡片標題 | 18px / 800 | |

桌機版（>= 1024px）整體放大約 1.4 倍，主標到 44px、題目主標 30px。

### 間距 / 圓角 / 陰影

```css
/* 圓角 */
--radius-sm:   8px;    /* 小元件、icon 容器 */
--radius-md:   14px;   /* 選項按鈕、回饋 pill */
--radius-lg:   16px;   /* 地圖容器、卡片內地圖預覽 */
--radius-xl:   18px;   /* 首頁卡片 */
--radius-pill: 999px;  /* 標籤 chip */

/* 陰影 */
--shadow-card:   0 1px 0 rgba(31, 43, 37, 0.04);
--shadow-button: 0 4px 12px rgba(29, 158, 117, 0.28);   /* 主按鈕 */
--shadow-inset:  inset 0 0 0 1px rgba(31, 43, 37, 0.06); /* 地圖容器 */

/* 間距 — 手機版 */
頁面左右 padding: 14px
卡片之間 gap: 14px
選項格 gap: 8px
標題下方 margin: 12-14px
```

---

## Screens

設計檔中對應的畫面：`design_refs/Mobile A.html`（手機優先）+ `design_refs/Design Exploration.html`（桌機版方案 A 在第一列）。

### Screen 1: 首頁 `index.html`

**Purpose**：選擇要練習哪個地圖（台灣 / 世界）。

**Layout**（手機版）：

```
┌─ 頁面（背景 #fbf8f1）─────────────────┐
│                                       │
│         [9:41]    [signal/wifi/batt]  │ ← iOS status bar
│                                       │
│         (右上：答對 0/0，第一次造訪可隱藏) │
│                                       │
│         ● 地圖練習工具  ← pill chip    │
│                                       │
│         看著地圖                       │ ← H1, 30px/800
│         認識每一個地方                  │
│                                       │
│         地圖會放大一個地方，從四個      │ ← p, 14px, ink-dim
│         選項裡選出正確的名字。           │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ ┌────┐ 台灣縣市      22 題       │  │ ← 卡片 1
│  │ │ ▒▒ │ 練習認識本島與外島         │  │
│  │ │▒▒▒│ 開始練習 →                │  │
│  │ └────┘                          │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ ┌────┐ 世界國家      50 題       │  │ ← 卡片 2
│  │ │ ▒▒ │ 五大洲的代表國家           │  │
│  │ │▒▒▒│ 開始練習 →                │  │
│  │ └────┘                          │  │
│  └─────────────────────────────────┘  │
│                                       │
│        taiwan-atlas · Natural Earth   │ ← 11px 灰
│                                       │
│                  ──                   │ ← home indicator
└───────────────────────────────────────┘
```

**Components**:

- **Pill chip「● 地圖練習工具」**
  - background: `--primary-soft`
  - color: `--primary-dark`
  - 圓點: 5×5px, background `--primary`
  - padding: 3px 10px
  - font: 11px / 600 / letter-spacing 0.08em

- **H1 主標**
  - 兩行斷句：`看著地圖 \n 認識每一個地方`
  - 30px / 800 / line-height 1.15 / letter-spacing -0.02em

- **入口卡片 ×2**
  - background: `--card`
  - border: 1.5px solid `--border`
  - border-radius: 18px
  - padding: 14px
  - shadow: `--shadow-card`
  - flex 橫向，gap 12px
  - 左側地圖預覽：96×96, border-radius 12, background `--ocean`，內含縮放的 SVG（無 zoom，整張地圖）
  - 右側 flex column：
    - 上排：標題 18px/800（左）＋「N 題」12px ink-dim（右），justify-between
    - 中：副文 13px / 1.4 ink-dim
    - 下：「開始練習 →」13px/700 primary-dark

**Behavior**:
- 整張卡片可點，點擊導向 `quiz.html?map=taiwan` 或 `quiz.html?map=world`
- Hover（桌機）：輕微 lift 或 border 變 primary

### Screen 2: 練習頁（進行中）`quiz.html`

**Purpose**：顯示題目地圖（放大目標縣市/國家），等使用者從 4 選項中選一個。

**Layout**（手機版 402×874）:

```
┌─ 頁面 ───────────────────────────────┐
│  [status bar]                        │
│                                      │
│  ← 返回           答對 2 / 22        │ ← 頂部列, height 44, bottom border
│                                      │
│         QUESTION 3                   │ ← 11px ink-dim
│         這是哪個縣市？                │ ← H1, 22px/800
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [TAIWAN MAP, zoom 到目標縣市]   │  │ ← 地圖容器
│  │  目標縣市填色 #1D9E75           │  │  width 374, height 340
│  │  其餘填色 #e3ddcc               │  │  bg --ocean, radius 16
│  │                       [3.6×]   │  │  右下：scale indicator (10px mono)
│  └────────────────────────────────┘  │
│                                      │
│  ┌──────────────┐ ┌──────────────┐   │ ← 選項 2×2 grid, gap 8
│  │   台中市     │ │   南投縣     │   │   每顆 min-height 56, padding 14×8
│  └──────────────┘ └──────────────┘   │   radius 14, border 1.5px --border
│  ┌──────────────┐ ┌──────────────┐   │   font 16/600
│  │   金門縣     │ │   宜蘭縣     │   │
│  └──────────────┘ └──────────────┘   │
│                                      │
│  (回饋區此時空 — height 48 佔位)      │ ← 預留高度避免抖動
│                                      │
│                  ──                  │
└──────────────────────────────────────┘
```

**Components**:

- **頂部列**
  - height: 44, padding 0 14, border-bottom 1px `--border`, background `--card`
  - 左：「← 返回」13px ink-dim, padding 4×6, border-radius 6
  - 右：「答對 **2** / 22」 — 數字 15px/700 primary-dark，其餘 13px ink-dim

- **題目區（置中）**
  - 「QUESTION 3」: 11px / 600, color ink-dim, letter-spacing 0.16em, uppercase, margin-bottom 4
  - 「這是哪個縣市？」/ 「這是哪個國家？」: 22px / 800, letter-spacing -0.01em
  - 整塊 margin-bottom 12

- **地圖容器**
  - width: container width - 28（手機 = 402 - 28 = 374）
  - height: 340（台灣）/ 240（世界）
  - background: `--ocean`
  - border-radius: 16
  - overflow: hidden
  - box-shadow: `--shadow-inset`
  - 內含 `<svg>` 滿版（width 100%, height 100%, viewBox=`0 0 W H`）
  - SVG 內第一層 `<g>` 帶 `transform="translate(tx, ty) scale(scale)"`，所有 paths 放在這個 `<g>` 內
  - 每個 path 的 `stroke-width` 應該除以 zoom scale，避免縮放後變粗
  - 右下角 scale indicator: `position: absolute; bottom: 8; right: 8; background: rgba(255,255,255,0.85); border-radius: 10; padding: 3px 8px; font: 10px mono; color: ink-dim;`，顯示 `3.6×`

- **選項按鈕**
  - 4 顆，CSS grid: `grid-template-columns: 1fr 1fr; gap: 8px;`
  - 每顆：
    - background `--card`
    - border 1.5px solid `--border`
    - border-radius 14
    - padding 14px 8px
    - min-height 56
    - font 16/600, color `--ink`, letter-spacing 0.02em
    - text-align center
    - cursor pointer
    - transition all .15s

### Screen 3: 練習頁 · 答對

跟 Screen 2 一樣，但地圖、選項、底部都進入「已答對」狀態：

**Diff**:
- 地圖目標縣市填色從 `--county-highlight` 變成 `--county-correct` (`#639922`)
- 4 顆選項：
  - 正解（也就是使用者按的那顆）：background `--good-soft-bg` (`#eaf6e3`)、border 2px `--county-correct`、color `--good-text` (`#3d5e16`)
  - 其餘 3 顆：opacity 0.5、color `--ink-dim`
- 回饋區顯示：
  - background `--good-soft-bg`, border-radius 12, padding 10×14, min-height 48
  - 左側 24×24 圓 background `--good`（綠）, color white, 內容 `✓`, font 13/800
  - 文字 14/600 primary-dark: `答對了！這是「南投縣」`（縣市名 strong）
- 「下一題 →」按鈕出現在最底部，緊貼底部、整寬
  - background `--primary`, color white, border-radius 14, padding 14
  - font 16/700
  - box-shadow `--shadow-button`

### Screen 4: 練習頁 · 答錯

跟 Screen 3 類似，但：

**Diff**:
- 地圖 **同時** zoom 到「正確答案」和「使用者錯選的位置」（fit bbox of both）
  - 這是設計上的決策：讓使用者看到自己錯在哪裡（規劃文件沒寫，但對學習有幫助）
  - 實作建議：計算兩個 feature 的聯合 bbox，scale = `Math.min(maxScale, 0.55 / max(dx/W, dy/H))`
- 兩個 feature 都填色：
  - 正確答案 → `--county-correct` (`#639922`)
  - 使用者錯選 → `--county-wrong` (`#E24B4A`)
- 4 顆選項：
  - 錯選那顆：background `--bad-soft-bg` (`#fdecec`)、border 2px `--county-wrong`、color `--bad-text` (`#a82d2d`)
  - 正確答案那顆：background `--good-soft-bg`、border 2px `--county-correct`、color `--good-text`
  - 其餘 2 顆：opacity 0.5
- 回饋區紅色：
  - background `--bad-soft-bg`、color `--bad-text`
  - 圖示圓背景 `--bad`，內容 `✕`
  - 文字 `答錯了，正確答案是「○○」` / 手機版簡寫成 `正確答案是「○○」`

---

## Interactions & Behavior

### 出題流程（engine.js）

```
nextQ():
  1. 清除上一題狀態（feedback / next-btn / 選項顏色）
  2. map.resetZoom()  // 縮回全圖
  3. map.resetStyles()  // 所有 path 回到 county-default
  4. 從白名單後的 features 中隨機抽一題 → current
  5. map.zoomTo(current)  // animate 到目標
  6. map.highlight(current)  // current 填 highlight、其餘填 dim
  7. renderChoices(current)  // 產生 4 個按鈕
```

### 點選項時（onAnswer(chosen)）

```
onAnswer(chosen):
  if (answered) return  // 防重複
  answered = true
  total++

  if (chosen === current):
    map.markCorrect(current)
    showFeedback('答對了！這是「○○」', good)
    score++
  else:
    // ⭐ 設計決策：zoom out 到 fit(current, chosen)
    map.zoomToFit([current, chosen])
    map.markWrong(chosen)
    map.markCorrect(current)
    showFeedback('正確答案是「○○」', bad)

  // 4 顆選項按 above spec 變色
  applyChoiceStates(...)
  updateScoreDisplay()
  showNextButton()
```

### Zoom 動畫

- `zoomTo(feature)`：用 d3.zoom().transform，計算 fit-to-feature 的 scale / translate
  - scale 公式：`Math.min(maxScale, 0.6 / Math.max(dx/W, dy/H))`，其中 dx/dy 是 feature bounds 寬高
  - maxScale: 台灣 4, 世界 3.5
  - center: bounds 中心點對齊容器中心
- 動畫: `duration 600ms, ease d3.easeCubicInOut`
- `resetZoom()`: animate 回 `identity transform`, `duration 400ms`

### 載入動畫

地圖 JSON 尚未載入時：地圖容器內顯示斜紋 placeholder + 「載入地圖中…」（11px mono, color ink-dim）。

### 錯誤狀態

- 地圖 JSON 載入失敗 → 地圖容器內顯示「地圖載入失敗，請檢查網路連線後重新整理」
- features 陣列為空（白名單過濾後空）→ 顯示「題庫載入異常」

### 鍵盤支援（建議加）

- 1 / 2 / 3 / 4 鍵 對應 4 個選項
- Space / Enter 進入下一題
- Esc 返回首頁

---

## RWD 斷點

| 斷點 | 地圖寬 | 選項欄數 |
|------|--------|---------|
| < 480px（手機） | 100vw - 28 | 2 |
| 480–768px | 440px | 2 |
| 768–1024px | 560px | 4 |
| > 1024px（桌機） | 640px | 4 |

- 選項按鈕 min-height 桌機 60、手機 56
- 主標 / H1 桌機 30px / 手機 22px
- 整體 padding 桌機 28-40 / 手機 14

---

## State Management

`engine.js` 內維護的狀態（無持久化，重整歸零）：

```js
state = {
  kind: 'taiwan' | 'world',  // from query string ?map=
  features: Feature[],        // 過濾過的題庫
  current: Feature | null,    // 當前題目
  choices: string[],          // 4 個選項名字
  answered: boolean,          // 是否已作答
  score: number,
  total: number,
}
```

---

## Files

```
design_handoff_geo_quiz/
├── README.md                       # 本檔
├── original_planning.md            # 原始 PRD（決定技術選型用）
└── design_refs/                    # 設計檔
    ├── Mobile A.html               # 主要參考：手機版 6 個畫面
    ├── Design Exploration.html     # 3 方案並排比較（方案 A 在第一列）
    ├── shared.jsx                  # TopoProvider + 工具函式（演算法可參考）
    ├── v1.jsx                      # 桌機版方案 A 元件
    ├── v1-mobile.jsx               # 手機版方案 A 元件
    ├── design-canvas.jsx           # 設計畫布殼（純展示用，不需要實作）
    └── ios-frame.jsx               # iPhone 殼（純展示用，不需要實作）
```

實作的 repo 結構建議（取自原 PRD § 6.1）：

```
/
├── index.html              # 首頁
├── quiz.html               # 練習主頁（共用）
├── css/style.css           # 全域樣式
├── js/
│   ├── engine.js           # 題目引擎
│   ├── map.js              # 地圖 + zoom
│   ├── data-taiwan.js      # 台灣設定
│   └── data-world.js       # 世界設定（含白名單）
└── README.md
```

---

## 附錄 A · 世界國家白名單（ISO numeric → 中文）

```js
const COUNTRY_NAMES = {
  // 亞洲
  '156': '中國', '392': '日本', '410': '韓國', '356': '印度', '764': '泰國',
  '704': '越南', '360': '印尼', '608': '菲律賓', '458': '馬來西亞',
  '682': '沙烏地阿拉伯', '792': '土耳其', '364': '伊朗', '376': '以色列',
  // 歐洲
  '826': '英國', '250': '法國', '276': '德國', '380': '義大利',
  '724': '西班牙', '620': '葡萄牙', '528': '荷蘭', '616': '波蘭',
  '804': '烏克蘭', '752': '瑞典', '578': '挪威', '756': '瑞士',
  '300': '希臘', '643': '俄羅斯',
  // 非洲
  '818': '埃及', '566': '奈及利亞', '710': '南非', '231': '衣索比亞',
  '404': '肯亞', '834': '坦尚尼亞', '504': '摩洛哥', '180': '剛果民主共和國',
  // 美洲
  '840': '美國', '124': '加拿大', '484': '墨西哥', '76': '巴西',
  '32': '阿根廷', '152': '智利', '170': '哥倫比亞', '604': '秘魯',
  '862': '委內瑞拉',
  // 大洋洲
  '36': '澳洲', '554': '紐西蘭'
};
```

> ⚠️ Natural Earth 的 `id` 是字串型態的 ISO numeric，**沒有前導零**（例如巴西是 `'76'` 不是 `'076'`）。比對時兩種都備一份。

---

## 附錄 B · 字體載入

`<head>` 內：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

CSS：

```css
body {
  font-family: "Noto Sans TC", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Assets

無外部圖片資產。所有「圖示」都是 unicode 符號（✓ / ✕ / →）或純 CSS 圓點。地圖完全由 D3 + topojson 動態繪製，不需要任何 PNG / SVG 檔。

---

## Open Questions / 待確認

從 PRD 帶過來的待確認項，handoff 時還沒處理：

1. **世界版小國輪廓**：新加坡 / 以色列 / 盧森堡等在 110m 精度可能畫不出明顯輪廓。建議實作後目視驗證，若 zoom 後仍不可辨認，從白名單移除（或保留但只考文字辨識，地圖不高亮）。
2. **答完最後一題的結算畫面** 尚未設計。建議再回頭確認需求後再加。
3. **離線快取 / PWA**：PRD 已明確排除。
4. **是否需要 localStorage 記分** / 不重複出題：PRD 已明確排除。

