/* 應用層：頁面切換、計算流程、穴庫渲染、歷史記錄 */

/* 由目前鐘點推對應時辰（子時 23:00 起） */
function currentShichen() {
  const h = new Date().getHours();
  const idx = h === 23 ? 0 : Math.floor((h + 1) / 2);
  return SHICHEN[idx];
}

const state = {
  mode: 'motherchild',
  meridian: '足少陰腎經',
  def: '實證',
  date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
  shichen: currentShichen(),
  lastResult: null
};

const $ = id => document.getElementById(id);
const flowEl = $('flow');
const topbarEl = $('topbar');
const toastEl = $('toast');
let toastT;

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('on'), 1800);
}

/* ── 日曆圓盤：ENG-01 lunar 適配 ── */
function refreshDial() {
  const c = Calendar.adapt(state.date, state.shichen);
  $('dialShichen').textContent = I18N.t(c.shichen);
  $('dialPillar').textContent = I18N.t(`時柱 · ${c.timeGZ}`);
  $('dialDay').textContent = I18N.t(`${c.dayGZ}日 · ${c.weekday}`);
  $('metaDate').textContent = I18N.t(`公曆 ${c.date}`);
  $('metaLunar').textContent = I18N.t(`農曆 ${c.lunar}`);
  $('metaJieqi').textContent = I18N.t(`${c.jieqi}後`);
  $('metaShengxiao').textContent = I18N.t(`生肖 ${c.shengxiao}`);
  $('metaShichen').textContent = I18N.t(`時辰 ${c.shichen}`);
  return c;
}

/* ── 狀態列時間 ── */
function clock() {
  const d = new Date();
  $('statusTime').textContent = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
clock(); setInterval(clock, 10000);

/* ── 規則 chip ── */
const ruleRail = $('ruleRail');
function buildRuleRail() {
  ruleRail.innerHTML = '';
  RULES.forEach(r => {
    const b = document.createElement('button');
    b.className = 'chip' + (r.id === state.mode ? ' on' : '') + (r.available ? '' : ' todo');
    b.dataset.rule = r.id;
    b.innerHTML = `<span class="dot"></span>${I18N.t(r.name)}`;
    b.onclick = () => {
      state.mode = r.id;
      ruleRail.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.dataset.rule === r.id));
      liveRecalc();
    };
    ruleRail.appendChild(b);
  });
}
buildRuleRail();

/* ── 虛實 chip ── */
$('defGroup').querySelectorAll('.chip').forEach(c => {
  c.onclick = () => {
    state.def = c.dataset.def;
    $('defGroup').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c));
    liveRecalc();
  };
});

/* ── 下拉選單 ── */
const meridianSelect = $('meridianSelect');
function buildMeridianOptions() {
  meridianSelect.innerHTML = '';
  MERIDIANS.forEach(m => {
    const o = document.createElement('option');
    o.value = m.name;
    o.textContent = I18N.t(m.name);
    meridianSelect.appendChild(o);
  });
}
buildMeridianOptions();
meridianSelect.value = state.meridian;
meridianSelect.onchange = () => {
  state.meridian = meridianSelect.value;
  $('meridianLabel').textContent = I18N.t(state.meridian);
  liveRecalc();
};

const shichenSelect = $('shichenSelect');
function buildShichenOptions() {
  shichenSelect.innerHTML = '';
  SHICHEN.forEach(s => {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = I18N.t(s);
    shichenSelect.appendChild(o);
  });
}
buildShichenOptions();
shichenSelect.value = state.shichen;
shichenSelect.onchange = () => {
  state.shichen = shichenSelect.value;
  refreshDial();
  liveRecalc();
};
$('dateInput').value = state.date;

