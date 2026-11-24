/* store: a tiny reactive state store with selectors, batched notifications and optional
   localStorage persistence. const s = createStore({ count: 0 }, { persist: 'app' });
   s.subscribe(st => st.count, c => render(c)); s.set(st => ({ count: st.count + 1 })); */
(function (root) {
  function createStore(initial, { persist } = {}) {
    let state = initial;
    if (persist && root.localStorage) { try { const v = JSON.parse(localStorage.getItem(persist)); if (v && typeof v === 'object') state = Object.assign({}, initial, v); } catch (e) {} }
    const subs = new Set(); let queued = false;
    const flush = () => { queued = false; subs.forEach(s => { const v = s.sel(state); if (!Object.is(v, s.last)) { s.last = v; s.fn(v, state); } }); if (persist && root.localStorage) try { localStorage.setItem(persist, JSON.stringify(state)); } catch (e) {} };
    return {
      get: () => state,
      set(patch) { const next = typeof patch === 'function' ? patch(state) : patch; state = Object.assign({}, state, next); if (!queued) { queued = true; queueMicrotask(flush); } },
      subscribe(sel, fn) { const s = { sel: sel || (x => x), fn, last: undefined }; s.last = s.sel(state); subs.add(s); fn(s.last, state); return () => subs.delete(s); }
    };
  }
  if (typeof module === 'object' && module.exports) module.exports = createStore; else root.createStore = createStore;
})(typeof self !== 'undefined' ? self : globalThis);
