# 雙語顯示 + 世界地圖國家擴充

## 1. Summary（變更範圍摘要）

為支援雙語教學，在題目提示下方加英文副標、選項按鈕改為中英雙行、Feedback 地名顯示「中文 (英文)」格式；同時將世界地圖考題從約 50 國擴充至約 100 國，並同步補齊所有國家英文名。本次不引入新依賴，純前端靜態修改。

---

## 2. Architecture Decisions（架構決策）

本次無新架構決策。沿用現有 MAP_CONFIG 介面（新增 `questionTextEn` 欄位與 `getEnName()` 方法），不改變元件邊界。

---

## 2.5 Artifact Contracts（產出物契約）

本次無產出物契約。純程式碼修改，無檔案輸出。

---

## 3. Key Assumptions（關鍵假設）

- world-atlas 110m TopoJSON 資料（CDN）的 `f.id` 為數字，`String(f.id)` 對大多數國家為非補零格式（如 `'76'` 而非 `'076'`）；現有 `processFeatures` 已有補零 fallback，`COUNTRY_EN_NAMES` 的 key 採用相同雙軌查找邏輯（先查原始 id，再查 padStart(3,'0')）。
- `getEnName(feature)` 若查無英文名（理論上不應發生，因為白名單與 EN 名單同步維護），回傳空字串，按鈕僅顯示單行中文，不崩潰。
- ⚠️ 已知渲染風險（使用者知情確認）：
  - 新加坡 (702)、巴林 (048)：面積極小，110m 精度下極可能看不見或不存在於資料中，地圖可能顯示空白 highlight。
  - 牙買加 (388)、賽普勒斯 (196)：中等風險，實際渲染結果需部署後目視確認。
  - 使用者已確認知情並選擇保留，此決策記錄於 `docs/architecture.md`。

---

## 4. Database Changes

不適用（純前端靜態網站）。

---

## 5. Backend Changes

不適用。

---

## 6. Frontend Changes

### 6.1 `quiz.html`

- [ ] 在 `.question-area` 的 `#question-text` 下方加一行：
  ```html
  <p id="question-text-en" class="question-text-en"></p>
  ```
  位置：`quiz.html` 第 25 行之後（`<h1 id="question-text" ...>` 後）。

### 6.2 `css/style.css`

- [ ] 在 `.question-text { ... }` 區塊（第 491 行）之後新增 `.question-text-en`：
  ```css
  .question-text-en {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-dim);
    margin-top: 2px;
    letter-spacing: 0.01em;
  }
  ```
  確認 class 名稱 `question-text-en` 未在現有 CSS 中出現（已掃描確認無衝突）。

- [ ] 修改 `.choice-btn`（第 556 行）：
  - 加入 `display: flex; flex-direction: column; align-items: center; justify-content: center;`
  - `padding` 從 `14px 8px` 調整為 `10px 8px`（內容增加，縮減 padding 避免按鈕過高）
  - `min-height` 從 `56px` 調整為 `68px`
  - 移除 `font-size: 16px`（改由子元素控制）

- [ ] 在 `.choice-btn` 區塊之後新增子元素樣式：
  ```css
  .choice-cn {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .choice-en {
    font-size: 11px;
    font-weight: 400;
    color: var(--ink-dim);
    margin-top: 2px;
    letter-spacing: 0.01em;
  }
  ```

- [ ] 更新 `@media (min-width: 480px)` 的 `.choice-btn`（第 913 行）：
  - `min-height: 60px` → `min-height: 76px`

- [ ] RWD：沿用既有 RWD 模式（480px / 768px / 1024px 三個斷點），不新增斷點。

### 6.3 `js/data-taiwan.js`

- [ ] 在檔案頂部（`const TAIWAN_MAP_CONFIG = {` 之前）新增 `TAIWAN_EN_NAMES` 對照表：
  ```js
  const TAIWAN_EN_NAMES = {
    '台北市': 'Taipei City',
    '新北市': 'New Taipei City',
    '桃園市': 'Taoyuan City',
    '台中市': 'Taichung City',
    '台南市': 'Tainan City',
    '高雄市': 'Kaohsiung City',
    '基隆市': 'Keelung City',
    '新竹市': 'Hsinchu City',
    '嘉義市': 'Chiayi City',
    '新竹縣': 'Hsinchu County',
    '苗栗縣': 'Miaoli County',
    '彰化縣': 'Changhua County',
    '南投縣': 'Nantou County',
    '雲林縣': 'Yunlin County',
    '嘉義縣': 'Chiayi County',
    '屏東縣': 'Pingtung County',
    '宜蘭縣': 'Yilan County',
    '花蓮縣': 'Hualien County',
    '台東縣': 'Taitung County',
    '澎湖縣': 'Penghu County',
    '金門縣': 'Kinmen County',
    '連江縣': 'Lienchiang County',
    '蘭嶼':   'Orchid Island',
    '綠島':   'Green Island',
    '小琉球': 'Little Liuqiu',
    '龜山島': 'Guishan Island',
    '基隆嶼': 'Keelung Islet',
  };
  ```

