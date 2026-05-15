# Review Log

## 審查範圍
規劃文件：docs/plans/20260515-quiz-modes.md
審查檔案：index.html, quiz.html, js/engine.js, css/style.css, docs/architecture.md

## 規劃 Checkbox 逐項追蹤

### 6.1 首頁改版 — index.html
- [x] Step 1 — 模式選擇：兩個模式卡片已實作，說明文字「所有題目各出一次」與「隨機 20 題，滿分 100」正確。
- [x] Step 2 — 地圖選擇：點擊模式後顯示地圖卡片，連結格式 `quiz.html?mode=practice&map=taiwan` 正確（index.html L202-203）。
- [x] 步驟切換方式：DOM 切換正確實作（showStep1/showStep2），「← 重新選擇」按鈕存在且功能正確。
- [x] 地圖卡片的題數顯示：練習模式用 `TAIWAN_MAP_CONFIG.totalCount`，隨機模式固定 20 題（index.html L197-198）。
- [x] 地圖卡片的 CTA 文字：練習「開始練習 →」、隨機「開始挑戰 →」（index.html L199-200）。
- [x] 邊界條件：地圖載入失敗 silently fail，與規劃一致。

### 6.2 題目引擎改版 — js/engine.js
- [x] 讀取 URL 參數：`mode` 參數讀取正確，非 practice/random 時預設 practice（engine.js L4-5）。
- [x] 建立題目池：練習模式 shuffle 全部，隨機模式取 `Math.min(20, features.length)`（engine.js L131-138）。
- [x] 出題邏輯：從 questionQueue 依 qIndex 遞增取出（engine.js L159-160）。
- [x] 題數顯示：topbar 顯示「第 X / Y 題」格式（engine.js L182）。
- [x] 結束判斷：`qIndex >= total` 時呼叫 showResult（engine.js L141-143）。
- [x] 結束畫面 — 練習模式：正確率圓環顯示（engine.js L291-313）。
- [x] 結束畫面 — 隨機模式：分數 = 答對 × 5，顯示大字分數 + 進度條（engine.js L314-336）。
- [x] 「再來一次」與「返回首頁」按鈕：retry 函式重置狀態（engine.js L339-350），返回首頁導向 index.html。
- [x] 「下一題」按鈕行為：最後一題改為「查看結果 →」（engine.js L247）。
- [x] 鍵盤快捷鍵：Enter 觸發 retry、Escape 觸發返回首頁（engine.js L59-61）。

### 6.3 練習頁面 — quiz.html
- [x] 結束畫面容器：`<div id="result-screen">` 已新增，初始 `display: none`（quiz.html L43）。

### 6.4 樣式 — css/style.css
- [x] 模式選擇卡片：`.mode-select-cards` 與 `.mode-select-card` 已新增，風格與 `.mode-card` 一致。
- [x] 步驟切換動畫：`.home-step--enter` 搭配 `@keyframes stepFadeIn` fade-in 動畫（style.css L176-182）。
- [x] 「重新選擇」按鈕：`.back-to-mode` 樣式已新增（style.css L288-300）。
- [x] 結束畫面：`.result-screen` 及相關子元素樣式完整（style.css L637-862）。
- [x] RWD：三段斷點（480px / 768px / 1024px）皆有處理新增元素。
- [x] CSS class 衝突檢查：新增 class 前綴無衝突。

### 6.5 不修改的檔案
- [x] `js/map.js`、`js/data-taiwan.js`、`js/data-world.js` 未被列入變更範圍，確認正確。

### 6.6 邊界條件整理
- [x] URL 無 `mode` 參數或無效值：預設 practice（engine.js L4-5）。
- [x] 題目佇列用盡：最後一題按鈕文字改為「查看結果」，不會觸發 nextQ 超出範圍。
- [x] 「再來一次」：重新 buildQueue + nextQ（engine.js L339-350）。
- [x] 地圖載入失敗：showMapError 處理（engine.js L122-129）。

### 7 Other Changes
- [x] docs/architecture.md 已更新：系統概述補充兩種模式說明，元件表格更新 index.html 職責，關鍵決策新增「模式切換方式」。

---

## 審查結果

### Critical (必須修正)

**C1 — 隨機模式結束畫面「正確率」顯示值計算錯誤**
- 位置：`js/engine.js` L334-335
- 問題：隨機模式的 breakdown 第三欄顯示「正確率」，值為 `(score * 5) + '%'`。這是用分數（答對數 x 5）當作百分比，而非真正的正確率。例如答對 10 / 20 題：正確率應為 50%，但此處顯示 `10 * 5 = 50%`；答對 18 / 20 題：正確率應為 90%，但此處顯示 `18 * 5 = 90%`。在 20 題的情況下恰好數值吻合（因為 `score / 20 * 100 = score * 5`），但如果 features 少於 20 題（防禦性 `Math.min(20, features.length)`），此計算就會出錯。例如若只有 15 題，答對 10 題：正確率應為 67%，但此處顯示 `10 * 5 = 50%`。
- 建議修正：改為 `Math.round(score / total * 100) + '%'`，或者既然規劃文件在隨機模式結束畫面只要求顯示「分數」而非「正確率」，考慮將第三欄改為「總題數」（與練習模式一致），避免語義混淆。

