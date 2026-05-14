# 台灣 ＋ 世界地理練習網站

## 1. Summary（變更範圍摘要）

建立一個純前端靜態地理練習網站，目標族群為學生（國小為主）。首頁提供「台灣縣市」與「世界國家」兩種地圖模式選擇，共用同一套題目引擎。練習模式僅保留模式一：地圖隨機高亮一個區域，使用者從下方四個文字選項中選出正確名稱。高亮時地圖自動 zoom 到目標區域讓使用者看清楚輪廓，作答後顯示即時回饋，按下一題才繼續。介面以手機為優先設計，部署至 GitHub Pages。

---

## 2. Architecture Decisions（架構決策）

| 決策項目 | 選項 | 決定 | 原因 |
|----------|------|------|------|
| 技術棧 | 原生 JS / React / Vue | 原生 HTML + CSS + JS（無框架） | 純靜態部署、零建置步驟、維護簡單 |
| 多地圖架構 | 每個地圖一支 HTML / 共用引擎 | 單一 `index.html` + 可抽換資料模組 | 未來擴展新地圖只需新增資料設定檔 |
| 地圖渲染 | SVG + D3 / Canvas | SVG + D3.js v7 | 可操控個別 path class、原始規格已確認 |
| Zoom 實作 | `d3.zoom()` 操控 SVG transform / CSS transform | `d3.zoom()` 操控 SVG `<g>` transform | D3 原生支援、動畫流暢、不影響 path 點擊判斷 |
| 部署平台 | GitHub Pages / Netlify / Cloudflare Pages | GitHub Pages | 工程師維護、git 工作流自然整合 |
| 世界地圖資料 | Natural Earth 110m / 50m | Natural Earth 110m（搭配手動國家白名單） | 檔案小（約 100KB）、主流 50 國輪廓精度足夠 |

---

## 2.5 Artifact Contracts（產出物契約）

本次無產出物契約（純前端靜態頁面，無檔案生成、無 API 簽名變更）。

---

## 3. Key Assumptions（關鍵假設）

- CDN 資源（D3、TopoJSON、taiwan-atlas、Natural Earth）在目標使用者網路環境下可正常載入；若載入失敗，頁面顯示錯誤提示。
- 台灣資料：`https://cdn.jsdelivr.net/npm/taiwan-atlas@2021.9.20/counties-10t.json` 可穩定存取，屬性欄位 `COUNTYNAME` / `COUNTYID` 不變（已由原始規格確認）。
- 世界資料：Natural Earth 110m TopoJSON 由 `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` 提供，國家代碼使用 ISO 3166-1 numeric，需搭配手動維護的名稱對照表（whitelist）。
- 使用者裝置支援現代瀏覽器（Chrome 90+、Safari 14+）；不支援 IE。
- 無後端、無登入，所有狀態存在記憶體，重整頁面後重置。
- 世界版約 50 個主流國家清單由開發者手動維護（見 § 6 Frontend Changes 附錄）。
- ⚠️ 待確認：Natural Earth 的小國（例如新加坡、盧森堡）在 110m 精度下可能無法渲染出可辨識的 path，這些國家是否直接從世界版題庫排除？（建議：排除面積 < 5,000 km² 的國家，改由選項文字辨識，不要求在地圖上看到高亮輪廓。）

---

## 4. Database Changes

無（純前端，無資料庫）。

---

## 5. Backend Changes

無（純靜態，無後端）。

---

## 6. Frontend Changes

### 6.1 檔案結構

```
/
├── index.html          # 首頁：選擇台灣版 / 世界版
├── quiz.html           # 練習主頁面（共用）
├── css/
│   └── style.css       # 全域樣式、RWD breakpoints
├── js/
│   ├── engine.js       # 題目引擎（出題、計分、回饋，地圖無關）
│   ├── map.js          # 地圖渲染與 zoom（D3 操作，資料無關）
│   ├── data-taiwan.js  # 台灣資料設定（URL、屬性欄位、getName、getId）
│   └── data-world.js   # 世界資料設定（URL、白名單、名稱對照表）
└── README.md
```

### 6.2 資料模組介面（data-*.js 的標準輸出）

每個資料模組需匯出一個設定物件，供 `engine.js` 消費：

```js
const MAP_CONFIG = {
  topoUrl: '...',                    // TopoJSON CDN URL
  objectKey: (topo) => Object.keys(topo.objects)[0],  // 取 feature key
  getName: (feature) => '...',       // 取顯示名稱
  getId:   (feature) => '...',       // 取唯一 ID（用於答案比對）
  whitelist: null,                   // null = 全部；Array<id> = 過濾白名單
  projection: 'mercator',            // 投影類型，未來可擴充
};
```

### 6.3 題目引擎流程（engine.js）

```
nextQ()
  ├── 清除上一題狀態（feedback、next-btn、選項區）
  ├── map.resetZoom()          // 地圖縮回全圖
  ├── map.resetStyles()        // 重設所有 path class
  ├── 從 whitelist 過濾後的 features 中隨機抽一題 (current)
  ├── map.zoomTo(current)      // 地圖動畫 zoom 到目標區域
  ├── map.highlight(current)   // 高亮目標，其餘 dim
  └── renderChoices(current)   // 產生 4 個選項按鈕
```