/* ── 圓盤刻度 ── */
const ticks = $('dialTicks');
for (let i = 0; i < 12; i++) {
  const a = i * 30 * Math.PI / 180;
  const x1 = 100 + Math.cos(a) * 74, y1 = 100 + Math.sin(a) * 74;
  const x2 = 100 + Math.cos(a) * 68, y2 = 100 + Math.sin(a) * 68;
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('x1', x1); l.setAttribute('y1', y1);
  l.setAttribute('x2', x2); l.setAttribute('y2', y2);
  l.setAttribute('stroke', i === 0 ? '#D6543C' : 'rgba(255,255,255,.18)');
  l.setAttribute('stroke-width', i === 0 ? 3 : 2);
  ticks.appendChild(l);
}

/* ── 穴庫渲染 ── */
const merList = $('merList');
function buildMerList() {
  merList.innerHTML = '';
  MERIDIANS.forEach(m => {
    const el = EL[m.element];
    const elOrder = PT_EL[m.polar];
    const card = document.createElement('article');
    card.className = 'card mer';
    card.innerHTML = `
      <div class="m-row" data-expand>
        <div class="m-ic"><span class="dot" style="width:12px;height:12px;border-radius:50%;background:${el.color};color:${el.color}"></span></div>
        <div class="m-name">
          <div class="nm">${I18N.t(m.name)}</div>
          <div class="yy">${I18N.t(m.yy)}</div>
        </div>
        <div class="m-pts">${m.pts.map(p => `<div class="p">${I18N.t(p[0])}<b>${I18N.t(p[1])}</b></div>`).join('')}</div>
      </div>
      <div class="more"><div class="more-inner">
        <table class="point-table">
          <thead><tr><th>${I18N.t('類別')}</th><th>${I18N.t('穴名')}</th><th>${I18N.t('五行')}</th></tr></thead>
          <tbody>${m.pts.map((p, i) => {
            const pe = EL[elOrder[i]];
            return `<tr><td>${I18N.t(p[0])}</td><td>${I18N.t(p[1])}</td><td><span style="color:${pe.color}">${I18N.t(pe.name)}</span></td></tr>`;
          }).join('')}</tbody>
        </table>
        <p class="point-desc">${I18N.t(m.desc)}</p>
      </div></div>`;
    merList.appendChild(card);
  });
}
buildMerList();

/* ── 卡片展開 ── */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-expand]');
  if (!el) return;
  if (e.target.closest('.rec-actions')) return;
  const card = el.closest('.card') || el;
  card.classList.toggle('open');
  const tog = card.querySelector('.r-toggle');
  if (tog) tog.firstChild.textContent = card.classList.contains('open') ? I18N.t('收起推演依據') : I18N.t('展開推演依據');
});

/* ── 結果渲染 ── */
function renderResult(res, rule) {
  const card = $('resultCard');
  state.lastResult = { res, rule };
  $('resultTag').textContent = I18N.t(`計算結果 · ${rule.name}`);
  $('resultPoint').textContent = I18N.t(res.point);
  $('resultMer').textContent = I18N.t(res.mer);
  $('resultSub').textContent = I18N.t(res.sub);

  const elTag = $('resultElTag');
  if (res.element) {
    const e = EL[res.element];
    elTag.hidden = false;
    $('resultEl').textContent = I18N.t(e.name);
    const dot = $('resultElDot');
    dot.style.background = e.color; dot.style.color = e.color;
  } else {
    elTag.hidden = true;
  }

  $('stepList').innerHTML = res.steps.map((s, i) =>
    `<div class="step"><span class="n">${i + 1}</span><span>${I18N.t(s)}</span></div>`).join('');

  $('resultMeta').innerHTML = res.meta.map(b =>
    `<span class="badge ${b.kind}">${I18N.t(b.label)}</span>`).join('') +
    res.warnings.map(w => `<span class="badge warn">${I18N.t(w)}</span>`).join('');

  card.classList.remove('open');
  const tog = card.querySelector('.r-toggle');
  if (tog) tog.firstChild.textContent = I18N.t('展開推演依據');
  card.hidden = false;
  card.classList.remove('open');
}

