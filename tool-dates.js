/* dates: relative time ("3 min ago", "in 2 days"), add and diff in whole days (DST-safe),
   start of week, ISO week number, and a small formatter. */
(function (root) {
  const DAY = 864e5;
  const utcDay = d => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const dates = {
    ago(d, now = new Date(), locale) {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }), s = (new Date(d) - now) / 1000, a = Math.abs(s);
      const [v, u] = a < 60 ? [s, 'second'] : a < 3600 ? [s / 60, 'minute'] : a < 86400 ? [s / 3600, 'hour'] : a < 604800 ? [s / 86400, 'day'] : a < 2629800 ? [s / 604800, 'week'] : a < 31557600 ? [s / 2629800, 'month'] : [s / 31557600, 'year'];
      return rtf.format(Math.round(v), u);
    },
    addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; },
    diffDays(a, b) { return Math.round((utcDay(new Date(b)) - utcDay(new Date(a))) / DAY); },
    startOfWeek(d, monday = true) { const x = new Date(d); const k = (x.getDay() + (monday ? 6 : 0)) % 7; x.setDate(x.getDate() - k); x.setHours(0, 0, 0, 0); return x; },
    isoWeek(d) { const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1)); return Math.ceil(((x - y0) / DAY + 1) / 7); },
    format(d, pattern = 'YYYY-MM-DD') { const x = new Date(d), p = n => String(n).padStart(2, '0'); return pattern.replace('YYYY', x.getFullYear()).replace('MM', p(x.getMonth() + 1)).replace('DD', p(x.getDate())).replace('HH', p(x.getHours())).replace('mm', p(x.getMinutes())); }
  };
  if (typeof module === 'object' && module.exports) module.exports = dates; else root.dates = dates;
})(typeof self !== 'undefined' ? self : globalThis);
