# 世界國家隨機模式：難度分級與國家介紹

## 1. Summary（變更範圍摘要）

- 在「世界國家 + 隨機模式」中新增三個難度等級（簡單、進階、困難），根據國家重要性排名分層抽取 20 題。答題後（不論對錯）在回饋區下方顯示該國家的介紹文字。台灣縣市、練習模式、世界國家練習模式均不受影響。

## 2. Architecture Decisions（架構決策）

本次無架構決策。純前端靜態頁面的 UI 與資料層變更，無新部署方式或通訊模式。

## 2.5 Artifact Contracts（產出物契約）

本次無產出物契約。不產生/修改檔案產出物，不變更 API 簽名或 cleanup 行為。

## 3. Key Assumptions（關鍵假設）

- `docs/國家排行.txt` 中的 150 個國家與 `data-world.js` 的 `COUNTRY_NAMES` 150 個國家完全一一對應（排名 1–150）。
- 排名資料為靜態硬編碼，不需要動態更新。
- 難度選擇僅適用於「世界國家 + 隨機模式」，其他組合不受影響。
- 每題 5 分，20 題共 100 分的計分邏輯不變。

## 4. Database Changes

無。純靜態前端專案，無資料庫。

## 5. Backend Changes

無。純靜態前端專案，無後端。

## 6. Frontend Changes

### 6.1 資料層：`js/data-world.js`

- [ ] 新增 `COUNTRY_RANK` 物件：key 為國家數字 ID（與 `COUNTRY_NAMES` 相同 key），value 為排名數字（1–150）。資料來源為 `docs/國家排行.txt`，需手動建立 ID → 排名的對應。對應方式：以中文國名為媒介，從 `COUNTRY_NAMES` 找到 ID，從排行表找到排名。**實作前驗證**：先用腳本比對 `COUNTRY_NAMES` 的 150 個中文名與排行表的 150 個中文名，列出不匹配項，確保 100% 對應後再建表。

  ```js
  const COUNTRY_RANK = {
    '840': 1,   // 美國
    '156': 2,   // 中國
    '276': 3,   // 德國
    // ... 共 150 筆
  };
  ```

- [ ] 新增 `COUNTRY_DESC` 物件：key 為國家數字 ID，value 為介紹文字字串（取自排行表「核心入選原因」欄位）。

  ```js
  const COUNTRY_DESC = {
    '840': '全球第一大經濟體，美元霸權，科技與軍事核心，全球文化輸出。',
    '156': '全球第二大經濟體，世界工廠，稀土控制國，供應鏈與地緣政治核心。',
    // ... 共 150 筆
  };
  ```

- [ ] 在 `WORLD_MAP_CONFIG` 上新增 helper 方法 `getDesc(feature)`，回傳該國家的介紹文字：
  ```js
  getDesc(feature) {
    const id = String(feature.id || feature.properties._id || '');
    return COUNTRY_DESC[id] || COUNTRY_DESC[id.padStart(3, '0')] || '';
  }
  ```

- [ ] 在 `WORLD_MAP_CONFIG` 上新增 helper 方法 `getRank(feature)`，回傳該國家的排名數字：
  ```js
  getRank(feature) {
    const id = String(feature.id || feature.properties._id || '');
    return COUNTRY_RANK[id] || COUNTRY_RANK[id.padStart(3, '0')] || 999;
  }
  ```

### 6.2 首頁難度選擇 UI：`index.html`

**觸發條件**：使用者已選「隨機模式」且點擊「世界國家」卡片時，攔截原本的頁面跳轉，改為顯示難度選擇 overlay。

- [ ] 在 `<div id="step-map">` 區塊內（或獨立於 `home-wrapper` 結尾處）新增一個難度選擇 overlay `<div id="difficulty-overlay">`，預設 `display:none`。結構如下：

  ```html
  <div id="difficulty-overlay" class="difficulty-overlay" style="display:none">
    <div class="difficulty-panel">
      <button id="difficulty-close" class="difficulty-close">✕</button>
      <h2 class="difficulty-title">選擇難度</h2>
      <p class="difficulty-desc">依難度不同，題目會從不同排名區間抽取。</p>
      <div class="difficulty-options">
        <button class="difficulty-option" data-difficulty="easy">
          <span class="difficulty-option-name">簡單</span>
          <span class="difficulty-option-detail">前 50 名國家中抽 20 題</span>
        </button>
        <button class="difficulty-option" data-difficulty="medium">
          <span class="difficulty-option-name">進階</span>
          <span class="difficulty-option-detail">前 50 名抽 10 題 + 51~100 名抽 10 題</span>
        </button>
        <button class="difficulty-option" data-difficulty="hard">
          <span class="difficulty-option-name">困難</span>
          <span class="difficulty-option-detail">前 50 名抽 7 題 + 51~100 名抽 8 題 + 101~150 名抽 5 題</span>
        </button>
      </div>
    </div>
  </div>
  ```

