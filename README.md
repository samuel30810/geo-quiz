# 地圖練習工具

純前端靜態地理練習網站，適合學生練習台灣縣市與世界國家地理位置。地圖會隨機放大一個區域，從四個選項中選出正確名稱，作答後顯示即時回饋。

## 功能

- **台灣縣市**：22 個縣市，地圖 zoom 到目標區域
- **世界國家**：150 個國家（五大洲），使用 Natural Earth 110m 資料
- **難度選擇**（世界國家 + 隨機模式）：簡單（前 50 名）、進階（前 100 名）、困難（全 150 國），依國家重要性排名分層抽題
- **國家介紹**：答題後顯示該國家的核心特色與地緣重要性
- 手機優先設計，支援 RWD
- 鍵盤快速鍵：`1`/`2`/`3`/`4` 選題、`Space`/`Enter` 下一題、`Esc` 返回首頁

## 本地開發

不需要任何建置步驟。直接用瀏覽器開啟 `index.html`，或透過本地伺服器避免 CORS 限制（CDN 資料需要網路連線）：

```bash
npx serve .
# 或
python -m http.server 8080
```

然後開啟 `http://localhost:3000`（或對應 port）。

## 部署至 GitHub Pages

1. 將此 repo push 到 GitHub
2. 在 repo Settings → Pages → Source 選擇 **GitHub Actions**
3. Push 到 `main` 分支後，`.github/workflows/deploy.yml` 會自動部署

## 技術棧

| 項目 | 決定 |
|------|------|
| 框架 | 原生 HTML + CSS + JS（無框架、無建置步驟） |
| 地圖渲染 | SVG + D3.js v7 |
| Zoom | `d3.zoom()` 操控 `<g>` transform |
| 字體 | Google Fonts: Noto Sans TC |
| 台灣資料 | taiwan-atlas（CDN） |
| 世界資料 | Natural Earth 110m via world-atlas（CDN） |
| 部署 | GitHub Pages |

## 檔案結構

```
/
├── index.html          # 首頁：選擇台灣版 / 世界版
├── quiz.html           # 練習主頁面（共用）
├── css/style.css       # 全域樣式、RWD
├── js/
│   ├── engine.js       # 題目引擎（出題、計分、回饋）
│   ├── map.js          # 地圖渲染與 D3 zoom
│   ├── data-taiwan.js  # 台灣資料設定
│   └── data-world.js   # 世界資料設定（含白名單）
└── .github/workflows/deploy.yml
```
