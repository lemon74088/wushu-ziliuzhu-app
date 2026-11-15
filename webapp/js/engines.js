/* 計算層：v1 實作母子補瀉（ENG-05）；其餘規則回傳待研究狀態，不產生假結果 */

function runEngine(input) {
  const rule = RULES.find(r => r.id === input.mode) || RULES[0];
  if (!rule.available) return pendingResult(rule, input);
  if (rule.id === 'nazu') return nazu(rule, input);
  if (rule.id === 'najia') return najia(rule, input);
  if (rule.id === 'wumen') return wumen(rule, input);
  if (rule.id === 'yuanluo') return yuanluo(rule, input);
  if (input.mode === 'huhe') return huhe(rule, input);
  if (input.mode === 'huahua') return huahua(rule, input);
  return motherChild(rule, input);
}

function pairOf(merId) {
  return WUMEN_PAIRS.find(p => p.a === merId || p.b === merId) || null;
}
function benOf(m) { return pointByElement(m, m.element); }
function yuanPt(m) {
  const name = YUAN_POINTS[m.id];
  return name ? { category: '原穴', name, element: m.element } : null;
}
/* 化合補瀉目標：十干納經，心包寄癸、三焦寄壬不列入 */
function tenByElement(el) {
  return MERIDIANS.filter(m => m.element === el && m.id !== 'pericardium' && m.id !== 'sanjiao');
}

/* 五門對照卡：同一病經下並列化合（虛/實）、互合、自合、表里通治占位 */
function buildCompare(m, pair, otherM) {
  const selfBen = benOf(m);
  const otherBen = benOf(otherM);
  const transEl = pair.element;
  const fill = tenByElement(SHENG[transEl]).map(x => x.name);
  const drain = tenByElement(SHENG_MOTHER[transEl]).map(x => x.name);
  return [
    { label: '虛證（化合法）', points: [selfBen.name, otherBen.name], note: `補 ${fill.join('、')}` },
    { label: '實證（化合法）', points: [selfBen.name, otherBen.name], note: `瀉 ${drain.join('、')}` },
    { label: '互合法', points: [otherBen.name], note: '取所合之經本穴，借氣調經' },
    { label: '自合法', points: [selfBen.name], note: '本經本穴，穴性與本經五行相同' },
    { label: '表里通治法', points: [], note: '待研究：表裡經與絡穴資料待核對' }
  ];
}

/* 取本經五行相符的五輸穴：母穴／子穴 */
function pointByElement(m, el) {
  const order = PT_EL[m.polar];
  const i = order.indexOf(el);
  if (i < 0) return null;
  return { category: m.pts[i][0], name: m.pts[i][1], element: el };
}