- [ ] 修改 `index.html` 內的 `<script>` 邏輯：
  - `cardWorld` 的 `href` 設定改為由 JS 控制。當 `selectedMode === 'random'` 時，點擊世界國家卡片不跳轉，而是顯示 `#difficulty-overlay`。
  - 具體做法：對 `cardWorld` 加上 click 事件攔截（`e.preventDefault()`），判斷 `selectedMode`：
    - 若為 `'practice'`：直接跳轉 `quiz.html?map=world&mode=practice`（行為不變）
    - 若為 `'random'`：顯示 difficulty overlay
  - `cardTaiwan` 的行為完全不變（不論 practice 或 random 都直接跳轉，台灣沒有難度選擇）。
  - difficulty overlay 中的三個按鈕點擊後，跳轉至 `quiz.html?map=world&mode=random&difficulty=easy|medium|hard`。
  - 關閉按鈕 `#difficulty-close` 點擊後隱藏 overlay，回到地圖選擇頁。

### 6.3 測驗引擎：`js/engine.js`

- [ ] 在初始化區塊新增讀取 `difficulty` 參數：
  ```js
  var difficulty = params.get('difficulty') || '';
  ```

- [ ] 修改 `buildQueue()` 函式：
  - 當 `mode === 'random'` 且 `mapKind === 'world'` 且 `difficulty` 為 `'easy'`、`'medium'`、`'hard'` 時，按以下邏輯分層抽取：
    1. 將 `features` 依 `config.getRank(feature)` 分為三組：
       - `tier1`：排名 1–50
       - `tier2`：排名 51–100
       - `tier3`：排名 101–150
    2. 各組分別 shuffle 後取指定數量：
       - `easy`：tier1 取 20
       - `medium`：tier1 取 10 + tier2 取 10
       - `hard`：tier1 取 7 + tier2 取 8 + tier3 取 5
    3. **遞補機制**：若某 tier 的可用數量不足所需數量，取該 tier 全部，差額由相鄰 tier 遞補（優先從較低排名的 tier 補，若無則從較高排名的 tier 補），確保 `questionQueue.length` 始終為 20。
    4. 合併後再 shuffle 作為 `questionQueue`
  - 若 `difficulty` 參數不存在或不在三個值中（例如世界+隨機但沒帶 difficulty，或台灣），走原本的 shuffle + slice(0, 20) 邏輯（向後相容）。
  - `total` 始終為 `questionQueue.length`（即 20），計分邏輯 `score * 5` 不變。

- [ ] 修改 `showFeedback()` 函式，在回饋文字下方附加國家介紹：
  - 條件：`config.getDesc` 存在且回傳非空字串時才顯示。
  - 在現有的 `feedbackEl` 結構中，於 `fb-icon` + `fb-text` 之後，追加一個 `<div class="fb-desc">` 元素，內容為國家介紹文字。
  - 修改後的 feedback DOM 結構：
    ```
    .feedback-area
      .fb-icon  ✓ / ✕
      .fb-text  「答對了！這是『美國 (United States)』」
      .fb-desc  「全球第一大經濟體，美元霸權，科技與軍事核心，全球文化輸出。」
    ```
  - `showFeedback` 需接收 `current` feature 或讓函式能存取 `current`（目前 `current` 已是外層作用域變數，可直接使用）。

- [ ] 修改結果頁 `showResult()` 的 `resultChip` 文字：
  - 當有 `difficulty` 參數時，chip 文字改為顯示難度，例如：`挑戰結束 · 世界國家 · 進階`。
  - 難度中文對應：`{ easy: '簡單', medium: '進階', hard: '困難' }`。

### 6.4 樣式：`css/style.css`

- [ ] 新增 `.difficulty-overlay` 樣式：全螢幕半透明背景遮罩（`position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100;`），flex 置中。

- [ ] 新增 `.difficulty-panel` 樣式：白色面板，圓角，padding，max-width 400px，陰影。

- [ ] 新增 `.difficulty-close` 樣式：右上角關閉按鈕。

- [ ] 新增 `.difficulty-title` 樣式：標題文字。

- [ ] 新增 `.difficulty-desc` 樣式：說明文字，使用 `var(--ink-dim)`。

- [ ] 新增 `.difficulty-options` 樣式：垂直排列的選項容器，flex column，gap。

- [ ] 新增 `.difficulty-option` 樣式：選項按鈕，沿用現有卡片風格（白底、border、圓角、hover 效果），內含 `.difficulty-option-name`（粗體大字）和 `.difficulty-option-detail`（小字說明）。

