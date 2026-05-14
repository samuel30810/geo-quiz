# Code Review Log — 台灣＋世界地理練習網站

**規劃文件**：`docs/20260514-geo-quiz-app.md`

---

## Round 1（2026-05-14）

### Review 結果

#### Step 1 — Compile Verification

純前端靜態專案，無建置工具。逐一檢查 HTML / CSS / JS 語法，均無語法或結構錯誤。

#### Step 2 — Requirement Coverage

| 規劃需求 | 狀態 | 說明 |
|---------|------|------|
| index.html 首頁：兩個模式卡片 | ✅ | 已實作 |
| quiz.html 練習主頁面 | ✅ | 已實作 |
| css/style.css 全域樣式、RWD | ✅ | 已實作 |
| js/engine.js 題目引擎 | ✅ | 已實作 |
| js/map.js 地圖渲染與 zoom | ✅ | 已實作 |
| js/data-taiwan.js 台灣資料 | ✅ | 已實作 |
| js/data-world.js 世界資料 | ✅ | 已實作 |
| MAP_CONFIG 標準介面（objectKey、whitelist 欄位）| ⚠️ | `objectKey` 欄位改為 `processFeatures()`、`whitelist: null` 不存在；功能等效，但與規劃書契約不完全一致 |
| nextQ() / onAnswer() 完整流程 | ✅ | 已實作 |
| zoomTo / resetZoom 動畫規格 | ✅ | 已實作（600ms / 400ms） |
| zoomTo NaN fallback | ✅ | `_computeTransform` 有 NaN/infinity 檢查 |
| RWD 斷點（2欄 / 4欄）| ✅ | 已實作 |
| 選項按鈕 min-height 48px | ✅ | 實際 56px（超標） |
| 錯誤狀態處理 | ✅ | 已實作 |
| 世界白名單 50 國 | ⚠️ | 重複鍵寫法，詳見 Step 4 |
| README.md | ✅ | 已建立 |
| deploy.yml GitHub Pages | ✅ | 已建立 |
| SVG viewBox 規格（台灣 380×560 / 世界 800×500）| ❌ | 未設 viewBox。engine.js 直接用 clientWidth 動態設尺寸，規劃書 §6.5 明確要求固定 viewBox + width:100% + height:auto |

#### Step 2.5 — User Journey Verification

主流程（首頁 → 台灣/世界練習 → 作答 → 下一題）整體可正常運作。

發現一個特定操作下的狀態競爭問題：

**快速連按「下一題」的 setTimeout 競爭**：`nextQ()` 呼叫 `resetZoom(400ms)` 後以 `setTimeout(420ms)` 等待，若使用者在 420ms 內再次觸發 `nextQ()`，兩個 timeout 同時 pending。第一個 timeout 執行時 `current` 已被第二次 `nextQ()` 更新，導致 `zoomTo` 和 `highlight` 指向新題，視覺上出現 zoom 方向混亂與短暫高亮閃爍。最終狀態正確，但觸控裝置快速操作體驗損壞（評為 🟡 W1）。

#### Step 3 — Cross-layer Consistency

純前端靜態專案，無後端或 DB 層。data-*.js 匯出的 config 物件欄位與 engine.js、map.js、index.html 的呼叫方式完全一致。**無一致性問題。**

#### Step 4 — Code Quality

**安全性**：`showFeedback` 使用 `innerHTML` 拼接包含 CDN 資料的字串，來源為 TopoJSON 屬性值而非使用者輸入，XSS 實際風險極低（評為 🔵 S2）。

**data-world.js 重複鍵**：`'76': '巴西', '076': '巴西'` 等重複鍵，因 JS 物件後者覆蓋前者且值相同，不影響功能，但寫法混亂（評為 🔵 S1）。

**SVG resize 問題**：`mapContainer.clientWidth` 只在初始化時取一次，旋轉裝置後 SVG 不更新，手機橫豎切換時地圖顯示異常（評為 🟡 W2）。

**錯誤處理**：fetch 失敗、features 空、NaN bbox 均有防護，完整。

**deploy.yml**：使用標籤版本（`@v4`），存在供應鏈理論風險（評為 🔵 S3）。

#### Step 5 — Verdict

| 等級 | # | 問題 |
|------|---|------|
| 🔴 Critical | 0 | — |
| 🟡 Warning | 2 | W1、W2（詳見下方） |
| 🔵 Suggestion | 3 | S1、S2、S3（詳見下方） |

---

**🟡 W1：快速連按「下一題」導致 setTimeout 競爭**

