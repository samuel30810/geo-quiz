# Code Review Log — 雙語顯示 + 世界地圖國家擴充

**規劃文件**：docs/plans/20260515-bilingual-and-world-expansion.md

---

## Round 1（2026-05-15）

### Review 結果

---

#### Step 1 — Compile Verification（編譯驗證）

本專案為純前端靜態網站（原生 HTML + CSS + JS，無框架、無建置步驟）。對三個修改的 JS 檔案執行 Node.js 語法檢查（`node --check`）：

- `js/engine.js`：通過
- `js/data-taiwan.js`：通過
- `js/data-world.js`：通過

CSS 與 HTML 以人工 code trace 確認語法無誤。

**結論：編譯驗證通過。**

---

#### Step 2 — Requirement Coverage（需求覆蓋）

逐條對照規劃文件 checklist：

| # | 規劃項目 | 狀態 | 備註 |
|---|---------|------|------|
| 6.1 | `quiz.html` 加入 `#question-text-en` | ✅ 已實作 | 第 26 行，位置正確 |
| 6.2 | CSS `.question-text-en` 樣式 | ✅ 已實作 | 與規劃一致 |
| 6.2 | `.choice-btn` 修改（flex、padding、min-height） | ✅ 已實作 | 與規劃一致 |
| 6.2 | `.choice-cn` / `.choice-en` 子元素樣式 | ✅ 已實作 | 與規劃一致 |
| 6.2 | `@media (min-width: 768px)` `.choice-btn min-height: 76px` | ✅ 已實作 | 第 933 行 |
| 6.2 | S3 — 768px 與 1024px 斷點的 `min-height` 覆寫確認 | ✅ 無需調整 | 1024px 斷點無 `.choice-btn` 覆寫，768px 已處理 |
| 6.3 | `TAIWAN_EN_NAMES` 對照表（27 筆） | ✅ 已實作 | 全 27 筆縣市 + 離島齊全 |
| 6.3 | `TAIWAN_MAP_CONFIG.questionTextEn` | ✅ 已實作 | |
| 6.3 | `TAIWAN_MAP_CONFIG.getEnName()` | ✅ 已實作 | |
| 6.4 | `COUNTRY_NAMES['180']` 改為 `'民主剛果'` | ✅ 已實作 | |
| 6.4 | `COUNTRY_EN_NAMES` 完整約 100 筆 | ✅ 已實作 | 實際 101 筆（含新增） |
| 6.4 | `COUNTRY_NAMES` 新增所有新增國家中文名 | ✅ 已實作 | |
| 6.4 | `keepMulti` 加入 `'598'`（巴布亞紐幾內亞） | ✅ 已實作 | |
| 6.4 | `WORLD_MAP_CONFIG.questionTextEn` | ✅ 已實作 | |
| 6.4 | `WORLD_MAP_CONFIG.getEnName()` | ✅ 已實作 | |
| 6.5 | `engine.js` 初始化設定 `question-text-en` | ✅ 已實作 | 含 `\|\| ''` 防禦 |
| 6.5 | `buildChoices()` 回傳 `{cn, en}[]` | ✅ 已實作 | |
| 6.5 | `renderChoices()` 改為雙行按鈕 | ✅ 已實作 | |
| 6.5 | `onAnswer()` 取英文名傳給 `showFeedback` | ✅ 已實作 | |
| 6.5 | `showFeedback()` 地名改為「中文 (英文)」格式 | ✅ 已實作 | |
| 7 | `docs/architecture.md` 新增三列決策 | ✅ 已實作 | |
| 7 | `docs/bugfix-log.md` 新增小國渲染風險記錄 | ✅ 已實作 | |

**結論：所有規劃 checklist 項目均已實作。**

---

#### Step 2.5 — User Journey Verification（使用者行為驗證）

**主流程 trace（台灣地圖）：**

1. 進入 `quiz.html?map=taiwan&mode=practice`
2. engine 載入 `TAIWAN_MAP_CONFIG`，設定 `question-text-en` = `'Which county / city is this?'` ✅
3. TopoJSON 載入後，`buildChoices(current)` 回傳 `{cn, en}[]`
4. `renderChoices` 為每個選項建立含 `.choice-cn` 和 `.choice-en` 的按鈕 ✅
5. 點擊選項 → `onAnswer(pair.cn)` 比對 `config.getName(current)`（中文名）✅
6. `showFeedback` 顯示「答對了！這是「台北市 (Taipei City)」」✅

**主流程 trace（世界地圖）：**

1. 進入 `quiz.html?map=world&mode=random`
2. `getEnName` 查 `String(feature.id || feature.properties._id || '')`
3. 對於巴西（TopoJSON `feature.id = 76`）：`String(76) = '76'` → `COUNTRY_EN_NAMES['76'] = 'Brazil'` ✅
4. 對於澳洲（TopoJSON `feature.id = 36`）：`String(36) = '36'` → `COUNTRY_EN_NAMES['36'] = 'Australia'` ✅

**`[hidden]` attribute 靜態檢查點：**
`quiz.html` 與 `index.html` 的可見性切換透過 `style.display = 'none'` / `''` 實作，未使用 HTML `hidden` attribute，此靜態檢查點不適用。

**橫向 tab 寬度靜態檢查點：**
本次變更無固定寬度容器內的橫向 tab，不適用。

**結論：使用者主流程無行為錯誤。**

---

#### Step 3 — Cross-layer Consistency（跨層一致性）

本專案為純前端靜態網站，無後端或資料庫層。

