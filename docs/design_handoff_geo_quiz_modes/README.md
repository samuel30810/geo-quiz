# Handoff: 練習模式與隨機模式（v2）

## Overview

在既有的「地圖練習工具」上新增兩種模式 + 結束畫面 + 作答中 topbar 微調。

**設計範圍**：
1. 首頁改版（兩步驟：先選模式、再選地圖）
2. 練習模式結束畫面
3. 隨機模式結束畫面
4. 作答中的 topbar 微調（從「答對 X / Y」改為「第 N / Y 題」）
5. 最後一題的「下一題 →」變「查看結果 →」

> 本份延伸自前一份交接包（`docs/design_handoff_geo_quiz/`），所有色票、字級、卡片陰影、互動風格沿用。本份只描述新增與差異部分。

---

## About the Design Files

`design_refs/` 內的 `.html` / `.jsx` 是 **設計參考**，用 React + Babel 即時編譯做的高保真原型，僅用來展示外觀。實作時請沿用前一份交接包的技術選型（**原生 HTML + CSS + JS + D3 v7**），把這些畫面整合進現有的 `index.html` / `quiz.html`。

主要參考檔：`design_refs/Modes v2.html`，內含四個 section（首頁兩步驟、結束畫面、作答 topbar、RWD）。

---

## Fidelity

**High-fidelity**：色彩 / 字級 / 間距 / 互動皆給定確切值。

---

## Design Tokens（沿用 v1，提示用）

```css
--bg: #fbf8f1;       --card: #ffffff;
--ink: #1f2b25;      --ink-dim: #6a7770;
--border: rgba(31, 43, 37, 0.10);
--primary: #1D9E75;  --primary-dark: #147a59;  --primary-soft: #e1f5ee;
--ocean: #f1ead8;
--good-soft-bg: #eaf6e3;  --bad: #d44141;
--radius-md: 14px;   --radius-xl: 18px;
--shadow-card: 0 1px 0 rgba(31, 43, 37, 0.04);
--shadow-button: 0 4px 12px rgba(29, 158, 117, 0.28);
```

字體：`Noto Sans TC`, weights 400/500/600/700/800。

---

## 1. 首頁改版（index.html）

從「直接顯示地圖卡」改為「兩步驟」。**不換頁**，是同一頁面的狀態切換：建議用一個 `step` state（值 `'mode' | 'map'`）控制顯示，加 200ms 的 `opacity` + `translateY(8px)` 過渡。

### 1.1 Step 1 · 選擇模式

**保留**：頂部 pill chip「● 地圖練習工具」、H1「看著地圖 / 認識每一個地方」（30px / 800）

**改寫**：副文「選擇一種練習方式開始。」（14px / `--ink-dim` / lh 1.55）

**新增 · 步驟指示器**（H1 副文下方，margin-top 6, margin-bottom 18）：

```
[1] 選擇模式  ── 2 選擇地圖
```

- 數字圓 18×18, border-radius 50%
  - 當前步：background `--primary`, color white, font 11/700
  - 未到步：背景透明、color `--ink-dim` opacity 0.6
- 「選擇模式」/「選擇地圖」: 11 / 600 / letter-spacing 0.12em / uppercase
- 步驟間連線：14×1, background `--border`

**新增 · 模式卡片 ×2**（縱向直列，gap 14）：

每張卡片
- background `--card`, border 1.5px `--border`, border-radius 18, padding 14
- flex 橫向, gap 14, align-items center
- box-shadow `--shadow-card`

**左側 glyph 容器**：56×56, background `--primary-soft`, border-radius 14，內含 SVG 圖示（純線條，無 emoji）。

**glyph SVG**：

練習（清單／checklist 進度感）：
```svg
<svg width="31" height="31" viewBox="0 0 24 24" fill="none">
  <rect x="3"  y="5"    width="6"  height="3" rx="1.5" fill="#1D9E75" />
  <rect x="11" y="5.5"  width="10" height="2" rx="1"   fill="#1D9E75" opacity="0.35" />
  <rect x="3"  y="11"   width="6"  height="3" rx="1.5" fill="#1D9E75" />
  <rect x="11" y="11.5" width="10" height="2" rx="1"   fill="#1D9E75" opacity="0.35" />
  <rect x="3"  y="17"   width="6"  height="3" rx="1.5" fill="#1D9E75" opacity="0.4" />
  <rect x="11" y="17.5" width="10" height="2" rx="1"   fill="#1D9E75" opacity="0.2" />
</svg>
```

