/* ENG-01 Calendar Adapter：本地接入 lunar-javascript（MIT），輸出統一日曆欄位
   純離線轉換，不呼叫在線服務。子時換日、閏月、節氣交接邊界待補測試。 */

const Calendar = (() => {
  /* 各時辰代表鐘點（子時取 23:00） */
  const SHICHEN_HOUR = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
  /* 生肖簡轉繁 */
  const SX = { '鼠': '鼠', '牛': '牛', '虎': '虎', '兔': '兔', '龍': '龍', '蛇': '蛇',
    '马': '馬', '羊': '羊', '猴': '猴', '鸡': '雞', '狗': '狗', '猪': '豬' };

  function adapt(dateISO, shichenLabel) {
    const [y, m, d] = dateISO.split('-').map(Number);
    const label = (shichenLabel || '').split(' ')[0];
    const idx = SHICHEN.findIndex(s => s.startsWith(label));
    const hour = SHICHEN_HOUR[idx < 0 ? 0 : idx];

    const solar = Solar.fromYmdHms(y, m, d, hour, 0, 0);
    const l = solar.getLunar();
    const prev = l.getPrevJieQi();
    const dt = new Date(y, m - 1, d);

    return {
      date: dateISO,
      weekday: dt.toLocaleDateString('zh-TW', { weekday: 'long' }),
      lunar: `${l.getMonthInChinese()}月${l.getDayInChinese()}`,
      yearGZ: l.getYearInGanZhi(),
      monthGZ: l.getMonthInGanZhi(),
      dayGZ: l.getDayInGanZhi(),
      timeGZ: l.getTimeInGanZhi(),
      shengxiao: SX[l.getYearShengXiao()] || l.getYearShengXiao(),
      jieqi: prev ? prev.getName() : '—',
      shichen: label
    };
  }

  return { adapt };
})();