```
onAnswer(chosen)
  ├── if answered → return（防重複）
  ├── answered = true, total++
  ├── if correct:
  │     map.markCorrect(current)
  │     showFeedback('答對了！', green)
  │     score++
  └── if wrong:
        map.markWrong(chosen)
        map.markCorrect(current)   // 同時標出正確位置
        showFeedback('答錯了，正確答案是 XX', red)
  └── updateScoreDisplay()
  └── showNextButton()
```

### 6.4 地圖 Zoom 規格（map.js）

- 使用 `d3.zoom()` 綁定在 SVG 元素，操控內層 `<g>` 的 `transform`
- `zoomTo(feature)`：計算 feature 的 bounding box → 算出 scale 與 translate，使目標佔可視區域約 60–70%
- Zoom 動畫：`duration 600ms`，`ease d3.easeCubicInOut`
- `resetZoom()`：animate 回 `scale(1) translate(0,0)`，`duration 400ms`
- Zoom 期間不鎖定互動（使用者可提前點選，不影響答題邏輯）

### 6.5 RWD 規格

| 斷點 | 地圖最大寬 | 選項按鈕欄數 |
|------|-----------|------------|
| < 480px（手機） | 100vw | 2 欄 |
| 480–768px（大手機/小平板） | 440px | 2 欄 |
| 768–1024px（平板） | 560px | 4 欄 |
| > 1024px（桌機） | 640px | 4 欄 |

- 選項按鈕最小高度 `48px`（符合 WCAG 觸控目標大小）
- 地圖 SVG：`viewBox="0 0 380 560"`（台灣）/ `viewBox="0 0 800 500"`（世界），`width: 100%`，`height: auto`

### 6.6 縣市顏色狀態（沿用原始規格）

| 狀態 | CSS Class | 填色 |
|------|-----------|------|
| 預設 | `.county-path` | `#E1F5EE` |
| 高亮（出題） | `.county-path.highlighted` | `#1D9E75` |
| 答對 | `.county-path.correct-flash` | `#639922` |
| 答錯 | `.county-path.wrong-flash` | `#E24B4A` |
| 淡化 | `.county-path.dim` | `#D3D1C7` |

### 6.7 頁面版面（由上到下）

```
[ 首頁 index.html ]
  Logo / 標題
  [ 台灣縣市 ] [ 世界國家 ]  ← 兩個大按鈕

[ 練習頁 quiz.html ]
  頂部列：← 返回首頁  |  答對 N / 總題 N
  題目說明框：「這是哪個縣市/國家？」
  SVG 地圖（置中，RWD 自適應）
  選項區（2 或 4 欄按鈕格）
  回饋文字列
  下一題按鈕（作答後才顯示）
```

### 6.8 錯誤狀態處理

- 地圖 JSON 載入失敗 → 顯示「地圖載入失敗，請檢查網路連線後重新整理」，按鈕停用
- features 陣列為空（whitelist 過濾後無資料）→ 顯示「題庫載入異常」
- 單題 zoomTo 計算出 NaN bbox → fallback 到 resetZoom，不中斷遊戲

### 6.9 世界版國家白名單（約 50 國，data-world.js 手動維護）

依各洲代表性大國，ISO numeric ID：

**亞洲**：中國（156）、日本（392）、韓國（410）、印度（356）、泰國（764）、越南（704）、印尼（360）、菲律賓（608）、馬來西亞（458）、沙烏地阿拉伯（682）、土耳其（792）、伊朗（364）、以色列（376）

**歐洲**：英國（826）、法國（250）、德國（276）、義大利（380）、西班牙（724）、葡萄牙（620）、荷蘭（528）、波蘭（616）、烏克蘭（804）、瑞典（752）、挪威（578）、瑞士（756）、希臘（300）、俄羅斯（643）

**非洲**：埃及（818）、奈及利亞（566）、南非（710）、衣索比亞（231）、肯亞（404）、坦尚尼亞（834）、摩洛哥（504）、剛果民主共和國（180）

**美洲**：美國（840）、加拿大（124）、墨西哥（484）、巴西（076）、阿根廷（032）、智利（152）、哥倫比亞（170）、秘魯（604）、委內瑞拉（862）

**大洋洲**：澳洲（036）、紐西蘭（554）

> ⚠️ 面積極小的國家（新加坡 716、以色列 376 等）在 110m 精度地圖上可能顯示為極細 path，需在實作時以實際渲染結果決定是否從白名單移除。

---

## 7. Other Changes

- [ ] 建立 `README.md`：說明專案目的、本地開發方式（直接用瀏覽器開啟或 `npx serve .`）、GitHub Pages 部署步驟
- [ ] 建立 `.github/workflows/deploy.yml`：push to `main` → 自動部署至 GitHub Pages（使用 `actions/deploy-pages`）
- [ ] ⚠️ 需確認：`world-atlas` npm 套件實際 CDN 路徑與 JSON 結構（建議實作前執行 `curl https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json | head` 確認欄位）

---

## 8. Compatibility Checklist

- [x] 純新建專案，無既有程式碼，無相容性問題
- [x] 無資料庫，無 migration 需求
- [x] GitHub Pages 部署不影響任何現有服務

---

## 9. Out of Scope（本輪不含）

- 模式二（看名稱→點地圖）：已明確排除
- 分洲練習切換：世界版本輪全混出題
- 計分持久化（localStorage）：重整歸零即可
- 每輪不重複題目邏輯：本輪純隨機
- 離線 PWA / Service Worker
- 多語言（英文介面）
- 單元測試 / E2E 測試
- 自訂網域（github.io 預設網址即可）
- 效能優化（首次載入 CDN 延遲可接受）
