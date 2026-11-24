/* fetchCache: fetch JSON/text with a TTL cache, ETag revalidation, per-host pacing, retries,
   and an automatic CORS fallback through r.jina.ai. Works in browsers and Node 18+.
   const data = await fetchCache('https://api.github.com/repos/ayqshi/yashi', { ttl: 3600e3 }); */
(function (root) {
  const mem = new Map(), hosts = new Map(), inflight = new Map();
  const PACE = { 'nominatim.openstreetmap.org': 1100, 'overpass-api.de': 1100, 'musicbrainz.org': 1100, 'api.coingecko.com': 1500, 'r.jina.ai': 1000 };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function pace(host, gap) { const h = hosts.get(host) || 0, wait = Math.max(0, h - Date.now()); hosts.set(host, Math.max(Date.now(), h) + gap); if (wait) await sleep(wait); }
  async function fetchCache(url, opts = {}) {
    const { ttl = 600e3, as = 'auto', retries = 2, gap, jina = true, init = {} } = opts;
    const hit = mem.get(url);
    if (hit && Date.now() - hit.t < ttl) return hit.v;
    if (inflight.has(url)) return inflight.get(url);
    const job = (async () => {
      const host = new URL(url).hostname;
      let lastErr;
      for (let a = 0; a <= retries; a++) {
        await pace(host, gap ?? PACE[host] ?? 0);
        try {
          const headers = Object.assign({}, init.headers || {});
          if (hit && hit.etag) headers['If-None-Match'] = hit.etag;
          const r = await fetch(url, Object.assign({}, init, { headers }));
          if (r.status === 304 && hit) { hit.t = Date.now(); return hit.v; }
          if (r.status === 429 || r.status >= 500) throw Object.assign(new Error('HTTP ' + r.status), { retry: true });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const type = r.headers.get('content-type') || '';
          const v = as === 'text' ? await r.text() : as === 'json' || /json/.test(type) ? await r.json() : await r.text();
          mem.set(url, { t: Date.now(), v, etag: r.headers.get('etag') });
          return v;
        } catch (e) {
          lastErr = e;
          if (e instanceof TypeError && jina && !url.startsWith('https://r.jina.ai/')) {
            try { const v = await fetchCache('https://r.jina.ai/' + url, { ttl, as: 'text', retries: 0, jina: false }); mem.set(url, { t: Date.now(), v }); return v; } catch (e2) { lastErr = e2; }
          }
          if (a < retries) await sleep(400 * 2 ** a + Math.random() * 200);
        }
      }
      if (hit) return hit.v;
      throw lastErr;
    })();
    inflight.set(url, job);
    try { return await job; } finally { inflight.delete(url); }
  }
  fetchCache.clear = () => mem.clear();
  if (typeof module === 'object' && module.exports) module.exports = fetchCache; else root.fetchCache = fetchCache;
})(typeof self !== 'undefined' ? self : globalThis);