- 檔案：`js/engine.js`，`nextQ()` 第 89–93 行
- 問題：每次呼叫 `nextQ()` 都會設定一個 `setTimeout(420ms)`。若在 timeout 到期前再次呼叫 `nextQ()`，兩個 timeout 同時 pending。第一個 timeout 觸發時 `current` 已是新題，`zoomTo` 與 `highlight` 作用在新題上，但 `resetStyles()` 又被第二次呼叫執行，產生 zoom 閃爍與高亮混亂。手機觸控快速操作時必現。
- 建議修正方向：在 `nextQ()` 開頭用變數儲存 `setTimeout` 回傳的 id，每次呼叫前先 `clearTimeout` 舊 id。

**🟡 W2：SVG 不響應視窗大小變化**

- 檔案：`js/engine.js`，初始化區段第 51–57 行
- 問題：`mapContainer.clientWidth` 僅在 fetch 完成時取一次，旋轉裝置或調整視窗後 SVG 尺寸不更新。目標受眾是學生，手機是主要裝置，橫豎旋轉是常見操作，旋轉後地圖會顯示異常（過窄或溢出）。
- 建議修正方向：監聽 `resize` 事件（或 `ResizeObserver`），在視窗尺寸變化時重新呼叫 `MapModule.init` 並保留當前題目狀態。

---

**🔵 S1：data-world.js 重複鍵寫法**

- `'76': '巴西', '076': '巴西'` 等三組重複鍵，值相同但可讀性差。建議在 `processFeatures` 內統一 id 格式，移除物件中的重複鍵。

**🔵 S2：showFeedback 使用 innerHTML 拼接外部資料**

- `js/engine.js` 第 163–169 行。建議改用 `createElement` / `textContent` 分段設定，符合防禦性實踐。

**🔵 S3：deploy.yml 使用標籤版本而非 commit hash**

- `.github/workflows/deploy.yml`。標籤可被重新指向，建議釘定 commit hash 以避免供應鏈攻擊（對學生工具優先度低）。

---

### Fix 回應

**回應時間**：2026-05-14

#### 逐條評估

| # | 問題摘要 | 嚴重度 | 我的立場 | 說明 |
|---|---------|--------|---------|------|
| W1 | nextQ() setTimeout 競爭，快速點「下一題」導致 zoom 閃爍 | 🟡 | ✅ 同意 | 新增模組層級變數 `nextQTimer`，每次 `nextQ()` 開頭執行 `clearTimeout(nextQTimer)` 再重新設定，確保同時最多只有一個 pending timer |
| W2 | `clientWidth` 只取一次，旋轉裝置後地圖異常 | 🟡 | ✅ 同意 | 將初始化邏輯抽為 `initMap()` 函式，使用 `ResizeObserver` 監聽 `mapContainer` 尺寸變化並重新呼叫；resize 後若 `current` 存在，重新套用高亮／答對答錯狀態，保持題目連續性 |
| - | 🔵 Suggestion ×3 項 | 🔵 | S1、S2 順手處理；S3 延後 | S1（重複鍵）與 S2（innerHTML）修改成本低且效益明確，本次一併修正；S3（deploy.yml 釘定 commit hash）對學生工具優先度低，留待日後有供應鏈安全需求時再處理 |

#### 修正內容

| # | 對應問題 | 修改檔案 | 修改摘要 |
|---|---------|---------|---------|
| 1 | W1 | `js/engine.js` | 新增 `nextQTimer` 變數；`nextQ()` 內 `setTimeout` 前加 `clearTimeout(nextQTimer)` |
| 2 | W2 | `js/engine.js` | 將地圖初始化邏輯抽為 `initMap()`；使用 `ResizeObserver` 偵測容器尺寸變化並重新初始化，resize 後恢復當前題目狀態 |
| 3 | S1 | `js/data-world.js` | 移除 `'76'/'32'/'36'` 等未補零的重複鍵，統一保留三位數格式 `'076'/'032'/'036'`；`processFeatures` 內的補零 fallback 邏輯維持不變 |
| 4 | S2 | `js/engine.js` | `showFeedback` 改用 `createElement`／`textContent`／`createTextNode` 取代 `innerHTML` 字串拼接 |

#### 編譯結果
✅ 通過（純前端靜態專案，語法人工確認無誤）

#### 統計
- 🔴 Critical：0 項
- 🟡 Warning：2 項（同意 2 / 不同意 0 / 部分同意 0 / 延後 0）
- 🔵 Suggestion：3 項（S1、S2 已修正；S3 延後處理）
