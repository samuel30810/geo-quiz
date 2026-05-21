# Bugfix Log

## 2026-05-21 — 世界地圖練習模式實際出題數與選擇畫面不一致（150 題修復）

**觸發情境**：選擇畫面顯示 150 題，進入練習後實際只出 130 題。
**根因**：兩個獨立問題疊加：
1. Natural Earth 110m 的 feature id 是帶前導零的字串（`"004"`），但 `COUNTRY_NAMES` 等字典的 key 為短字串（`"4"`）。`processFeatures` 的 filter 用 `padStart(3,'0')` 做 fallback，對已滿 3 位的 `"004"` 是 no-op，導致阿富汗、比利時、奧地利等 14 個國家被過濾掉。
2. 新加坡、巴林、馬爾地夫、馬爾他、模里西斯、巴貝多 6 個小島國在 110m 資料集中根本沒有 geometry，無論 ID 如何都無法取得。
3. `totalCount` 硬寫為 150，與 `processFeatures` 實際回傳數（130）不符，造成選擇畫面顯示錯誤數字。

**修改檔案**：

- `js/data-world.js`：`processFeatures` 的 filter / key lookup 加入第三段 fallback `String(parseInt(id, 10))`，修正前導零 ID 不匹配；`getEnName`、`getDesc`、`getRank` 同步加入相同 fallback 並改為優先讀 `properties._id`；新增 `WORLD_PATCH` 常數（從 50m 資料集擷取的 6 個小島國 GeoJSON，約 4 KB），在 `processFeatures` 末尾 concat 進 features。
- `index.html`：async preview 區塊在 `processFeatures` 後以 `features.length` 動態覆寫 `totalCount`，使選擇畫面題數與實際一致。

**編譯結果**：✅ 純 JS，無編譯步驟；瀏覽器實測練習模式顯示 150/150，6 個補丁國家中英文名稱與排名均正確

**文件更新**：更新了 docs/architecture.md（世界資料設定元件補充 WORLD_PATCH 與 ID 修正說明；關鍵決策新增「TopoJSON ID 前導零修正」、「110m 小島國 GeoJSON 補丁」、「首頁題數動態更新」三條；更新「小國渲染風險保留」條目）

## 2026-05-16 — 阿根廷、巴西、澳洲英文名稱在作答時不顯示

**觸發情境**：世界地圖練習中，阿根廷作為正確答案時，選項按鈕只顯示中文「阿根廷」，英文副行消失。
**根因**：`COUNTRY_EN_NAMES` 中巴西、阿根廷、澳洲的 key 使用無前導零格式（`'76'`、`'32'`、`'36'`），而 `COUNTRY_NAMES` 對應 key 為有前導零的 `'076'`、`'032'`、`'036'`。`getEnName()` 的 lookup 先以 `feature.properties._id`（從 TopoJSON 的字串 id `"032"` 衍生）查找，`COUNTRY_EN_NAMES["032"]` 不存在，fallback 的 `padStart(3,'0')` 對已滿 3 字元的字串是 no-op，因此回傳空字串，英文行被跳過不渲染。
**修改檔案**：

- `js/data-world.js`：`COUNTRY_EN_NAMES` 中 `'76'` → `'076'`、`'32'` → `'032'`、`'36'` → `'036'`，對齊 `COUNTRY_NAMES` 的前導零格式。

**編譯結果**：✅ 純 JS，無編譯步驟，語法確認無誤

## 2026-05-15 — 世界地圖小國渲染風險（已知、知情保留）

**狀況**：world-atlas 110m 精度下，部分新增國家面積過小可能導致地圖高亮區域不可見。
**受影響國家**：新加坡 (702) 高風險、巴林 (048) 高風險、牙買加 (388) 中等風險、賽普勒斯 (196) 中等風險。
**處理**：使用者知情後選擇保留，維持出題邏輯正常運作，僅地圖視覺可能無高亮。
**後續**：若教學反映混亂，可考慮從白名單移除或替換至 50m 精度資料（需評估檔案大小影響）。

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

## 2026-05-15 — 台灣地圖新增 5 座離島為獨立出題 feature

**觸發情境**：使用者希望台灣地圖增加蘭嶼、綠島、小琉球、龜山島、基隆嶼作為獨立的練習題目。

**根因**：原始 `taiwan-atlas` 的 `counties-10t.json` 以縣市為單位，離島 polygon 包含在母縣市的 MultiPolygon 內，無法獨立出題。

**修改檔案**：

- `js/data-taiwan.js`：新增 `_islands` 設定陣列（每座離島定義 name、id、parentName、lonRange、latRange）；改寫 `processFeatures` 在載入 TopoJSON 後，遍歷母縣市的 MultiPolygon，依 polygon centroid 座標匹配離島 bounding box，拆出為獨立 feature（同一離島多個 polygon 合併為 MultiPolygon）；母縣市幾何移除已拆出的 polygon。`totalCount` 從 22 調整為 27，`maxScale` 從 4 調整為 8，`questionText` 改為「這是哪個縣市／離島？」。

**編譯結果**：✅ 純 JS，無編譯步驟，瀏覽器實測 5 座離島均正常渲染與出題

**文件更新**：更新了 docs/architecture.md（系統概述改為 27 個 feature、台灣資料設定元件描述加入離島拆分邏輯、關鍵決策新增離島拆分方式）

## 2026-05-15 — 世界地圖群島國家形狀錯誤（僅顯示單一島嶼）

**觸發情境**：使用者反映印尼在世界地圖上的形狀有問題，只顯示一座島嶼（Sulawesi），缺少 Sumatra、Java、Kalimantan、Papua 等主要島嶼。

**根因**：`processFeatures` 中的 MultiPolygon → Polygon 裁切邏輯對所有國家一律生效，只保留座標點數最多的單一 polygon。此邏輯原意是處理法國、美國等有海外領土的國家，但群島國家（印尼、菲律賓、日本、馬來西亞、紐西蘭）的多個 polygon 構成其本體形狀，不應被裁切。

**修改檔案**：

- `js/data-world.js`：新增 `keepMulti` 白名單（印尼 360、菲律賓 608、日本 392、馬來西亞 458、紐西蘭 554），白名單內的國家跳過 MultiPolygon → Polygon 裁切，保留完整群島形狀。

**編譯結果**：✅ 純 JS，無編譯步驟，瀏覽器實測印尼（13 polygons）、日本（3）、菲律賓（7）、馬來西亞（2）、紐西蘭（2）均正常顯示完整形狀

**文件更新**：更新了 docs/architecture.md（世界資料設定元件描述加入群島國家白名單說明、關鍵決策新增群島國家 MultiPolygon 保留策略）