- [ ] 在 `TAIWAN_MAP_CONFIG` 物件內新增：
  - `questionTextEn: 'Which county / city is this?',`（放在 `questionText` 旁）
  - `getEnName(feature) { return TAIWAN_EN_NAMES[this.getName(feature)] || ''; },`（放在 `getName` / `getId` 旁）

### 6.4 `js/data-world.js`

- [ ] 更新現有 `COUNTRY_NAMES` 中兩筆資料：
  - `'180': '剛果民主共和國'` → `'180': '民主剛果'`（中文名）
  - `'792': '土耳其'` 保持不變（中文名不改，英文名在 EN 表處理）

- [ ] 在 `COUNTRY_NAMES` 之後新增 `COUNTRY_EN_NAMES`（key 格式與 `COUNTRY_NAMES` 一致，採雙軌：先查原始 id 字串，再查 padStart(3,'0')）：

  完整 ~100 筆名單如下（含現有 + 新增，ISO 數字碼為 key）：
  ```js
  const COUNTRY_EN_NAMES = {
    // 亞洲（現有）
    '156': 'China', '392': 'Japan', '410': 'South Korea', '356': 'India',
    '764': 'Thailand', '704': 'Vietnam', '360': 'Indonesia', '608': 'Philippines',
    '458': 'Malaysia', '682': 'Saudi Arabia', '792': 'Türkiye', '364': 'Iran',
    '376': 'Israel', '398': 'Kazakhstan', '860': 'Uzbekistan',
    // 亞洲（新增）
    '784': 'United Arab Emirates', '702': 'Singapore', '50': 'Bangladesh',
    '586': 'Pakistan', '368': 'Iraq', '634': 'Qatar', '414': 'Kuwait',
    '512': 'Oman', '144': 'Sri Lanka', '31': 'Azerbaijan', '104': 'Myanmar',
    '48': 'Bahrain', '400': 'Jordan', '422': 'Lebanon', '524': 'Nepal',
    '116': 'Cambodia',
    // 歐洲（現有）
    '826': 'United Kingdom', '250': 'France', '276': 'Germany', '380': 'Italy',
    '724': 'Spain', '620': 'Portugal', '528': 'Netherlands', '616': 'Poland',
    '804': 'Ukraine', '752': 'Sweden', '578': 'Norway', '756': 'Switzerland',
    '300': 'Greece', '643': 'Russia',
    // 歐洲（新增）
    '56': 'Belgium', '372': 'Ireland', '40': 'Austria', '208': 'Denmark',
    '642': 'Romania', '203': 'Czechia', '246': 'Finland', '348': 'Hungary',
    '703': 'Slovakia', '100': 'Bulgaria', '191': 'Croatia', '688': 'Serbia',
    '440': 'Lithuania', '705': 'Slovenia', '112': 'Belarus', '428': 'Latvia',
    '233': 'Estonia', '352': 'Iceland', '196': 'Cyprus',
    // 非洲（現有）
    '818': 'Egypt', '566': 'Nigeria', '710': 'South Africa', '231': 'Ethiopia',
    '404': 'Kenya', '834': 'Tanzania', '504': 'Morocco', '180': 'Democratic Republic of the Congo',
    // 非洲（新增）
    '12': 'Algeria', '24': 'Angola', '288': 'Ghana', '384': "Côte d'Ivoire",
    '800': 'Uganda', '788': 'Tunisia',
    // 美洲（現有）
    '840': 'United States', '124': 'Canada', '484': 'Mexico', '76': 'Brazil',
    '32': 'Argentina', '152': 'Chile', '170': 'Colombia', '604': 'Peru',
    '862': 'Venezuela',
    // 美洲（新增）
    '218': 'Ecuador', '214': 'Dominican Republic', '320': 'Guatemala',
    '188': 'Costa Rica', '591': 'Panama', '858': 'Uruguay', '222': 'El Salvador',
    '68': 'Bolivia', '600': 'Paraguay', '340': 'Honduras', '388': 'Jamaica',
    // 大洋洲（現有）
    '36': 'Australia', '554': 'New Zealand',
    // 大洋洲（新增）
    '598': 'Papua New Guinea',
  };
  ```
  **注意**：key 使用非補零格式（與 `COUNTRY_NAMES` 的現有 key 一致，如 `'76'` 而非 `'076'`）。`getEnName` 實作需用相同雙軌查找邏輯。