/* 本經五輸穴清單（含五行） */
function shuList(m) {
  const order = PT_EL[m.polar];
  return m.pts.map((p, i) => ({ category: p[0], name: p[1], element: order[i] }));
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
  const benPt = pointByElement(m, el);
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
  const pointText = picks.filter(Boolean).map(p => p ? p.name : '—').join('、');

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
    merId: m.id,
    info: [
      { label: '補法母穴', pt: motherPt },
      { label: '瀉法子穴', pt: childPt },
      { label: '本穴', pt: benPt },
      { label: '原穴', pt: yuanPt(m) }
    ],
    motherPt, childPt,
    shu: shuList(m),
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
  const benPt = pointByElement(m, m.element);

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
    merId: m.id,
    info: [
      { label: '本穴', pt: benPt },
      { label: '原穴', pt: yuanPt(m) }
    ],
    shu: shuList(m),
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

/* ENG-06 納甲法：日干納經，按時辰查表開井滎俞經合；俞穴兼過原穴，重見納三焦心包 */
function najia(rule, input) {
  const cal = input.calendar || {};
  const gan = (cal.dayGZ || '')[0];
  const branch = (input.shichen || '')[0];
  const merId = NAJIA_GAN[gan];
  const m = merId ? MERIDIANS.find(x => x.id === merId) : null;
  const rows = NAJIA_TABLE[gan];

  if (!m || !rows) {
    return { status: 'error', point: '干支資料比對失敗', mer: '', sub: '日干或時辰資料比對失敗，無法排納甲開穴。', steps: [], meta: [], warnings: [] };
  }

  const meta = [
    { label: `引擎 ${rule.engine}`, kind: '' },
    { label: `規則版本 ${rule.version}`, kind: '' },
    { label: `資料 ${DATA_VERSION}`, kind: '' },
    { label: '規則已對教材', kind: 'ok' }
  ];
  const infoBase = [{ label: '值日經', pt: null, value: m.name }];

  const entry = rows.find(r => r.branch === branch);

  if (!entry) {
    return {
      status: 'closed',
      point: '閉時 · 無值時開穴',
      mer: `${m.name} · 閉時`,
      sub: `${gan}日值日${m.name}；${branch}時非本法開穴時辰（陽日陽時、陰日陰時），屬閉時。`,
      element: m.element,
      merId: m.id,
      info: infoBase,
      shu: shuList(m),
      steps: [
        `${gan}日納經：值日${m.name}。`,
        `${branch}時不在本日開穴時辰序列，是為閉時。`,
        '閉時補法：合日互用（借相合日干同時辰之穴）、夫妻子母互用、十二經母子補瀉；須由醫師辨證選用。'
      ],
      meta,
      warnings: ['閉時不強開穴；補法屬變通，仍須辨證與典籍覆核。']
    };
  }

  const yuanText = [entry.yuan, entry.yuan2].filter(Boolean).join('、');
  const info = infoBase.concat([
    { label: `${entry.cat}穴`, pt: null, value: entry.point },
    ...(yuanText ? [{ label: '兼過原穴', pt: null, value: yuanText }] : [])
  ]);
  if (entry.note) info.push({ label: '重見納穴', pt: null, value: entry.note });

  const steps = [
    `${gan}日納經，值日${m.name}。`,
    `${branch}時開${entry.cat}穴：${entry.point}${entry.note ? `（${entry.note}）` : ''}。`,
    entry.yuan ? `俞穴返本還元，兼過原穴${yuanText}。` : '井滎經合依五輸次序流注。',
    '開穴本身不帶補瀉；虛實補瀉在手法，並配合辨證配穴。'
  ];

  return {
    status: 'ok',
    point: entry.point,
    mer: `${m.name} · ${entry.cat}穴`,
    sub: `${gan}日${branch}時，${m.name}值日，開${entry.cat}穴${entry.point}${yuanText ? `；兼過原穴${yuanText}` : ''}。`,
    element: m.element,
    merId: m.id,
    info,
    shu: shuList(m),
    steps,
    meta,
    warnings: ['納甲開穴為時間流注參考，不直接等同選穴處方；上線前須醫師覆核典籍出處。']
  };
}

/* ENG-08 五門十變：查夫妻經與所化之氣（關係查詢，不出處方） */
function wumen(rule, input) {
  const m = meridianByName(input.meridian);
  if (!m) return { status: 'error', point: '經脈找不到', mer: '', sub: '病經資料比對失敗。', steps: [], meta: [], warnings: [] };
  const pair = pairOf(m.id);
  if (!pair) return { status: 'error', point: '無合化對', mer: '', sub: '此經未列入五門合化對（心包、三焦寄干，暫不論夫妻配穴）。', steps: [], meta: [], warnings: [] };
  const otherId = pair.a === m.id ? pair.b : pair.a;
  const otherM = MERIDIANS.find(x => x.id === otherId);
  const selfBen = benOf(m);
  const otherBen = benOf(otherM);

  const steps = [
    `天干合化：${pair.pair}，${m.name}與${otherM.name}為夫妻經。`,
    `兩經相合化${EL[pair.element].name}之氣；所化之氣不等同兩經本氣。`,
    `兩經本穴並列：${selfBen.name}（${m.name}）、${otherBen.name}（${otherM.name}）；實際取穴另依互合法或化合法辨證選用。`
  ];

  const compare = buildCompare(m, pair, otherM);

  return {
    status: 'ok',
    point: `${selfBen.name}＋${otherBen.name}`,
    mer: `${pair.pair} 合化${EL[pair.element].name}`,
    sub: `${m.name}與${otherM.name}為夫妻經，相合化${EL[pair.element].name}之氣；兩經本穴並列，處方須配合虛實與典籍覆核。`,
    element: pair.element,
    merId: m.id,
    compare,
    info: [
      { label: `本穴 · ${m.name}`, pt: selfBen },
      { label: `本穴 · ${otherM.name}`, pt: otherBen },
      { label: '所化之氣', pt: null, value: EL[pair.element].name }
    ],
    shu: shuList(m),
    steps,
    meta: [
      { label: `引擎 ${rule.engine}`, kind: '' },
      { label: `規則版本 ${rule.version}`, kind: '' },
      { label: `資料 ${DATA_VERSION}`, kind: '' },
      { label: '規則已對教材', kind: 'ok' }
    ],
    warnings: ['五門十變為合化關係參考，不直接等同選穴處方；上線前須醫師覆核典籍出處。']
  };
}

/* ENG-12 原絡配穴：先病經為主取本經原穴，表裡後病經為客取其絡穴 */
function yuanluo(rule, input) {
  const m = meridianByName(input.meridian);
  if (!m) return { status: 'error', point: '經脈找不到', mer: '', sub: '病經資料比對失敗。', steps: [], meta: [], warnings: [] };
  const otherId = TABLELI[m.id];
  const otherM = MERIDIANS.find(x => x.id === otherId);
  if (!otherM) return { status: 'error', point: '表裡經找不到', mer: '', sub: '此經表裡配對資料缺失。', steps: [], meta: [], warnings: [] };

  const yuanName = YUAN_POINTS[m.id];
  const luoName = LUO_POINTS[otherM.id];
  const yuanPt = { category: '原穴', name: yuanName, element: m.element };
  const luoPt = { category: '絡穴', name: luoName, element: otherM.element };

  const steps = [
    `先病之經為主：${m.name}，取本經原穴${yuanName}為主穴。`,
    `表裡經${otherM.name}後病為客，取其絡穴${luoName}為客穴。`,
    '一原一絡、主客分明；不可兩原並取、兩絡齊下。',
    '原絡定表裡，五輸定虛實，時日定先後；可與母子補瀉、納子納甲合參。'
  ];

  return {
    status: 'ok',
    point: `${yuanName}＋${luoName}`,
    mer: `${m.name}主 · ${otherM.name}客`,
    sub: `${m.name}先病為主，取原穴${yuanName}；表裡${otherM.name}後病為客，取絡穴${luoName}；主客次序一倒，取穴即反。`,
    element: m.element,
    merId: m.id,
    info: [
      { label: '主穴 · 原穴', pt: yuanPt },
      { label: '客穴 · 絡穴', pt: luoPt },
      { label: '表裡經', pt: null, value: otherM.name }
    ],
    shu: shuList(m),
    steps,
    meta: [
      { label: `引擎 ${rule.engine}`, kind: '' },
      { label: `規則版本 ${rule.version}`, kind: '' },
      { label: `資料 ${DATA_VERSION}`, kind: '' },
      { label: '規則已對教材', kind: 'ok' }
    ],
    warnings: ['原絡配穴為表裡取穴參考，不直接等同選穴處方；上線前須醫師覆核典籍出處。']
  };
}

/* ENG-09 互合法：病經取所合之經本穴，借氣調經 */
function huhe(rule, input) {
  const m = meridianByName(input.meridian);
  if (!m) return { status: 'error', point: '經脈找不到', mer: '', sub: '病經資料比對失敗。', steps: [], meta: [], warnings: [] };
  const pair = pairOf(m.id);
  if (!pair) return { status: 'error', point: '無合化對', mer: '', sub: '此經未列入五門合化對，無法互合取穴。', steps: [], meta: [], warnings: [] };
  const otherId = pair.a === m.id ? pair.b : pair.a;
  const otherM = MERIDIANS.find(x => x.id === otherId);
  const benOther = benOf(otherM);
  const benSelf = benOf(m);

  const steps = [
    `病經「${m.name}」，與${otherM.name}相合（${pair.pair}）。`,
    `互合法不取本經穴，逕取所合之經本穴：${benOther.name}（${benOther.category}·${EL[benOther.element].name}）；病在甲取諸己，取的是相合之氣。`,
    '互合一病一穴、借氣調經，多用於四肢痹痛、經氣不通、麻木、屈伸不利等經絡局部病證；化合偏內科整體補虛瀉實，可先化合固本、後互合通絡。',
    '井穴位於指趾端、皮薄易痛，臨床可依「瀉井當瀉滎、補井當補合」代用；須由醫師依證選穴。'
  ];

  const compare = buildCompare(m, pair, otherM);

  return {
    status: 'ok',
    point: benOther.name,
    mer: `${otherM.name} · 互合借氣`,
    sub: `病經${m.name}，依互合法取所合之經${otherM.name}本穴${benOther.name}；一病一穴，借彼經之氣調此經之病，不取二穴合力。`,
    element: otherM.element,
    merId: otherM.id,
    compare,
    info: [
      { label: '所合經本穴', pt: benOther },
      { label: '本經本穴', pt: benSelf }
    ],
    shu: shuList(otherM),
    steps,
    meta: [
      { label: `引擎 ${rule.engine}`, kind: '' },
      { label: `規則版本 ${rule.version}`, kind: '' },
      { label: `資料 ${DATA_VERSION}`, kind: '' },
      { label: '規則已對教材', kind: 'ok' }
    ],
    warnings: ['互合取穴為經絡調治參考，不直接等同選穴處方；上線前須醫師覆核典籍出處。']
  };
}

/* ENG-10 化合法：兩經本穴並取，合化第三種五行之氣，再論補母瀉子 */
function huahua(rule, input) {
  const m = meridianByName(input.meridian);
  if (!m) return { status: 'error', point: '經脈找不到', mer: '', sub: '病經資料比對失敗。', steps: [], meta: [], warnings: [] };
  const pair = pairOf(m.id);
  if (!pair) return { status: 'error', point: '無合化對', mer: '', sub: '此經未列入五門合化對，無法化合配穴。', steps: [], meta: [], warnings: [] };
  const otherId = pair.a === m.id ? pair.b : pair.a;
  const otherM = MERIDIANS.find(x => x.id === otherId);
  const benA = benOf(m);
  const benB = benOf(otherM);
  const transEl = pair.element;
  const motherEl = SHENG_MOTHER[transEl];
  const childEl = SHENG[transEl];
  const fillMers = tenByElement(childEl).map(x => x.name);
  const drainMers = tenByElement(motherEl).map(x => x.name);

  const steps = [
    `相合兩經：${m.name}本穴${benA.name}、${otherM.name}本穴${benB.name}。`,
    `二穴並用，合化${EL[transEl].name}之氣；所化之氣非兩經本氣。`,
    `虛則補其母：宜補${fillMers.join('、')}（${EL[childEl].name}）；實則瀉其子：宜瀉${drainMers.join('、')}（${EL[motherEl].name}）。`,
    '井穴疼痛時可代以滎穴（瀉）或合穴（補）；臨床由醫師辨證選穴。'
  ];

  const compare = buildCompare(m, pair, otherM);

  return {
    status: 'ok',
    point: `${benA.name}＋${benB.name}`,
    mer: `${pair.pair}化${EL[transEl].name}`,
    sub: `取${m.name}本穴${benA.name}與${otherM.name}本穴${benB.name}並用，合化${EL[transEl].name}之氣，再依虛實補母瀉子。`,
    element: transEl,
    merId: m.id,
    compare,
    info: [
      { label: '本穴（病經）', pt: benA },
      { label: '本穴（所合）', pt: benB },
      { label: '所化之氣', pt: null, value: EL[transEl].name }
    ],
    shu: shuList(m),
    steps,
    meta: [
      { label: `引擎 ${rule.engine}`, kind: '' },
      { label: `規則版本 ${rule.version}`, kind: '' },
      { label: `資料 ${DATA_VERSION}`, kind: '' },
      { label: '規則已對教材', kind: 'ok' }
    ],
    warnings: ['化合配穴為整體補虛瀉實參考，不直接等同選穴處方；上線前須醫師覆核典籍出處。']
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
    merId: null,
    info: [],
    shu: [],
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
