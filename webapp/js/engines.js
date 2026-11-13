/* 計算層：v1 實作母子補瀉（ENG-05）；其餘規則回傳待研究狀態，不產生假結果 */

function runEngine(input) {
  const rule = RULES.find(r => r.id === input.mode) || RULES[0];
  if (!rule.available) return pendingResult(rule, input);
  return motherChild(rule, input);
}

/* ENG-05 母子補瀉：虛補母、實瀉子，按五行相生推對應經脈 */
function motherChild(rule, input) {
  const m = meridianByName(input.meridian);
  if (!m) {
    return { status: 'error', point: '經脈找不到', mer: '', sub: '病經資料比對失敗。', steps: [], meta: [], warnings: [] };
  }
  const el = m.element;
  const motherEl = SHENG_MOTHER[el];
  const childEl = SHENG[el];
  const motherMers = meridiansByElement(motherEl).map(x => x.name);
  const childMers = meridiansByElement(childEl).map(x => x.name);

  let direction, targetMers, targetEl;
  if (input.def === '虛證') {
    direction = '補母'; targetMers = motherMers; targetEl = motherEl;
  } else if (input.def === '實證') {
    direction = '瀉子'; targetMers = childMers; targetEl = childEl;
  } else {
    direction = '母子並列'; targetMers = motherMers.concat(childMers); targetEl = null;
  }

  const steps = [
    `病經為「${m.name}」，五行屬${EL[el].name}。`,
    `五行相生：${EL[motherEl].name}生${EL[el].name}，${EL[el].name}生${EL[childEl].name}。`,
    input.def === '未指定'
      ? '虛實未指定，母經與子經一併列出，待確認虛實後再定補瀉。'
      : `依「虛則補其母、實則瀉其子」，本案${input.def}，宜${direction}。`,
    `對應經脈：${targetMers.join('、')}。`
  ];

  const pointText = input.def === '未指定' ? '母經 / 子經' : targetMers.join('、');
  const sub = `依${input.def}與病經「${m.name}」推得補瀉方向；具體開穴仍需對照典籍與醫師覆核。`;

  return {
    status: 'ok',
    point: pointText,
    mer: `${m.name} · ${direction}`,
    sub,
    element: targetEl,
    steps,
    meta: [
      { label: `引擎 ${rule.engine}`, kind: '' },
      { label: `規則版本 ${rule.version}`, kind: '' },
      { label: `資料 ${DATA_VERSION}`, kind: '' },
      { label: '規則已對教材', kind: 'ok' }
    ],
    warnings: ['本結果為經脈層面補瀉方向，不直接等同選穴處方。']
  };
}

/* 尚未實作的規則：保留輸入與狀態快照，結果標待研究 */
function pendingResult(rule, input) {
  return {
    status: 'pending',
    point: '規則待研究',
    mer: `${rule.name} · ${rule.engine}`,
    sub: '此流派規則尚未完成核對與實作，v1 不提供開穴結果，避免未經證實的配穴進入正式計算。',
    element: null,
    steps: [
      `所選規則：${rule.name}（${rule.engine}，版本 ${rule.version}）。`,
      '規則來源、例外與典籍出處尚待整理；目前狀態為「待研究」。',
      '輸入條件已保留，待規則核對完成後可按同一輸入重算。'
    ],
    meta: [
      { label: `引擎 ${rule.engine}`, kind: '' },
      { label: `規則版本 ${rule.version}`, kind: '' },
      { label: `資料 ${DATA_VERSION}`, kind: '' },
      { label: '待研究 · 未核對出處', kind: 'warn' }
    ],
    warnings: ['未經核實的師承規則不得進入正式計算。']
  };
}