/* ── 計算 ── */
function currentInput() {
  const calendar = Calendar.adapt(state.date, state.shichen);
  return {
    date: state.date,
    shichen: state.shichen,
    meridian: state.meridian,
    def: state.def,
    mode: state.mode,
    calendar
  };
}

async function calculate(input, { save = true } = {}) {
  const rule = RULES.find(r => r.id === input.mode) || RULES[0];
  const res = runEngine(input);
  renderResult(res, rule);

  if (save) {
    const snapshot = {
      engine: rule.engine,
      ruleVersion: rule.version,
      dataVersion: DATA_VERSION,
      calendarLib: 'lunar-javascript v1.7.8 MIT',
      status: res.status
    };
    await History.add({
      input,
      modeName: rule.name,
      result: { point: res.point, mer: res.mer, sub: res.sub, element: res.element },
      steps: res.steps,
      meta: res.meta,
      warnings: res.warnings,
      snapshot
    });
    await renderHistory();
  }
  return res;
}

/* 條件變更即時重算（不寫入歷史） */
function liveRecalc() { calculate(currentInput(), { save: false }); }

$('calcBtn').onclick = async () => {
  await calculate(currentInput());
  toast(I18N.t('已計算，記錄已保存'));
  $('resultCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

/* ── 歷史渲染 ── */
const histList = $('histList');

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function renderHistory() {
  const records = await History.all();
  $('histCount').textContent = I18N.t(`${records.length} 則記錄`);
  histList.innerHTML = '';
  if (!records.length) {
    histList.innerHTML = `<div class="empty">${I18N.t('尚無計算記錄。')}<br>${I18N.t('完成一次計算後，結果會保存在此，且不會被新記錄覆蓋。')}</div>`;
    return;
  }
  records.forEach((h, i) => {
    const rec = document.createElement('article');
    rec.className = 'card rec';
    const statusKind = h.snapshot && h.snapshot.status === 'ok' ? 'ok' : 'warn';
    const statusText = I18N.t(h.snapshot && h.snapshot.status === 'ok' ? '已對教材' : '待研究');
    rec.innerHTML = `
      <div class="r-row" data-expand>
        <div class="r-top">
          <span class="r-time">${fmtTime(h.createdAt)}</span>
          <span class="r-mode">${I18N.t(h.modeName)}</span>
          <span class="badge ${statusKind}" style="margin-left:auto">${statusText}</span>
        </div>
        <div class="r-sum">${I18N.t(h.input.meridian)} · <b>${I18N.t(h.result.point)}</b></div>
        <div class="r-foot">
          <span class="badge">${h.snapshot.ruleVersion}</span>
          <span class="badge">${I18N.t(`${h.input.date} · ${h.input.shichen.split(' ')[0]} · ${h.input.def}`)}</span>
        </div>
      </div>
      <div class="more"><div class="more-inner">
        ${h.steps.map((s, k) => `<div class="step"><span class="n">${k + 1}</span><span>${I18N.t(s)}</span></div>`).join('')}
        <div class="rec-actions">
          <button class="chip" data-act="view" data-i="${i}">${I18N.t('查看原始結果')}</button>
          <button class="chip" data-act="review" data-i="${i}">${I18N.t('舊版覆盤')}</button>
          <button class="chip" data-act="rerun" data-i="${i}">${I18N.t('新版重算')}</button>
        </div>
      </div></div>`;
    histList.appendChild(rec);
  });
}

histList.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const records = await History.all();
  const h = records[Number(b.dataset.i)];
  if (!h) return;
  if (b.dataset.act === 'view') {
    toast(I18N.t('已載入原始結果快照（展開內容即當時推演）'));
  } else if (b.dataset.act === 'review') {
    toast(I18N.t(`舊版覆盤：規則 ${h.snapshot.ruleVersion} · 資料 ${h.snapshot.dataVersion}`));
  } else if (b.dataset.act === 'rerun') {
    state.mode = h.input.mode; state.meridian = h.input.meridian; state.def = h.input.def;
    state.date = h.input.date; state.shichen = h.input.shichen;
    syncControls();
    await calculate(h.input);
    switchPanel('home');
    toast(I18N.t('已按同一輸入以新版規則重算'));
  }
});

