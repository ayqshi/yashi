/* md: small, safe Markdown → HTML. Escapes all HTML first, then adds headings, emphasis,
   code (inline and fenced), links (http/https/mailto only), lists, quotes, tables and rules. */
(function (root) {
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function inline(s) {
    return s.replace(/`([^`]+)`/g, (m, c) => '<code>' + c + '</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/\[([^\]]+)\]\(((?:https?:|mailto:)[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
  }
  function md(src) {
    const lines = esc(String(src).replace(/\r/g, '')).split('\n'), out = [];
    for (let i = 0; i < lines.length; i++) {
      let l = lines[i];
      if (/^```/.test(l)) { const lang = l.slice(3).trim(), buf = []; while (++i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i]); out.push('<pre><code' + (lang ? ' class="language-' + lang + '"' : '') + '>' + buf.join('\n') + '</code></pre>'); continue; }
      let m;
      if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { out.push('<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'); continue; }
      if (/^(-{3,}|\*{3,})\s*$/.test(l)) { out.push('<hr>'); continue; }
      if (/^&gt;\s?/.test(l)) { const buf = []; while (i < lines.length && /^&gt;\s?/.test(lines[i])) buf.push(lines[i++].replace(/^&gt;\s?/, '')); i--; out.push('<blockquote>' + inline(buf.join('<br>')) + '</blockquote>'); continue; }
      if (/^\|.*\|\s*$/.test(l) && /^\|?\s*:?-{3,}/.test(lines[i + 1] || '')) { const row = r => r.replace(/^\||\|\s*$/g, '').split('|').map(c => c.trim()); const head = row(l); i++; const body = []; while (++i < lines.length && /^\|.*\|\s*$/.test(lines[i])) body.push(row(lines[i])); i--; out.push('<table><thead><tr>' + head.map(h => '<th>' + inline(h) + '</th>').join('') + '</tr></thead><tbody>' + body.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>'); continue; }
      if ((m = l.match(/^(\s*)([-*+]|\d+[.)])\s+/))) { const ordered = /\d/.test(m[2]), tag = ordered ? 'ol' : 'ul', buf = []; while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) buf.push('<li>' + inline(lines[i++].replace(/^\s*([-*+]|\d+[.)])\s+/, '')) + '</li>'); i--; out.push('<' + tag + '>' + buf.join('') + '</' + tag + '>'); continue; }
      if (!l.trim()) continue;
      const buf = [l]; while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|```|&gt;|\s*([-*+]|\d+[.)])\s|\|)/.test(lines[i + 1])) buf.push(lines[++i]);
      out.push('<p>' + inline(buf.join('<br>')) + '</p>');
    }
    return out.join('\n');
  }
  if (typeof module === 'object' && module.exports) module.exports = md; else root.md = md;
})(typeof self !== 'undefined' ? self : globalThis);
