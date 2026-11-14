/* 資料層：十二經、五輸穴、五行（教材核對版，見 references/五輸穴五行配屬核對.md） */

const EL = {
  wood:  { name: '木', color: 'var(--el-wood)' },
  fire:  { name: '火', color: 'var(--el-fire)' },
  earth: { name: '土', color: 'var(--el-earth)' },
  metal: { name: '金', color: 'var(--el-metal)' },
  water: { name: '水', color: 'var(--el-water)' }
};

/* 五行相生：我生者 */
const SHENG = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
/* 五行相生生我者（母） */
const SHENG_MOTHER = { fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal', wood: 'water' };

/* 五輸穴五行配屬：陰經 井木·滎火·輸土·經金·合水；陽經 井金·滎水·輸木·經火·合土 */
const PT_EL = {
  yin:  ['wood', 'fire', 'earth', 'metal', 'water'],
  yang: ['metal', 'water', 'wood', 'fire', 'earth']
};

const SHICHEN = [
  '子時 23:00–01:00', '丑時 01:00–03:00', '寅時 03:00–05:00', '卯時 05:00–07:00',
  '辰時 07:00–09:00', '巳時 09:00–11:00', '午時 11:00–13:00', '未時 13:00–15:00',
  '申時 15:00–17:00', '酉時 17:00–19:00', '戌時 19:00–21:00', '亥時 21:00–23:00'
];

const MERIDIANS = [
  { id: 'lung', name: '手太陰肺經', polar: 'yin',  yy: '陰經 · 金', element: 'metal',
    pts: [['井','少商'],['滎','魚際'],['輸','太淵'],['經','經渠'],['合','尺澤']],
    desc: '肺經起於中焦，下絡大腸，循胃口上膈屬肺；五腧穴皆在手臂橈側緣。' },
  { id: 'pericardium', name: '手厥陰心包經', polar: 'yin', yy: '陰經 · 火', element: 'fire',
    pts: [['井','中衝'],['滎','勞宮'],['輸','大陵'],['經','間使'],['合','曲澤']],
    desc: '心包經代心受邪，循胸出脅，入掌中；五腧穴位於手臂正中線。' },
  { id: 'heart', name: '手少陰心經', polar: 'yin', yy: '陰經 · 火', element: 'fire',
    pts: [['井','少衝'],['滎','少府'],['輸','神門'],['經','靈道'],['合','少海']],
    desc: '心經起於心中，出屬心系，下膈絡小腸；穴位在手臂尺側。' },
  { id: 'spleen', name: '足太陰脾經', polar: 'yin', yy: '陰經 · 土', element: 'earth',
    pts: [['井','隱白'],['滎','大都'],['輸','太白'],['經','商丘'],['合','陰陵泉']],
    desc: '脾經起足大趾內側，循脛股內前緣入腹屬脾；五腧穴在下肢內側。' },
  { id: 'liver', name: '足厥陰肝經', polar: 'yin', yy: '陰經 · 木', element: 'wood',
    pts: [['井','大敦'],['滎','行間'],['輸','太衝'],['經','中封'],['合','曲泉']],
    desc: '肝經起足大趾毫毛際，循足背脛股內側入腹；穴位在下肢內側前方。' },
  { id: 'kidney', name: '足少陰腎經', polar: 'yin', yy: '陰經 · 水', element: 'water',
    pts: [['井','湧泉'],['滎','然谷'],['輸','太谿'],['經','復溜'],['合','陰谷']],
    desc: '腎經起足底湧泉，循內踝後上脊裡，屬腎絡膀胱；五腧穴在下肢內側後緣。' },
  { id: 'largeintestine', name: '手陽明大腸經', polar: 'yang', yy: '陽經 · 金', element: 'metal',
    pts: [['井','商陽'],['滎','二間'],['輸','三間'],['經','陽谿'],['合','曲池']],
    desc: '大腸經循手背上臂外前緣，上肩入缺盆絡肺；井合諸穴在手臂橈側。' },
  { id: 'sanjiao', name: '手少陽三焦經', polar: 'yang', yy: '陽經 · 火', element: 'fire',
    pts: [['井','關衝'],['滎','液門'],['輸','中渚'],['經','支溝'],['合','天井']],
    desc: '三焦經起無名指端，上行手背至肩；五腧穴沿手臂正中線排列。' },
  { id: 'smallintestine', name: '手太陽小腸經', polar: 'yang', yy: '陽經 · 火', element: 'fire',
    pts: [['井','少澤'],['滎','前谷'],['輸','後谿'],['經','陽谷'],['合','小海']],
    desc: '小腸經起小指端，循手臂外後緣上肩；穴位在尺側緣。' },
  { id: 'stomach', name: '足陽明胃經', polar: 'yang', yy: '陽經 · 土', element: 'earth',
    pts: [['井','厲兌'],['滎','內庭'],['輸','陷谷'],['經','解谿'],['合','足三里']],
    desc: '胃經起鼻旁，下胸腹循腿前側至足次趾；合穴足三里為常用要穴。' },
  { id: 'gallbladder', name: '足少陽膽經', polar: 'yang', yy: '陽經 · 木', element: 'wood',
    pts: [['井','足竅陰'],['滎','俠谿'],['輸','足臨泣'],['經','陽輔'],['合','陽陵泉']],
    desc: '膽經起目銳眥，循脅肋腿外側至足四趾；穴位在下肢外側中線。' },
  { id: 'bladder', name: '足太陽膀胱經', polar: 'yang', yy: '陽經 · 水', element: 'water',
    pts: [['井','至陰'],['滎','足通谷'],['輸','束骨'],['經','崑崙'],['合','委中']],
    desc: '膀胱經起目內眥，挾脊抵腰，循腿後外側至足小趾；合穴委中在膕橫紋。' }
];

/* 納子流注次序：子膽丑肝寅肺卯大腸辰胃巳脾午心未小腸申膀胱酉腎戌心包亥三焦 */
const NAZU_FLOW = {
  '子': 'gallbladder', '丑': 'liver',   '寅': 'lung',          '卯': 'largeintestine',
  '辰': 'stomach',     '巳': 'spleen',   '午': 'heart',         '未': 'smallintestine',
  '申': 'bladder',     '酉': 'kidney',   '戌': 'pericardium',   '亥': 'sanjiao'
};

/* 五門十變合化對：甲己化土、乙庚化金、丙辛化水、丁壬化木、戊癸化火（表1） */
const WUMEN_PAIRS = [
  { pair: '甲己', a: 'gallbladder',    b: 'spleen',          element: 'earth' },
  { pair: '乙庚', a: 'liver',          b: 'largeintestine',  element: 'metal' },
  { pair: '丙辛', a: 'smallintestine', b: 'lung',           element: 'water' },
  { pair: '丁壬', a: 'heart',          b: 'bladder',         element: 'wood' },
  { pair: '戊癸', a: 'stomach',        b: 'kidney',          element: 'fire' }
];

/* 計算法清單：available 為 true 表示 v1 已實作其餘先標待研究，不產生假結果 */
const RULES = [
  { id: 'motherchild', name: '母子補瀉', engine: 'ENG-05', available: true,  version: 'MC-v0.2',
    desc: '虛補母穴、實瀉子穴，按本經五輸五行取穴' },
  { id: 'najia',       name: '納甲法',   engine: 'ENG-06', available: false, version: 'NAJIA-v0.0',
    desc: '按日干時干開穴；閉穴時以合日互用補救（待開穴表與原穴資料）' },
  { id: 'nazu',        name: '納子法',   engine: 'ENG-07', available: true,  version: 'NAZU-v0.1',
    desc: '依時辰推當令經脈與五輸穴' },
  { id: 'wumen',       name: '五門十變', engine: 'ENG-08/09/10', available: true, version: 'WMT-v0.1',
    desc: '化合並取兩經本穴、互合借氣調經，同一病經並列對照卡' },
  { id: 'merge',       name: '綜合計算', engine: 'ENG-11', available: false, version: 'MERGE-v0.0',
    desc: '多方法對照與結果比較' }
];

const DATA_VERSION = 'DATA-v1.0';

function meridianByName(name) {
  return MERIDIANS.find(m => m.name === name) || null;
}
function meridiansByElement(el) {
  return MERIDIANS.filter(m => m.element === el);
}