- [ ] 在 `COUNTRY_NAMES` 中新增所有新增國家的中文名稱（key 格式與現有一致）：
  ```
  亞洲新增 16 國：
  '784': '阿拉伯聯合大公國', '702': '新加坡', '50': '孟加拉', '586': '巴基斯坦',
  '368': '伊拉克', '634': '卡達', '414': '科威特', '512': '阿曼',
  '144': '斯里蘭卡', '31': '亞塞拜然', '104': '緬甸', '48': '巴林',
  '400': '約旦', '422': '黎巴嫩', '524': '尼泊爾', '116': '柬埔寨',

  歐洲新增 19 國：
  '56': '比利時', '372': '愛爾蘭', '40': '奧地利', '208': '丹麥',
  '642': '羅馬尼亞', '203': '捷克', '246': '芬蘭', '348': '匈牙利',
  '703': '斯洛伐克', '100': '保加利亞', '191': '克羅埃西亞', '688': '塞爾維亞',
  '440': '立陶宛', '705': '斯洛維尼亞', '112': '白俄羅斯', '428': '拉脫維亞',
  '233': '愛沙尼亞', '352': '冰島', '196': '賽普勒斯',

  美洲新增 11 國：
  '218': '厄瓜多', '214': '多明尼加', '320': '瓜地馬拉', '188': '哥斯大黎加',
  '591': '巴拿馬', '858': '烏拉圭', '222': '薩爾瓦多', '68': '玻利維亞',
  '600': '巴拉圭', '340': '宏都拉斯', '388': '牙買加',

  非洲新增 6 國：
  '12': '阿爾及利亞', '24': '安哥拉', '288': '迦納', '384': '象牙海岸',
  '800': '烏干達', '788': '突尼西亞',

  大洋洲新增 1 國：
  '598': '巴布亞紐幾內亞',
  ```

- [ ] 更新 `processFeatures` 中的 `keepMulti` Set，加入 `'598'`（巴布亞紐幾內亞）：
  ```js
  const keepMulti = new Set(['360', '608', '392', '458', '554', '598']);
  ```

- [ ] 在 `WORLD_MAP_CONFIG` 物件內新增：
  - `questionTextEn: 'Which country is this?',`
  - `getEnName(feature)` 方法：
    ```js
    getEnName(feature) {
      const id = String(feature.id || feature.properties._id || '');
      return COUNTRY_EN_NAMES[id] || COUNTRY_EN_NAMES[id.padStart(3, '0')] || '';
    },
    ```

### 6.5 `js/engine.js`

- [ ] **初始化**（`config.questionText` 設定處附近）：設定英文副標，加 `|| ''` 防禦未來 config 漏加 `questionTextEn` 時顯示 `"undefined"`
  ```js
  document.getElementById('question-text').textContent = config.questionText;
  document.getElementById('question-text-en').textContent = config.questionTextEn || '';
  ```

- [ ] **`buildChoices(target)` 回傳型別變更**：從 `string[]` 改為 `{cn, en}[]`
  ```js
  function buildChoices(target) {
    var targetCn = config.getName(target);
    var targetEn = config.getEnName(target);
    var others = features
      .filter(function(f) { return config.getName(f) !== targetCn; })
      .map(function(f) { return { cn: config.getName(f), en: config.getEnName(f) }; });
    shuffle(others);
    var arr = [{ cn: targetCn, en: targetEn }].concat(others.slice(0, 3));
    shuffle(arr);
    return arr;
  }
  ```

- [ ] **`renderChoices(choices)`**：接收 `{cn, en}[]`，按鈕改為兩行
  ```js
  function renderChoices(choices) {
    choicesEl.innerHTML = '';
    choices.forEach(function(pair) {
      var btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.name = pair.cn;          // 作答邏輯仍用中文名比對
      var cnSpan = document.createElement('span');
      cnSpan.className = 'choice-cn';
      cnSpan.textContent = pair.cn;
      btn.appendChild(cnSpan);
      if (pair.en) {
        var enSpan = document.createElement('span');
        enSpan.className = 'choice-en';
        enSpan.textContent = pair.en;
        btn.appendChild(enSpan);
      }
      btn.addEventListener('click', function() { onAnswer(pair.cn); });
      choicesEl.appendChild(btn);
    });
  }
  ```

- [ ] **`onAnswer(chosen)`**：取得英文名，傳給 `showFeedback`
  ```js
  // 在 onAnswer 內，showFeedback 呼叫改為：
  var enName = config.getEnName(current);
  showFeedback('correct', correctName, enName);  // 答對
  showFeedback('wrong', correctName, enName);    // 答錯
  ```

