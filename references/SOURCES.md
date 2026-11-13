# 第三方參考資源來源清單

下載日期：2026-11-13　地點：`references/zips/`（原始 ZIP，只讀保存）、`references/src/`（解壓工作副本）

> 原則（對照架構稿 V1.3 §十二、§十八）：下載、閱讀、研究、複製、再發布是不同權利。
> 下列倉庫**僅為候選參考**，未經許可證審查與規格核對前，不把代碼直接併入產品。

| # | 倉庫 | 來源 URL | 快照 commit | 許可證 | 定位 | 可做 / 不可做 |
|---|---|---|---|---|---|---|
| 1 | 6tail/lunar-javascript | https://github.com/6tail/lunar-javascript | 5c92e62 | MIT | 曆法基礎候選：公農曆、干支、節氣、生肖、納音 | 可保留 LICENSE 與版權聲明、固定版本後納入曆法適配層；需本地測試驗證 |
| 2 | acuherb/ziwu | https://github.com/acuherb/ziwu | 057f23b | **無明確許可證**（僅 index.html + README） | 針灸算法研究參考、結果對照 | **僅研究比對，不複製代碼或資料進產品**；產品規則以獨立整理的規格書實現 |
| 3 | galaxy-hzy/meridian-atlas | https://github.com/galaxy-hzy/meridian-atlas | aa96b73 | AGPL-3.0 | 經絡分類、穴位定位結構參考（3D 經絡圖譜） | AGPL 強 Copyleft：**不得複製其代碼/資料進專有產品**；僅參考資料結構，自有 JSON 須獨立整理並核對來源與準確性 |
| 4 | RedSC1/js-ephemeris-lite | https://github.com/RedSC1/js-ephemeris-lite | 559d495 | MPL-2.0 | 節氣、歷算、真太陽時進階交叉核驗候選 | MPL 文件級 Copyleft：若修改其文件須同開；引入前需核對適用範圍與算法精度，獨立實現的部分不受影響 |

## 檢查清單（下載後逐項核對，對照架構稿 §十四）

- [ ] README.md：用途、安裝、運行、功能範圍
- [ ] LICENSE：複製／修改／商用／再發布權限、需保留聲明
- [ ] package.json：版本、依賴、腳本、構建方式
- [ ] src / index.html：算法與 UI 是否耦合
- [ ] tests：測試日期與算法邊界覆蓋
- [ ] CDN 引用：是否依賴外部網絡，能否改本地
- [ ] 第三方依賴：逐項核對許可證與版本

## 版本固定記錄

- 本目錄所有資源以本表 commit 快照為準；升級時另記日期、版本、許可證變更與修改記錄。
- 原始 ZIP 不得覆蓋；工作副本的修改須與原始包分開管理。
