# Code Review Log — 世界國家隨機模式：難度分級與國家介紹

**規劃文件**：docs/plans/20260521-world-difficulty-and-country-desc.md

---

## Round 1（2026-05-21）

### Review 結果

#### Step 1 — Compile Verification（編譯驗證）

本專案為純前端靜態網站（HTML + CSS + JS，無框架無建置步驟），無編譯步驟。

逐檔檢查語法：
- `js/data-world.js`：無語法錯誤。所有物件字面值與方法定義結構正確。
- `js/engine.js`：無語法錯誤。IIFE 結構完整，新增的 `buildQueue` 分支與 `showFeedback` 修改語法正確。
- `index.html`：HTML 結構完整，`<script>` 內的 JS 無語法錯誤。
- `css/style.css`：無語法錯誤，所有新增選擇器與屬性格式正確。

**結論**：通過。

---

#### Step 2 — Requirement Coverage（需求覆蓋）

逐條比對規劃文件的 checkbox：

| # | 規劃要求 | 狀態 | 備註 |
|---|---------|------|------|
| 6.1-1 | `COUNTRY_RANK` 物件，150 筆，key=國家ID，value=排名 1-150 | ✅ 已實作 | 經程式驗證 150 筆，值 1-150 完整無重複 |
| 6.1-2 | `COUNTRY_DESC` 物件，150 筆，key=國家ID，value=介紹文字 | ✅ 已實作 | 經程式驗證 150 筆，key 與 COUNTRY_NAMES 完全一致 |
| 6.1-3 | `getDesc(feature)` helper 方法 | ✅ 已實作 | 含 padStart 防禦 |
| 6.1-4 | `getRank(feature)` helper 方法 | ✅ 已實作 | 含 padStart 防禦，預設 999 |
| 6.2-1 | `#difficulty-overlay` HTML 結構 | ✅ 已實作 | 結構與規劃完全一致 |
| 6.2-2 | `cardWorld` click 攔截邏輯 | ✅ 已實作 | `selectedMode === 'random'` 時 preventDefault 並顯示 overlay |
| 6.2-3 | 難度按鈕跳轉帶 `difficulty` 參數 | ✅ 已實作 | |
| 6.2-4 | 關閉按鈕隱藏 overlay | ✅ 已實作 | 含點擊遮罩關閉 |
| 6.3-1 | 讀取 `difficulty` URL 參數 | ✅ 已實作 | |
| 6.3-2 | `buildQueue()` 分層抽取邏輯 | ✅ 已實作 | easy/medium/hard 三種配置 |
| 6.3-3 | 遞補機制 | ✅ 已實作 | 先向後遞補（forward pass），不足時反向遞補（backward pass） |
| 6.3-4 | `showFeedback()` 附加國家介紹 | ✅ 已實作 | `config.getDesc && config.getDesc(current)` 防禦 |
| 6.3-5 | `showResult()` 顯示難度文字 | ✅ 已實作 | diffLabels 對應正確 |
| 6.4-1 | `.difficulty-overlay` 全螢幕遮罩樣式 | ✅ 已實作 | |
| 6.4-2 | `.difficulty-panel` 面板樣式 | ✅ 已實作 | |
| 6.4-3 | `.difficulty-close` 關閉按鈕樣式 | ✅ 已實作 | |
| 6.4-4 | `.difficulty-title` 標題樣式 | ✅ 已實作 | |
| 6.4-5 | `.difficulty-desc` 說明文字樣式 | ✅ 已實作 | |
| 6.4-6 | `.difficulty-options` 容器樣式 | ✅ 已實作 | |
| 6.4-7 | `.difficulty-option` 選項按鈕樣式 | ✅ 已實作 | |
| 6.4-8 | `.fb-desc` 國家介紹文字樣式 | ✅ 已實作 | |
| 6.4-9 | `.feedback-area` 改為 column 佈局 + `.fb-main` wrapper | ✅ 已實作 | |
| 6.6-1 | 邊界：getRank 回傳 999 for unknown | ✅ 已實作 | |
| 6.6-2 | 邊界：tier 不足的遞補機制 | ✅ 已實作 | |
| 6.6-3 | 邊界：difficulty 不在 easy/medium/hard 走原邏輯 | ✅ 已實作 | `diffConfigs[difficulty]` 為 undefined 時走 else |
| 6.6-4 | 邊界：台灣 config 無 getRank | ✅ 已實作 | `config.getRank` falsy 時走 else |
| 6.6-5 | 邊界：台灣 config 無 getDesc | ✅ 已實作 | `config.getDesc &&` 防禦 |
| 7-1 | 更新 architecture.md 架構表格 | ✅ 已實作 | |
| 7-2 | 更新 architecture.md 關鍵決策表格 | ✅ 已實作 | |

**結論**：所有規劃要求均已實作，覆蓋率 100%。

---

#### Step 2.5 — User Journey Verification（使用者行為驗證）

**Journey 1：世界國家 + 隨機模式 + 選擇難度**
1. 首頁選「隨機」→ 進入 Step 2
2. 點「世界國家」卡片 → `e.preventDefault()` 攔截，顯示 difficulty overlay
3. 選擇「簡單」→ 跳轉 `quiz.html?map=world&mode=random&difficulty=easy`
4. engine 讀取 difficulty → buildQueue 分層抽取 tier1 取 20 → 開始答題
5. 答題後顯示國家介紹文字
6. 結果頁顯示「挑戰結束 · 世界國家 · 簡單」