- [ ] **`showFeedback(feedbackMode, cnName, enName)`**：地名改為雙語格式
  - 簽名從 `showFeedback(feedbackMode, name)` 改為 `showFeedback(feedbackMode, cnName, enName)`
  - `strong.textContent` 改為：
    ```js
    strong.textContent = enName ? cnName + ' (' + enName + ')' : cnName;
    ```
  - 前綴文字維持不變（`'答對了！這是「'` / `'正確答案是「'`）

  **邊界條件**：`enName` 為空字串時退化為純中文顯示，不崩潰。

---

## 7. Other Changes

- [ ] **`docs/architecture.md` — 關鍵決策表格** 新增以下兩列（含 '180' 中文名改動原因說明）：

  | 決策 | 選擇 | 原因 | 時間 |
  |------|------|------|------|
  | 雙語顯示方式 | 問題副標 + 選項按鈕雙行 + Feedback 中英格式 | 雙語教學需求，學生可對照學習；MAP_CONFIG 介面擴充 `questionTextEn` 與 `getEnName()` | 2026-05-15 |
  | 小國渲染風險保留 | 新加坡、巴林（高風險）、牙買加、賽普勒斯（中風險）照常加入白名單 | 使用者知情確認，優先完整性；渲染失敗僅影響單一題目視覺，不崩潰 | 2026-05-15 |
  | 民主剛果中文名稱 | `'剛果民主共和國'` → `'民主剛果'` | 對齊使用者提供之新國家名單（非版面考量），同時將英文名更新為 `'Democratic Republic of the Congo'` | 2026-05-15 |

- [ ] **`docs/bugfix-log.md`** 追加已知問題記錄：
  ```
  ## 2026-05-15 — 世界地圖小國渲染風險（已知、知情保留）

  **狀況**：world-atlas 110m 精度下，部分新增國家面積過小可能導致地圖高亮區域不可見。
  **受影響國家**：新加坡 (702) 高風險、巴林 (048) 高風險、牙買加 (388) 中等風險、賽普勒斯 (196) 中等風險。
  **處理**：使用者知情後選擇保留，維持出題邏輯正常運作，僅地圖視覺可能無高亮。
  **後續**：若教學反映混亂，可考慮從白名單移除或替換至 50m 精度資料（需評估檔案大小影響）。
  ```

---

## 8. Compatibility Checklist

- [ ] **現有 API**：`buildChoices()` 回傳型別從 `string[]` 改為 `{cn, en}[]`，只有 `renderChoices()` 消費此值，兩者同步修改，無其他呼叫方，無相容問題。
- [ ] **`showFeedback()` 簽名變更**：加第三參數 `enName`，只在 `onAnswer()` 呼叫，兩者同步修改，無其他呼叫方。
- [ ] **`COUNTRY_NAMES['180']` 中文名變更**：`'剛果民主共和國'` → `'民主剛果'`，影響：`getName()` 回傳值、`buildChoices` 比對邏輯（用 `getName()` 結果比對，同步改變，無問題）、現有題目佇列（記憶體內，重整後重置，無持久化問題）。
- [ ] **台灣地圖**：`TAIWAN_MAP_CONFIG` 新增欄位不影響現有邏輯，`engine.js` 取 `config.getEnName` 前確認存在（台灣世界地圖皆實作），安全。
- [ ] 不需要 data migration（無後端、無持久化）。

---

## 9. Out of Scope（本輪不含）

- 小國渲染失敗時的 UI 提示（如顯示「⚠️ 此國在地圖上較小」）
- 英文名稱的可編輯介面或 CMS 化
- 50m 精度地圖升級評估
- 單元測試
- 台灣地圖英文名稱的本土化變體（如蘭嶼的 Pongso no Tao）

## Implementation Notes（審查後追加）

- **M1 — keepMulti 目視驗收**：實作完成後，對新增 53 國中形狀可疑的國家（克羅埃西亞、丹麥、愛沙尼亞、賽普勒斯等）目視檢查地圖高亮是否只出現單一碎片。若是，將該國 ISO 碼補入 `keepMulti` Set，不需重跑完整 phase。
- **S2 — CSS class 衝突確認**：實作 `.choice-cn` / `.choice-en` 前，`grep -r "choice-cn\|choice-en" css/` 確認無衝突。
- **S3 — 大斷點按鈕高度**：實作時檢查 `@media (min-width: 768px)` 與 `@media (min-width: 1024px)` 是否有 `.choice-btn` 的 `min-height` 覆寫，有則同步調整至 76px 以上。