### Warning (建議修正)

**W1 — 規劃文件要求的題數顯示格式不一致**
- 位置：`js/engine.js` L182
- 問題：規劃文件 6.2 要求 topbar 顯示「答對 X / Y（共 Z 題）」格式，但實作為「第 X / Y 題」。這兩者語義不同：規劃版本同時顯示答對數與題數，實作版本只顯示當前題號與總題數。
- 影響：不影響功能，但與規劃有偏差。目前「第 X / Y 題」的設計其實更直覺（使用者在作答中更關心進度而非即時分數）。
- 建議：如果刻意偏離規劃（設計上的改良），建議在規劃文件中更新此項描述以保持文件與實作一致。

**W2 — 練習模式 description 文字語義模糊**
- 位置：`index.html` L193
- 問題：Step 2 練習模式的描述文字為「依模式不同，題數會跟著變。」但此時模式已經選定，且練習模式的題數就是固定的全部題庫數。這段文字更像是通用說明，放在已選定模式的 Step 2 中顯得不夠精確。
- 建議：改為更具體的描述，例如「每個題目各出一次，全部答完才算結束。」

**W3 — result-chip-glyph 樣式未有視覺差異**
- 位置：`css/style.css` L669-675
- 問題：`.result-chip-glyph--practice` 與 `.result-chip-glyph--random` 這兩個 class 在 HTML 中被使用（engine.js L299, L323），但 CSS 中只定義了基礎的 `.result-chip-glyph`（一個 16x16 的淡色方塊），未針對 `--practice` 和 `--random` modifier 定義不同的視覺樣式。同理，`.badge-glyph--practice` 和 `.badge-glyph--random`（index.html L189-191）也缺少差異化樣式。
- 影響：兩種模式的 badge/chip glyph 看起來完全一樣，無法靠視覺區分。
- 建議：為 `--practice` 和 `--random` 各加上不同的背景色或 icon。

**W4 — Step 2 的 step-num--done 使用文字「✓」而非 SVG/圖示**
- 位置：`index.html` L108
- 問題：`<span class="step-num step-num--done">✓</span>` 直接使用 Unicode 字元。在不同作業系統/瀏覽器上，此字元的渲染大小和位置可能不一致，尤其在小尺寸（18px 圓圈）內可能溢出或不置中。
- 建議：改用 SVG icon 或 CSS pseudo-element 以確保跨瀏覽器一致性。非阻擋性問題。

### Note (備註)

**N1 — shuffle 函式使用 Fisher-Yates 演算法，實作正確。**
- engine.js L194-199，標準的 in-place Fisher-Yates shuffle，無偏差問題。

**N2 — 結束畫面的圓環動畫無 transition 效果。**
- `result-ring-progress` 的 `stroke-dasharray` 是直接設定屬性值，沒有 CSS transition 或 JS 動畫。視覺上圓環會瞬間出現而非漸進填滿。進度條 `.result-bar-fill` 則有 `transition: width 0.4s ease`。如果希望一致的體驗，可以為圓環加上 CSS transition：`transition: stroke-dasharray 0.6s ease`。

**N3 — 鍵盤快捷鍵在非結束畫面時，Escape 也會導向首頁。**
- engine.js L70：作答過程中按 Escape 會直接跳回首頁，沒有確認提示。這是沿用既有行為，但在新的模式系統下（使用者可能已答了多題），意外按到 Escape 會失去所有進度。可考慮未來加入確認對話框。

**N4 — index.html 的 inline script 約 100 行。**
- 目前可接受，但如果未來首頁邏輯繼續增長，建議抽出為獨立的 `js/home.js`。

**N5 — 規劃文件中所有 checkbox 均為 unchecked `[ ]` 狀態。**
- 實作已全部完成，建議將規劃文件中的 checkbox 更新為 `[x]` 以反映完成狀態。

---

## 修正回應（Round 1）

| ID | 處置 | 說明 |
|----|------|------|
| C1 | ✅ 已修正 | `js/engine.js` L335：改為 `Math.round(score / total * 100) + '%'` |
| W1 | ⏭️ 設計決策 | topbar 格式依設計交接包 §3.1 為「第 N / Y 題」，已在規劃文件補充實作偏差記錄 |
| W2 | ⏭️ 依設計稿 | 描述文字來自設計交接包 §1.2，保留原文 |
| W3 | ✅ 已修正 | `css/style.css`：為 `.result-chip-glyph--practice/--random` 和 `.badge-glyph--practice/--random` 新增差異化樣式 |
| W4 | ⏭️ 可接受 | Unicode ✓ 在目標瀏覽器（現代 Chrome/Safari/Firefox）渲染一致，非阻擋性 |
