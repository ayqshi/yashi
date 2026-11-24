/* color: conversions, WCAG contrast, readable text colour, mixing, and seeded palettes
   that skip purple. color.palette('my app') → { bg, panel, line, text, muted, accent, accent2 } */
(function (root) {
  const hexToRgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  function rgbToHsl([r, g, b]) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; if (mx === mn) return [0, 0, l * 100]; const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h * 60, s * 100, l * 100]; }
  function hslToRgb([h, s, l]) { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0) * 255, f(8) * 255, f(4) * 255]; }
  const lum = rgb => { const [r, g, b] = rgb.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  const contrast = (a, b) => { const x = lum(hexToRgb(a)), y = lum(hexToRgb(b)); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const readableOn = bg => contrast(bg, '#ffffff') >= contrast(bg, '#0b0b0d') ? '#ffffff' : '#0b0b0d';
  const mix = (a, b, t = .5) => { const x = hexToRgb(a), y = hexToRgb(b); return rgbToHex(x.map((v, i) => v + (y[i] - v) * t)); };
  const hsl = (h, s, l) => rgbToHex(hslToRgb([h, s, l]));
  function seed(str) { let h = 2166136261; for (const c of String(str)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ h >>> 15, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
  function palette(name, { light = false } = {}) {
    const r = seed(name); let hue = r() * 360; if (hue > 250 && hue < 320) hue = (hue + 90) % 360;
    const sat = 45 + r() * 35, hue2 = (hue + (r() < .5 ? 30 : -150) + 360) % 360;
    const p = light
      ? { bg: hsl(hue, 18, 97), panel: '#ffffff', line: hsl(hue, 14, 86), text: hsl(hue, 18, 10), muted: hsl(hue, 8, 42), accent: hsl(hue, sat, 38), accent2: hsl(hue2, sat * .8, 40) }
      : { bg: hsl(hue, 14, 5), panel: hsl(hue, 12, 9), line: hsl(hue, 10, 18), text: hsl(hue, 20, 94), muted: hsl(hue, 8, 62), accent: hsl(hue, sat, 62), accent2: hsl(hue2, sat * .8, 60) };
    while (contrast(p.text, p.bg) < 7) p.text = light ? mix(p.text, '#000000', .3) : mix(p.text, '#ffffff', .3);
    p.onAccent = readableOn(p.accent);
    return p;
  }
  const color = { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, contrast, readableOn, mix, palette };
  if (typeof module === 'object' && module.exports) module.exports = color; else root.color = color;
})(typeof self !== 'undefined' ? self : globalThis);