走得通，無問題。

**Journey 2：世界國家 + 練習模式（不應觸發難度選擇）**
1. 首頁選「練習」→ 進入 Step 2
2. 點「世界國家」卡片 → `selectedMode === 'practice'`，不攔截，直接跳轉 `quiz.html?map=world&mode=practice`
3. engine 中 difficulty 為空 → `diffConfigs['']` 為 undefined → 走 else 分支，全部 shuffle

走得通，無問題。

**Journey 3：台灣 + 隨機模式（不應觸發難度選擇）**
1. 首頁選「隨機」→ 進入 Step 2
2. 點「台灣縣市」卡片 → `cardTaiwan` 沒有 click 攔截，直接跳轉

走得通，無問題。

**Journey 4：難度 overlay 關閉**
1. 顯示 overlay 後，點「✕」→ 隱藏
2. 點遮罩背景 → `e.target === diffOverlay` 時隱藏

走得通，無問題。

**Journey 5：世界國家 + 隨機 + 再來一次**
1. 答完 20 題 → 結果頁
2. 按「再來一次」→ `retry()` → `buildQueue()` 重新執行 → 因 difficulty 變數仍在 closure 中保持原值 → 重新分層抽取

走得通，無問題。

**Journey 6：直接手動輸入 URL（無 difficulty 參數）**
1. `quiz.html?map=world&mode=random` → difficulty 為空字串 → `diffConfigs['']` 為 undefined → 走原本全 shuffle 邏輯

走得通，向後相容。

**結論**：所有主要使用流程均正常，未發現行為問題。

---

#### Step 3 — Cross-layer Consistency（跨層一致性）

本專案為純前端靜態頁面，無 DB、無 Backend API。

跨檔案一致性檢查：
- `index.html` 傳出的 URL 參數 `difficulty=easy|medium|hard` 與 `engine.js` 中 `diffConfigs` 的 key 完全一致。
- `data-world.js` 新增的 `getDesc()` 和 `getRank()` 方法，在 `engine.js` 中以 `config.getDesc` 和 `config.getRank` 正確呼叫。
- `COUNTRY_NAMES`、`COUNTRY_EN_NAMES`、`COUNTRY_RANK`、`COUNTRY_DESC` 四個物件的 key 集合經程式驗證完全一致（150 筆），rank 值 1-150 無遺漏無重複。
- `keepMulti` Set 新增了 `'242'`（斐濟）、`'44'`（巴哈馬）、`'780'`（千里達及托巴哥），這三個都是群島國家，邏輯正確。
- `totalCount` 已從 101 更新為 150，`subtitle` 也同步更新。

**結論**：跨層一致，無問題。

---

#### Step 4 — Code Quality（程式碼品質）

**安全性**：
- 無 XSS 風險：`descDiv.textContent = desc` 使用 textContent 而非 innerHTML，安全。
- `resultChip.innerHTML` 使用 innerHTML 但內容來自硬編碼的 `diffLabels` 和 `mapLabel`，均為受控字串，無注入風險。
- difficulty 參數值來自 URL，但僅作為 `diffConfigs` 的 key 查詢，不匹配時走 else，無注入面。

**效能**：
- `diffConfigs` 物件在每次 `buildQueue()` 呼叫時重新建立。由於 `buildQueue` 只在開始和 retry 時呼叫（極低頻率），效能影響可忽略。
- 150 個 features 的 forEach + shuffle 操作為 O(n)，無效能疑慮。

**錯誤處理**：
- `config.getDesc && config.getDesc(current)` 防禦了台灣 config 無此方法的情況。
- `config.getRank` 檢查防禦了無此方法的情況。
- `diffConfigs[difficulty]` 對不合法值回傳 undefined，走 else 分支，防禦完備。

**邊界情況**：
- 遞補機制分析：第一遍 forward pass（i=0,1,2）會將 deficit 向後傳遞。若某 tier 不夠，deficit 累計到下一個 tier。第二遍 backward pass（j=2,1,0）從剩餘項目中補足。在正常情況下（每 tier 各 50 國），不會觸發遞補。在 features 不足的極端情況下（例如部分國家無法在 TopoJSON 中找到），遞補機制能正確運作。唯一注意：若總 features 不足 20，`questionQueue` 會小於 20，但 `total = questionQueue.length` 和 `score * 5` 的計分會因 total 不是 20 而失真。不過這在實際資料中不會發生（150 國全在 TopoJSON 110m 中），且規劃文件已確認這是防禦性保護。

**`'410'` 改名注意**：本次將 `'410'` 的中文名從 `'韓國'` 改為 `'南韓'`。這不在規劃文件的 scope 中，但不影響功能（選項和回饋文字會顯示新名稱）。

**結論**：程式碼品質良好，未發現問題。

---

#### Step 5 — Verdict（最終結論）

**問題總計**：🔴 Critical 0 個、🟡 Warning 0 個、🔵 Suggestion 0 個

本次變更完整實作了規劃文件的所有要求，資料層 4 個物件（COUNTRY_NAMES、COUNTRY_EN_NAMES、COUNTRY_RANK、COUNTRY_DESC）的 150 筆資料完全一致且正確。難度分層抽題邏輯（含遞補機制）正確，所有邊界情況均有防禦。UI 結構、事件處理、CSS 樣式均與規劃一致。向後相容性完備（台灣地圖、練習模式、無 difficulty 參數的世界隨機模式均不受影響）。

---

✅ **Review 通過**，可以進行 git commit。