$('exportBtn').onclick = async () => {
  const records = await History.all();
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'wushu-history.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast(I18N.t(`已導出 ${records.length} 則記錄`));
};

/* ── 彈層 ── */
const scrim = $('scrim'), modal = $('modal');
function openModal(on) { scrim.classList.toggle('on', on); modal.classList.toggle('on', on); }
$('dateCard').onclick = () => openModal(true);
$('meridianBtn').onclick = () => openModal(true);
$('modalCancel').onclick = () => openModal(false);
scrim.onclick = () => openModal(false);
$('modalOk').onclick = () => {
  state.date = $('dateInput').value;
  state.shichen = shichenSelect.value;
  state.meridian = meridianSelect.value;
  $('meridianLabel').textContent = I18N.t(state.meridian);
  refreshDial();
  openModal(false);
  liveRecalc();
};

function syncControls() {
  meridianSelect.value = state.meridian;
  shichenSelect.value = state.shichen;
  $('dateInput').value = state.date;
  $('meridianLabel').textContent = I18N.t(state.meridian);
  ruleRail.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.dataset.rule === state.mode));
  $('defGroup').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.dataset.def === state.def));
}

/* ── 分頁切換 ── */
const panels = [...document.querySelectorAll('.panel')];
const tabs = [...document.querySelectorAll('.tabbar button')];
function switchPanel(go) {
  tabs.forEach(x => x.classList.toggle('on', x.dataset.go === go));
  panels.forEach(p => p.hidden = p.dataset.panel !== go);
  flowEl.scrollTop = 0; lastScrollY = 0; topbarEl.classList.remove('hide');
}
tabs.forEach(b => b.onclick = () => switchPanel(b.dataset.go));

/* ── 往下捲隱藏頂欄 ── */
let lastScrollY = 0;
flowEl.addEventListener('scroll', () => {
  const y = flowEl.scrollTop;
  if (y > lastScrollY && y > 40) topbarEl.classList.add('hide');
  else if (y < lastScrollY - 4) topbarEl.classList.remove('hide');
  lastScrollY = y;
}, { passive: true });

/* ── Spotlight 游標光 ── */
flowEl.addEventListener('mousemove', e => {
  const c = e.target.closest('.card');
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--x', (e.clientX - r.left) + 'px');
  c.style.setProperty('--y', (e.clientY - r.top) + 'px');
});

$('settingsBtn').onclick = () => toast(I18N.t(`v1 本機原型 · 資料 ${DATA_VERSION} · 規則待醫師覆核`));

/* ── 繁簡切換 ── */
const localeBtn = $('localeBtn');
function applyStatic() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = I18N.t(el.dataset.i18n);
  });
  localeBtn.textContent = I18N.get() === 'zh-Hans' ? '繁' : '簡';
  document.documentElement.lang = I18N.get();
}
function rerenderAll() {
  buildRuleRail();
  buildMeridianOptions();
  buildShichenOptions();
  buildMerList();
  refreshDial();
  syncControls();
  renderHistory();
  if (state.lastResult) renderResult(state.lastResult.res, state.lastResult.rule);
}
localeBtn.onclick = () => {
  const next = I18N.get() === 'zh-Hans' ? 'zh-Hant' : 'zh-Hans';
  I18N.setLocale(next);
  applyStatic();
  rerenderAll();
};

/* ── 啟動 ── */
(async () => {
  await History.init();
  applyStatic();
  syncControls();
  await renderHistory();
  refreshDial();
  liveRecalc();
})();
