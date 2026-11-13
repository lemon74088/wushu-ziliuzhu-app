/* 計算層：v1 實作母子補瀉（ENG-05）；其餘規則回傳待研究狀態，不產生假結果 */

function runEngine(input) {
  const rule = RULES.find(r => r.id === input.mode) || RULES[0];
  if (!rule.available) return pendingResult(rule, input);
  if (rule.id === 'nazu') return nazu(rule, input);
  return motherChild(rule, input);
}

/* 取本經五行相符的五輸穴：母穴／子穴 */
function pointByElement(m, el) {
  const order = PT_EL[m.polar];
  const i = order.indexOf(el);
  if (i < 0) return null;
  return { category: m.pts[i][0], name: m.pts[i][1], element: el };
}

/* ENG-05 母子補瀉：虛補母穴、實瀉子穴，按本經五輸五行取穴，另列母經／子經參考 */
function motherChild(rule, input) {
  const m = meridianByName(input.meridian);
  if (!m) {
    return { status: 'error', point: '經脈找不到', mer: '', sub: '病經資料比對失敗。', steps: [], meta: [], warnings: [] };
  }
  const el = m.element;
  const motherEl = SHENG_MOTHER[el];
  const childEl = SHENG[el];
  const motherPt = pointByElement(m, motherEl);
  const childPt = pointByElement(m, childEl);
  const motherMers = meridiansByElement(motherEl).map(x => x.name);
  const childMers = meridiansByElement(childEl).map(x => x.name);

  let direction, picks, targetMers, targetEl;
  if (input.def === '虛證') {
    direction = '補母'; picks = [motherPt]; targetMers = motherMers; targetEl = motherEl;
  } else if (input.def === '實證') {
    direction = '瀉子'; picks = [childPt]; targetMers = childMers; targetEl = childEl;
  } else {
    direction = '母子並列'; picks = [motherPt, childPt]; targetMers = motherMers.concat(childMers); targetEl = null;
  }

  const fmt = p => p ? `${p.name}（${p.category}·${EL[p.element].name}）` : '—';
  const pointText = picks.filter(Boolean).map(fmt).join('、');

  const steps = [
    `病經「${m.name}」，五行屬${EL[el].name}。`,
    `五行相生：${EL[motherEl].name}生${EL[el].name}，${EL[el].name}生${EL[childEl].name}。`,
    input.def === '未指定'
      ? '虛實未指定，母穴與子穴一併列出，待確認虛實後再定補瀉。'
      : `依「虛則補其母、實則瀉其子」，本案${input.def}，宜${direction}。`,
    `本經母穴：${fmt(motherPt)}；本經子穴：${fmt(childPt)}。`,
    `參考母經／子經：${targetMers.join('、')}。`
  ];

  const sub = `依${input.def}與病經「${m.name}」推得${direction}取穴；具體操作仍需對照典籍與醫師覆核。`;

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
    warnings: ['本結果為五輸穴母穴／子穴推導，不直接等同選穴處方；上線前須醫師覆核典籍出處。']
  };
}

/* ENG-07 納子法：按時辰推當令經脈，列出該經五輸穴 */
function nazu(rule, input) {
  const branch = (input.shichen || '')[0];
  const m = MERIDIANS.find(x => x.id === NAZU_FLOW[branch]);
  if (!m) {
    return { status: 'error', point: '時辰找不到', mer: '', sub: '時辰資料比對失敗。', steps: [], meta: [], warnings: [] };
  }
  const order = PT_EL[m.polar];
  const pts = m.pts.map((p, i) => `${p[0]} ${p[1]}（${EL[order[i]].name}）`);

  const steps = [
    `納子流注：${branch}時氣血流注${m.name}。`,
    `該經五輸穴：${pts.join('、')}。`,
    '虛實補瀉另依母子補瀉法判斷；本結果為經脈當令參考。'
  ];

  return {
    status: 'ok',
    point: m.name,
    mer: `${m.name} · 當令`,
    sub: `此時（${input.shichen}）氣血流注${m.name}；取穴仍需配合虛實與典籍覆核。`,
    element: m.element,
    steps,
    meta: [
      { label: `引擎 ${rule.engine}`, kind: '' },
      { label: `規則版本 ${rule.version}`, kind: '' },
      { label: `資料 ${DATA_VERSION}`, kind: '' },
      { label: '規則已對教材', kind: 'ok' }
    ],
    warnings: ['納子法為經脈當令參考，不直接等同選穴處方；上線前須醫師覆核典籍出處。']
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
