/* fuzzy: rank items by how well a query matches, typo-tolerant, with highlight ranges.
   fuzzy.search(items, 'pmdro', { key: x => x.title }) → [{ item, score, ranges }] */
(function (root) {
  function score(text, q) {
    const t = text.toLowerCase(), s = q.toLowerCase().trim();
    if (!s) return { score: 0, ranges: [] };
    const i = t.indexOf(s);
    if (i >= 0) return { score: 100 - i * 0.5 + (i === 0 || /\W/.test(t[i - 1]) ? 20 : 0), ranges: [[i, i + s.length]] };
    let ti = 0, sc = 0, run = 0, ranges = [], start = -1;
    for (const ch of s) {
      const j = t.indexOf(ch, ti);
      if (j < 0) return typo(t, s);
      if (j === ti && start >= 0) { run++; sc += 2 + run; } else { if (start >= 0) ranges.push([start, ti]); start = j; run = 0; sc += 1; }
      if (j === 0 || /\W/.test(t[j - 1])) sc += 3;
      ti = j + 1;
    }
    ranges.push([start, ti]);
    return { score: sc - (t.length - s.length) * 0.05, ranges };
  }
  function lev(a, b) { const d = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const tmp = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = tmp; } } return d[b.length]; }
  function typo(t, s) { const words = t.split(/\W+/); let best = Infinity; for (const w of words) best = Math.min(best, lev(w.slice(0, s.length + 1), s)); return best <= Math.max(1, Math.floor(s.length / 4)) ? { score: 10 - best * 3, ranges: [] } : { score: -Infinity, ranges: [] }; }
  function search(items, q, { key = x => String(x), limit = 50 } = {}) {
    return items.map(item => ({ item, ...score(key(item), q) })).filter(r => r.score > -Infinity).sort((a, b) => b.score - a.score).slice(0, limit);
  }
  function highlight(text, ranges, open = '<mark>', close = '</mark>') { let out = '', at = 0; for (const [a, b] of ranges) { out += text.slice(at, a) + open + text.slice(a, b) + close; at = b; } return out + text.slice(at); }
  const fuzzy = { score, search, highlight };
  if (typeof module === 'object' && module.exports) module.exports = fuzzy; else root.fuzzy = fuzzy;
})(typeof self !== 'undefined' ? self : globalThis);
