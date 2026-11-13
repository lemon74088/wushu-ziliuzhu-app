/* 記錄層 ENG-13：IndexedDB 追加寫入，新記錄不覆蓋舊記錄；無 IDB 時退記憶體陣列 */

const History = (() => {
  const DB_NAME = 'wushu-v1';
  const STORE = 'records';
  let db = null;
  let memory = [];
  let useMemory = false;

  function open() {
    return new Promise(resolve => {
      if (!window.indexedDB) { useMemory = true; return resolve(); }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORE)) {
          d.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        }
      };
      req.onsuccess = () => { db = req.result; resolve(); };
      req.onerror = () => { useMemory = true; resolve(); };
    });
  }

  function tx(mode, fn) {
    return new Promise((resolve, reject) => {
      if (useMemory) return resolve(fn(null));
      const t = db.transaction(STORE, mode);
      const s = t.objectStore(STORE);
      const out = fn(s);
      t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : null);
      t.onerror = () => reject(t.error);
    });
  }

  async function add(record) {
    const rec = { createdAt: new Date().toISOString(), ...record };
    if (useMemory) { memory.unshift(rec); return rec; }
    await tx('readwrite', s => s.add(rec));
    return rec;
  }

  async function all() {
    if (useMemory) return [...memory];
    return tx('readonly', s => s.getAll());
  }

  return { init: open, add, all };
})();
