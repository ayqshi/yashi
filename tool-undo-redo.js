/* history: undo/redo for any state, with merging of rapid edits (typing) and a size limit.
   const h = createHistory(initial); h.push(next); h.undo(); h.redo(); h.on(state => render(state)); */
(function (root) {
  function createHistory(initial, { limit = 100, mergeMs = 600 } = {}) {
    let past = [], future = [], present = initial, lastPush = 0, lastKey = null;
    const subs = new Set(), emit = () => subs.forEach(f => f(present));
    return {
      get state() { return present; },
      push(next, key) {
        const now = Date.now();
        if (key != null && key === lastKey && now - lastPush < mergeMs) present = next;
        else { past.push(present); if (past.length > limit) past.shift(); present = next; }
        future = []; lastPush = now; lastKey = key; emit();
      },
      undo() { if (!past.length) return false; future.push(present); present = past.pop(); lastKey = null; emit(); return true; },
      redo() { if (!future.length) return false; past.push(present); present = future.pop(); lastKey = null; emit(); return true; },
      canUndo: () => past.length > 0, canRedo: () => future.length > 0,
      reset(s) { past = []; future = []; present = s; emit(); },
      on(f) { subs.add(f); return () => subs.delete(f); },
      bindKeys(target = root) { const h = this; target.addEventListener('keydown', e => { if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return; e.preventDefault(); e.shiftKey ? h.redo() : h.undo(); }); return this; }
    };
  }
  if (typeof module === 'object' && module.exports) module.exports = createHistory; else root.createHistory = createHistory;
})(typeof self !== 'undefined' ? self : globalThis);