隨機（shuffle 兩條交叉箭頭）：
```svg
<svg width="34" height="34" viewBox="0 0 24 24" fill="none">
  <path d="M3 7 L9 7 C12 7 13 10 14 13 C15 16 16 17 19 17"
        stroke="#1D9E75" stroke-width="2" stroke-linecap="round" fill="none" />
  <path d="M3 17 L9 17 C12 17 13 14 14 11 C15 8 16 7 19 7"
        stroke="#1D9E75" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.55" />
  <path d="M17 5 L21 7 L17 9"   stroke="#1D9E75" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <path d="M17 15 L21 17 L17 19" stroke="#1D9E75" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>
```

**中間文字區**（flex 1）：
- 上排 baseline 對齊, gap 8：
  - 標題「練習」/「隨機」：19 / 800
  - Tag pill：「完整題庫」/「挑戰計分」
    - fontSize 10, color `--primary-dark`, background `--primary-soft`
    - padding 2px 7px, border-radius 999, weight 600, letter-spacing 0.04em
- 副文：「所有題目各出一次」/「隨機 20 題，滿分 100」
  - 13 / 400 / `--ink-dim` / lh 1.4

**右側箭頭**：「→」18 / 700 / `--primary-dark`

**最底下「怎麼選？」說明區**（marginTop 22）：
- background `rgba(31, 43, 37, 0.025)`, border-radius 12, padding 10×14
- 12 / `--ink-dim` / lh 1.55 / text-align left
- 第一行「怎麼選？」標題 (weight 700, color `--ink`)
- 內容用 `<strong style="color: primary-dark">` 強調「練習」「隨機」

### 1.2 Step 2 · 選擇地圖

**頂部列**（取代 status header）：
- height 44, padding 0 14, flex space-between
- 左：「← 重新選擇」13 / `--ink-dim`，可點，回 Step 1
- 右：迷你模式徽章 — flex gap 6, 12 / `--ink-dim`，含 20×20 glyph + 「練習模式 / 隨機模式」

**標題區**：
- H1「選擇要練習的地圖」: 26 / 800 / letter-spacing -0.02em
- 副文：13 / `--ink-dim`
  - 練習：「依模式不同，題數會跟著變。」
  - 隨機：「每個地圖隨機抽 20 題，每題 5 分。」

**步驟指示器**：同 Step 1，第 1 圈改為 ✓（background `--primary-soft` / color `--primary-dark`），第 2 圈為當前。

**地圖卡 ×2**：完全沿用 v1 設計（96×96 地圖預覽 + 標題 + 題數 + 副文 + CTA），但兩個微調：

| | 練習模式 | 隨機模式 |
|---|---|---|
| 台灣題數 | 27 題 | 20 題 |
| 世界題數 | 50 題 | 20 題 |
| CTA 文字 | `開始練習 →` | `開始挑戰 →` |
| 題數樣式 | 升級為 pill：`{N} 題` 11/700/`--primary-dark`/background `--primary-soft`/padding 2×8/radius 999 | 同左 |

---

## 2. 結束畫面（在 quiz.html 內）

做完所有題目時：**地圖區與選項區整塊隱藏**，顯示結束畫面。

### 2.1 練習模式結束

**結束 chip**（頂部置中，marginBottom 24）:
- flex inline gap 6, padding 3×10, border-radius 999
- background `--primary-soft`, color `--primary-dark`
- 11 / 600 / letter-spacing 0.08em
- 內含 16×16 ModeGlyphPractice + 「練習結束 · {地圖名}」

**H1 + 副文**（tone 隨成績）:
- H1 28 / 800 / letter-spacing -0.02em / lh 1.2
- 副文 14 / `--ink-dim` / marginTop 8 / marginBottom 28

| tone | 條件 | headline | sub |
|------|------|----------|-----|
| great | ≥ 85% | 答得超棒！ | 你對這個地圖已經非常熟悉了。 |
| good  | ≥ 60% | 不錯哦！  | 繼續練習，你會越來越熟。 |
| try   | < 60% | 再試一次看看 | 多看幾次就會記起來的。 |

**進度圓環**（200×200, 置中, marginBottom 22）:
```svg
<svg width="200" height="200" viewBox="0 0 200 200">
  <!-- 軌道 -->
  <circle cx="100" cy="100" r="86" fill="none" stroke="var(--ocean)" stroke-width="14" />
  <!-- 進度（順時針，從 12 點起算）-->
  <circle cx="100" cy="100" r="86" fill="none"
          stroke="var(--primary)" stroke-width="14"
          stroke-dasharray="{(2 * Math.PI * 86) * pct / 100} {2 * Math.PI * 86}"
          stroke-linecap="round"
          transform="rotate(-90 100 100)" />
</svg>
```

圓環內容（absolute 居中，flex column）：
- 大百分比：`{pct}` 56 / 900 / `--ink` / letter-spacing -0.04em / lh 1
- 「%」尾：24 / 700 / `--ink-dim` / marginLeft 2
- 下方明細：14 / 600 / `--ink-dim`，數字部分 `{correct}`（color `--primary-dark` / 800）/ {total} 題

