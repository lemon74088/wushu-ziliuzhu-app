# 第三方供應商檔案（vendor）

## lunar-javascript

- **來源**：https://github.com/6tail/lunar-javascript
- **快照 commit**：5c92e62（見 `../../references/SOURCES.md`）
- **版本**：v1.7.8
- **許可證**：MIT（`LICENSE` 原檔保留，不得刪除）
- **用途**：ENG-01 曆法適配層 — 公農曆轉換、干支（年／月／日／時柱）、生肖、節氣。
- **接入方式**：本機離線打包，瀏覽器直接 `<script>` 載入，**不連線、不呼叫在線 API、無授權費、無用量配額**。
- **版權要求**：保留 `LICENSE` 與版權聲明；若修改 `lunar.js`，請在此檔註記修改內容與日期。
- **待驗證邊界**：子時交界（23:00 換日）、閏月、節氣交接、時區；正式上線前須補測試案例。

其餘三個候選倉庫（ziwu / meridian-atlas / js-ephemeris-lite）未納入，理由見 `../../references/SOURCES.md`。
