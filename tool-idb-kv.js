/* kv: a tiny promise-based key-value store on IndexedDB, with a memory fallback
   (private windows, old Safari). await kv.set('k', {a: 1}); await kv.get('k'); await kv.keys(); */
(function (root) {
  const DB = 'kv', STORE = 'kv', memory = new Map();
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      if (typeof indexedDB === 'undefined') return rej(new Error('no IndexedDB'));
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }).catch(e => { dbp = null; throw e; });
    return dbp;
  }
  async function run(mode, fn) {
    try {
      const db = await open();
      return await new Promise((res, rej) => { const tx = db.transaction(STORE, mode), st = tx.objectStore(STORE), req = fn(st); tx.oncomplete = () => res(req && req.result); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
    } catch (e) { return undefined; }
  }
  const kv = {
    async get(k) { const v = await run('readonly', s => s.get(k)); return v === undefined ? memory.get(k) : v; },
    async set(k, v) { memory.set(k, v); await run('readwrite', s => s.put(v, k)); return v; },
    async del(k) { memory.delete(k); await run('readwrite', s => s.delete(k)); },
    async keys() { const ks = await run('readonly', s => s.getAllKeys()); return ks || [...memory.keys()]; },
    async clear() { memory.clear(); await run('readwrite', s => s.clear()); }
  };
  if (typeof module === 'object' && module.exports) module.exports = kv; else root.kv = kv;
})(typeof self !== 'undefined' ? self : globalThis);