- [ ] 新增 `.fb-desc` 樣式：
  - 回饋區國家介紹文字段落
  - `font-size: 13px; font-weight: 400; line-height: 1.5; margin-top: 6px; opacity: 0.85;`
  - 顏色繼承自 `.feedback-area.correct` 或 `.feedback-area.wrong` 的 color。

- [ ] 修改 `.feedback-area` 佈局：現有是 `display: flex; align-items: center;` 水平排列 icon + text。新增 desc 後需改為可換行的佈局。做法：將 `.feedback-area` 改為 `flex-wrap: wrap`，icon + text 在第一行，desc 在第二行佔滿寬度。或者改用以下結構：
  - `.feedback-area` 改為 `flex-direction: column; align-items: stretch;`
  - 內部第一行用一個 `.fb-main` wrapper 包住 icon + text（水平排列）
  - `.fb-desc` 作為第二行

  **選定方案**：修改 `showFeedback()` 時把 icon + text 包進一個 `.fb-main` div，feedback-area 改為 column 佈局。新增 CSS：
  ```css
  .fb-main {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  ```
  原本 `.feedback-area` 的 `display: flex; align-items: center; gap: 10px;` 改為 `display: flex; flex-direction: column; gap: 6px;`。同時移除或調整 `.feedback-area` 現有的 `min-height: 48px`，改為由內容自然撐開（避免加入 `.fb-desc` 後溢出）。

### 6.5 UI 狀態入口點列舉

| 狀態 | 觸發點 | 說明 |
|------|--------|------|
| difficulty overlay 顯示 | `index.html` 中 `cardWorld` click 事件（僅 `selectedMode === 'random'` 時） | 設定 `difficulty-overlay` 的 `display` |
| difficulty overlay 隱藏 | `#difficulty-close` click、選擇任一難度後跳轉 | 關閉按鈕隱藏，選擇後直接跳頁 |
| feedback 中 desc 顯示/隱藏 | `engine.js` 的 `showFeedback()` | 僅當 `config.getDesc` 存在且回傳非空時才 append `.fb-desc` |

### 6.6 邊界條件

- [ ] 若排名資料中某國 ID 在 features 中找不到（因地圖 TopoJSON 不包含該國輪廓）：`getRank()` 回傳 999，該國不會被選入題庫（因為不在 features 中），不影響功能。
- [ ] 若某 tier 的 features 數量不足所需抽取數：由遞補機制從相鄰 tier 補足，確保總題數始終為 20，`score * 5` 計分邏輯不受影響（見 6.3 buildQueue 遞補機制）。實際上 150 國已全部在 `COUNTRY_NAMES` 中且 TopoJSON 110m 包含所有國家，每個 tier 恰好 50 國，遞補機制僅作為防禦性保護。
- [ ] `difficulty` URL 參數值不在 `easy/medium/hard` 中（例如手動改 URL）：走原本 random 的全 shuffle 邏輯（向後相容）。
- [ ] 台灣地圖 + 隨機模式不帶 difficulty：`config.getRank` 不存在，走原本邏輯。
- [ ] `config.getDesc` 在台灣 config 中不存在：`showFeedback` 中用 `config.getDesc && config.getDesc(current)` 防禦，不顯示 desc。

## 7. Other Changes

- [ ] 更新 `docs/architecture.md` 的架構表格：新增「難度選擇 overlay」元件列，說明其職責（世界+隨機模式的難度選擇 UI）與路徑。
- [ ] 更新 `docs/architecture.md` 的關鍵決策表格：新增「國家排名抽題」決策，說明使用靜態排名資料分層抽題的選擇與原因。

## 8. Compatibility Checklist

- [x] 現有 API 的呼叫方是否受影響？→ 不受影響，無 API。
- [x] 台灣縣市功能是否受影響？→ 不受影響。`buildQueue` 的難度邏輯僅在 `mapKind === 'world' && mode === 'random' && difficulty 有效值` 時觸發。
- [x] 練習模式是否受影響？→ 不受影響。`mode === 'practice'` 不進入難度分支。
- [x] 世界國家隨機模式不帶 difficulty 參數？→ 向後相容，走原本的全 shuffle 邏輯。
- [x] 分數計算是否受影響？→ 不受影響。仍固定 20 題，每題 5 分。
- [x] 現有 CSS class 是否衝突？→ 已確認 `difficulty-*`、`fb-desc`、`fb-main` 在現有 CSS 中均不存在。

## 9. Out of Scope（本輪不含）

- 台灣縣市的難度分級（無排名資料來源）。
- 練習模式的難度分級。
- 國家介紹文字的多語系支援（目前僅中文）。
- 結果頁顯示各題答題紀錄或錯題回顧。
- 難度選擇的動畫轉場效果（使用簡單的 display toggle 即可）。