- `MAP_CONFIG` 介面擴充 `questionTextEn` 與 `getEnName()`，`TAIWAN_MAP_CONFIG` 與 `WORLD_MAP_CONFIG` 均已實作，`engine.js` 呼叫時有 `|| ''` 防禦，無介面不一致問題。
- `buildChoices()` 回傳型別從 `string[]` 改為 `{cn, en}[]`，唯一消費方 `renderChoices()` 同步更新，無遺漏呼叫方。
- `showFeedback()` 簽名加第三參數 `enName`，唯一呼叫方 `onAnswer()` 同步更新。
- `COUNTRY_NAMES['180']` 更名為 `'民主剛果'`，影響範圍限於 `getName()` 回傳值與 `buildChoices` 的名稱比對，均透過 `getName()` 取得，無硬寫字串殘留。

**結論：無跨層不一致問題。**

---

#### Step 4 — Code Quality（程式碼品質）

**1. 安全性**：純靜態前端，無使用者輸入寫回 DOM，無 XSS 或注入風險。

**2. Key 格式不一致（可正常運作但有維護風險）**

`COUNTRY_NAMES` 中南美洲三國保留補零 key（`'076'` 巴西、`'032'` 阿根廷）與大洋洲（`'036'` 澳洲），而 `COUNTRY_EN_NAMES` 中同三國使用非補零 key（`'76'`、`'32'`、`'36'`）。經驗證，兩者透過各自的雙軌查找邏輯均能正確運作：

- `processFeatures` 過濾與 `getName` 查 `COUNTRY_NAMES`：`String(f.id)='76'` → `COUNTRY_NAMES['76']` 不存在 → fallback `padStart(3,'0')='076'` → 找到 ✅
- `getEnName` 查 `COUNTRY_EN_NAMES`：`String(feature.id)='76'` → `COUNTRY_EN_NAMES['76']='Brazil'` → 找到 ✅

功能正常，但兩個表的 key 格式不統一，日後維護新增國家時需注意。

🔵 **Suggestion**：將 `COUNTRY_NAMES` 中 `'076'`/`'032'`/`'036'` 統一改為非補零格式（`'76'`/`'32'`/`'36'`），使兩個表的 key 格式一致，降低維護混淆風險。

**3. `totalCount` 未更新**

`WORLD_MAP_CONFIG.totalCount` 仍為 `50`，但實際白名單已擴充至 101 個國家。

🟡 **Warning**：`totalCount` 值為過時的舊值（50），與實際國家數（約 101）不符。需確認 `totalCount` 欄位在 `engine.js` 中的使用方式——若有邏輯依賴此欄位（如顯示「共 X 個國家」的 UI），將顯示錯誤數字。

**4. `@media (min-width: 480px)` 斷點**

480px 斷點無 `.choice-btn` 的 `min-height` 覆寫（規劃文件 S3 要求檢查），確認 480px~767px 範圍沿用基礎樣式 `min-height: 68px`，768px+ 升為 76px。數值符合內容增加後的視覺需求，無問題。

**5. 邊界情況**

- `getEnName` 查無結果時回傳 `''`，`renderChoices` 有 `if (pair.en)` 判斷（不顯示空的英文行），`showFeedback` 有 `enName ?` 判斷（退化為純中文），防禦完整 ✅
- `config.questionTextEn || ''` 防禦未來 config 漏加欄位時不顯示 `"undefined"` ✅

**結論：無 Critical 問題，發現 1 個 Warning 和 1 個 Suggestion。**

---

#### Step 5 — Verdict（最終結論）

| 等級 | 數量 | 問題 |
|------|------|------|
| 🔴 Critical | 0 | 無 |
| 🟡 Warning | 1 | `WORLD_MAP_CONFIG.totalCount` 仍為 `50`，實際國家數已為約 101 |
| 🔵 Suggestion | 1 | `COUNTRY_NAMES` 與 `COUNTRY_EN_NAMES` key 格式不一致（功能正常，維護風險） |

**整體評估**：實作品質良好，所有規劃項目均已實作，雙語功能邏輯完整，邊界處理妥當。唯一需要確認的是 `totalCount` 是否有業務邏輯依賴。

---
📋 **下一步**：phase-fix
規劃文件：docs/plans/20260515-bilingual-and-world-expansion.md
Review Log：docs/reviews/20260515-bilingual-and-world-expansion.md

💡 本輪無 Critical 問題。phase-fix 處理完 Warning 後即可結案，不需要再跑一輪 Review。

---

## Round 1 Fix Response（2026-05-15）

### 修正項目

| 等級 | 問題 | 處理方式 | 狀態 |
|------|------|----------|------|
| 🟡 Warning | `WORLD_MAP_CONFIG.totalCount` 仍為 `50` | 已修正為 `101`，`subtitle` 同步更新為 `'五大洲約 100 個國家'` | ✅ 已修正 |
| 🔵 Suggestion | `COUNTRY_NAMES` 與 `COUNTRY_EN_NAMES` key 格式不一致 | 功能正常，暫不修正，維護時注意 | ⏭️ 略過 |

### 修正說明

**Warning — `totalCount` 更新**

`js/data-world.js` 中 `WORLD_MAP_CONFIG` 的兩個欄位已更新：
- `totalCount: 50` → `totalCount: 101`
- `subtitle: '五大洲約 50 個國家'` → `subtitle: '五大洲約 100 個國家'`

此修正確保 UI 顯示的國家總數與實際白名單數量一致。

### 結案結論

本次功能（雙語顯示 + 世界地圖國家擴充）所有問題均已處理完畢。無 Critical，唯一 Warning 已修正，Suggestion 為功能正常的維護提醒，本輪不修正。**結案。**
