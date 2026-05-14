# Bugfix Log

## 2026-05-14 — 世界地圖中亞空白與歐洲國家海外領土 zoom 異常

**觸發情境**：世界地圖中亞地區呈現空白破洞；法國、挪威、荷蘭等國 zoom 時鏡頭拉到可同時看見歐洲與南美洲的極遠距離，本土形狀極小。

**根因**：
1. `COUNTRY_NAMES` 白名單無任何中亞國家，該區域所有 feature 被 `processFeatures` 過濾，導致地圖上中亞一片空白。
2. Natural Earth 110m 將部分歐洲國家的海外領土（法屬圭亞那、挪威屬地等）合併進同一個 `MultiPolygon` feature，`_computeTransform` 的 `bounds()` 將海外領土也納入計算，zoom 目標區域因此被大幅放大。

**修改檔案**：

- `js/data-world.js`：新增「中亞」分區，加入哈薩克（398）、烏茲別克（860）；在 `processFeatures` 的 `.map()` 內加入 MultiPolygon 裁切邏輯，以座標點數為依據保留最大多邊形（本土），丟棄較小的海外領土片段。

**編譯結果**：✅ 純 JS，無編譯步驟，語法人工確認無誤

## 2026-05-14 — 世界地圖只顯示測驗國家，其餘地區空白

**觸發情境**：世界地圖只渲染約 50 個白名單國家，其他洲際區域（北美、東南亞、歐洲非測驗國等）完全空白，地圖輪廓殘缺。

**根因**：`map.js` 只將 `processFeatures` 回傳的測驗 features 渲染為 SVG path，未渲染 Natural Earth 的完整世界輪廓。

**修改檔案**：

- `js/data-world.js`：在 `processFeatures` 內加入 `this.backgroundFeatures = fc.features`，在過濾前把完整 features 存到 config。
- `js/map.js`：`init` 改用 `config.backgroundFeatures`（若存在）做 `fitExtent` 以涵蓋全球；先渲染 `.world-bg` 底層（全部國家、`pointer-events: none`），再疊上測驗用的 `.county-path`；zoom handler 同步縮放兩層 stroke-width。

**編譯結果**：✅ 純 JS，無編譯步驟，語法人工確認無誤
