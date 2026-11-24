/* csv: RFC 4180 parse and stringify — quoted fields, embedded commas, quotes and newlines.
   csv.parse(text, { header: true }) → array of objects; csv.stringify(rows) → text */
(function (root) {
  function parse(text, { header = false, delimiter } = {}) {
    const d = delimiter || (/\t/.test(text.split('\n')[0]) && !/,/.test(text.split('\n')[0]) ? '\t' : text.split('\n')[0].split(';').length > text.split('\n')[0].split(',').length ? ';' : ',');
    const rows = []; let row = [], f = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
      if (c === '"' && f === '') q = true;
      else if (c === d) { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    const clean = rows.filter(r => r.length > 1 || r[0] !== '');
    if (!header) return clean;
    const [h, ...rest] = clean;
    return rest.map(r => Object.fromEntries(h.map((k, i) => [k, num(r[i])])));
  }
  const num = v => v !== undefined && v !== '' && !isNaN(v) && !/^0\d/.test(v) ? +v : v;
  function stringify(rows, { delimiter = ',', columns } = {}) {
    if (!rows.length) return '';
    const objs = !Array.isArray(rows[0]), cols = columns || (objs ? [...new Set(rows.flatMap(Object.keys))] : null);
    const cell = v => { const s = v == null ? '' : String(v); return /["\n\r]/.test(s) || s.includes(delimiter) || /^\s|\s$/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = objs ? [cols.map(cell).join(delimiter), ...rows.map(r => cols.map(c => cell(r[c])).join(delimiter))] : rows.map(r => r.map(cell).join(delimiter));
    return lines.join('\r\n') + '\r\n';
  }
  const csv = { parse, stringify };
  if (typeof module === 'object' && module.exports) module.exports = csv; else root.csv = csv;
})(typeof self !== 'undefined' ? self : globalThis);