**細項列**（border 卡片 + 三欄，padding 12×14, flex space-around）：
- 區塊間用 1×auto 直線分隔（background `--border`）
- 每欄 text-align center：
  - label：11 / 600 / `--ink-dim` / letter-spacing 0.12em / uppercase
  - 數字 22 / 800
    - 答對：color `--primary-dark`
    - 答錯：color `#d44141`
    - 總題數：color `--ink`

**底部 CTA**（marginTop auto，貼底，flex column gap 10）:
- 「再來一次」：background `--primary` / color white / border-radius 14 / padding 14 / 16/700 / box-shadow `--shadow-button`
- 「返回首頁」：background transparent / color `--ink-dim` / padding 12 / 14/600

### 2.2 隨機模式結束

差異：

- chip：「⊙ 挑戰結束 · {地圖名}」用 `ModeGlyphRandom`
- tone 文案：
  | tone | 條件 | headline | sub |
  |------|------|----------|-----|
  | great | ≥ 85 | 太強了！ | 幾乎全對，挑戰大成功。 |
  | good  | ≥ 60 | 表現不錯！| 再來幾次能拿更高分。 |
  | try   | < 60 | 再挑戰一次 | 多練習，分數會慢慢爬上來。 |

**取代圓環為大字分數**：
- 「YOUR SCORE」標籤：12 / 600 / `--ink-dim` / letter-spacing 0.18em / uppercase / marginBottom 4
- 大數字：`{score}` 110 / 900 / `--primary` / letter-spacing -0.05em
- 「分」字尾：30 / 800 / `--ink-dim` / letter-spacing -0.02em
- 副文：「滿分 100 · 共 20 題」13 / `--ink-dim` / marginTop 6

**進度條**（marginBottom 18, padding 0 4）：
- 條本身 height 10, background `--ocean`, border-radius 999, overflow hidden
- 內條 width `{score}%`, background `--primary`, radius 999
- 條下方刻度（marginTop 4, flex space-between）：「0」「50」「100」: 11 / `--ink-dim`

**細項列**：三欄「答對 / 答錯 / 正確率」
- 正確率 = `{correct * 5}%`（其中 correct = score / 5）

**底部 CTA**：同練習模式。

---

## 3. 作答中的微調（quiz.html）

### 3.1 Topbar 計分區改寫

**改前**：`← 返回    答對 2 / 22`
**改後**：`← 返回    第 5 / 27 題`

右側容器：display flex, align-items baseline, gap 3, fontSize 13, color `--ink-dim`：
- 「第」：13 / 400 / `--ink-dim`
- 「5」（當前題數）：15 / 700 / `--primary-dark`
- 「/ 27 題」：13 / 400 / `--ink-dim`

當前題號 = 已作答題數 + 1（idle 時）/ = 已作答題數（看回饋時）。

### 3.2 題目副標可顯示「最後一題」

QUESTION 標籤在最後一題加註：`QUESTION 20 · 最後一題`（11/600/letter-spacing 0.16em/`--ink-dim`/uppercase）

### 3.3 「下一題 →」按鈕變「查看結果 →」

判斷條件：`qNum === total`。樣式不變，只改文字。

---

## 4. RWD 規格

| 斷點 | max-width | Step 1 模式卡 | Step 2 / 結束畫面 |
|------|-----------|----------------|-------------------|
| < 480px (手機) | 100% | 單欄直列（橫向卡片） | 單欄直列 |
| ≥ 480px | 480 | 單欄直列 | 單欄直列 |
| ≥ 768px (平板) | 640 | **左右兩欄（直立卡片）** | 維持單欄、字級稍放大 |
| ≥ 1024px (桌面) | 720 | **左右兩欄（直立卡片）** | 維持單欄、字級稍放大 |

**Step 1 平板/桌面版**（≥ 768px）卡片差異：
- 卡片變直立：glyph 在上、文字在下
- glyph 容器 64×64（手機 56×56）
- padding 22（手機 14）, border-radius 22（手機 18）
- 標題 24 / 800（手機 19 / 800）
- 副文升級為主副 + 解釋兩行：
  - 副文：15 / 600 / `--ink` / marginBottom 6
  - 解釋（新增）：13 / `--ink-dim` / lh 1.55
    - 練習：「依地圖題庫順序，每個地方都會出現一次。」
    - 隨機：「從題庫中隨機抽 20 題，每題 5 分，看你能拿多少。」
- CTA 文字：「選擇此模式 →」（手機是右側單獨箭頭）

**頂部 nav 列**（≥ 768px，取代手機的 status bar）：
- height 56, padding 0 32, border-bottom 1px `--border`, background `--card`
- 左：logo（綠點 7×7 + 「地圖練習工具」14/700/`--ink`）

---

## 5. State Management

新增 state：

```js
state = {
  // 既有
  kind: 'taiwan' | 'world',
  features: Feature[],
  current: Feature | null,
  choices: string[],
  answered: boolean,
  score: number,
  total: number,

  // 新增 v2
  mode: 'practice' | 'random' | null,   // null 時顯示 Step 1
  homeStep: 'mode' | 'map',              // 首頁的兩階段
  questionQueue: Feature[],              // 練習：白名單全部 shuffle；隨機：隨機抽 20
  qIndex: number,                        // 目前是第幾題（0-indexed）
  finished: boolean,                     // 顯示結束畫面
}
```

**出題邏輯差異**：

- **練習模式**：
  ```
  start → questionQueue = shuffle([...features])
  nextQ → if (qIndex >= queue.length) → finished = true
          else → current = queue[qIndex++]
  ```
- **隨機模式**：
  ```
  start → questionQueue = shuffle([...features]).slice(0, 20)
  nextQ → if (qIndex >= 20) → finished = true
          else → current = queue[qIndex++]
  ```

不重複出題透過上述 queue 保證。

**結算**：
- 練習：正確率 = `score / total`（total = features.length）
- 隨機：分數 = `score * 5`（每題 5 分，總分 100）

---

## 6. Page Flow

```
index.html
  step1 (mode) ──┐
                 │ 點「練習」/「隨機」
                 ▼
  step2 (map) ──┐  ← 點「重新選擇」回 step1
                 │ 點地圖卡 → 跳轉 quiz.html?map=taiwan&mode=practice
                 ▼
quiz.html
  輪詢出題 ─────┐
                 │ 答完 last → finished = true
                 ▼
  結束畫面 ─────┐
                 │ 點「再來一次」 → reset state, qIndex=0, 重洗 queue
                 │ 點「返回首頁」 → 跳回 index.html
```

> 建議用 query string（`?map=taiwan&mode=practice`）保存進入條件，refresh 後可正確處理；其他 runtime state（分數、進度）依 PRD 不持久化。

---

## 7. Files

```
design_handoff_geo_quiz_modes/
├── README.md                       # 本檔
├── original_planning.md            # 本次需求文件
└── design_refs/
    ├── Modes v2.html               # 主要：4 個 section（首頁兩步驟 / 結束 / 作答微調 / RWD）
    ├── Mobile A.html               # v1 既有手機版（base）
    ├── v1.jsx                      # v1 桌機版色票來源
    ├── v1-mobile.jsx               # v1 既有手機版元件
    ├── v1-mobile-v2.jsx            # 本次新元件
    ├── shared.jsx                  # 共用工具
    ├── design-canvas.jsx           # 展示用畫布殼（不需實作）
    └── ios-frame.jsx               # 展示用手機殼（不需實作）
```

---

## 8. Implementation Checklist

- [ ] 在 `index.html` 加 `step` state + 兩個 view（mode card 列、map card 列）
- [ ] 切 step 時加 200ms fade/slide transition
- [ ] 練習 glyph + 隨機 glyph（SVG，貼上面提供的程式碼）
- [ ] tag pill「完整題庫 / 挑戰計分」與「{N} 題」pill 樣式
- [ ] 步驟指示器（兩個圓 + 連線）
- [ ] Step 2 頂部「← 重新選擇」回 step 1
- [ ] 在 `quiz.html` 加 `mode` 讀取（query string）
- [ ] 練習模式：`queue = shuffle(features)`
- [ ] 隨機模式：`queue = shuffle(features).slice(0, 20)`
- [ ] Topbar 計分區改為「第 N / Y 題」
- [ ] 最後一題按鈕改「查看結果 →」
- [ ] 結束畫面 component（兩種模式共用 layout、變大數字／圓環）
- [ ] 練習結束的進度圓環（SVG `circle` + `stroke-dasharray`）
- [ ] 隨機結束的大字分數 + 進度條
- [ ] 細項三欄列（答對 / 答錯 / 總題數 or 正確率）
- [ ] CTA：「再來一次」(reset + 重洗 queue) / 「返回首頁」
- [ ] RWD: ≥ 768 切左右兩欄 Step 1
- [ ] tone 文案隨 % / score 切換（great / good / try）

---

## 9. Open Questions

1. **練習模式中途離開要不要保留進度？** 建議照 PRD 不持久化（重整歸零）。
2. **隨機模式的 20 題是否同一輪不重複？** 建議是（一次 shuffle 後依序出，保證 20 題都不同）。
3. **結束畫面要不要顯示哪些題答錯了的回顧？** 目前未設計，需要的話再開新一輪。
4. **「再來一次」是否回到同一個地圖、同模式？** 建議是；若想換地圖就用「返回首頁」。
