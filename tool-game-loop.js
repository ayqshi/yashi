/* gameLoop: a fixed-timestep canvas loop for DOMless games — DPR-aware resize, keyboard,
   mouse/touch pointer, swipe detection, pause on blur, and a draw callback with interpolation.
   gameLoop(canvas, { update(dt, input) {}, draw(ctx, alpha, size) {} }) */
(function (root) {
  function gameLoop(canvas, { update, draw, step = 1 / 120, maxDpr = 2 } = {}) {
    const ctx = canvas.getContext('2d'), size = { w: 0, h: 0, dpr: 1 };
    const input = { keys: new Set(), pressed: new Set(), pointer: { x: 0, y: 0, down: false }, swipe: null };
    function fit() { size.dpr = Math.min(maxDpr, root.devicePixelRatio || 1); const r = canvas.getBoundingClientRect(); size.w = r.width; size.h = r.height; canvas.width = Math.round(r.width * size.dpr); canvas.height = Math.round(r.height * size.dpr); ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0); }
    root.addEventListener('resize', fit); fit();
    root.addEventListener('keydown', e => { if (!input.keys.has(e.code)) input.pressed.add(e.code); input.keys.add(e.code); if (/^(Arrow|Space)/.test(e.code)) e.preventDefault(); });
    root.addEventListener('keyup', e => input.keys.delete(e.code));
    let sx = 0, sy = 0;
    const pos = e => { const r = canvas.getBoundingClientRect(); input.pointer.x = e.clientX - r.left; input.pointer.y = e.clientY - r.top; };
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', e => { pos(e); input.pointer.down = true; input.pressed.add('Pointer'); sx = e.clientX; sy = e.clientY; });
    canvas.addEventListener('pointermove', pos);
    root.addEventListener('pointerup', e => { input.pointer.down = false; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.hypot(dx, dy) > 30) input.swipe = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); });
    let paused = false, acc = 0, last = performance.now(), raf = 0;
    root.addEventListener('blur', () => { paused = true; });
    root.addEventListener('focus', () => { paused = false; last = performance.now(); });
    function frame(now) {
      const dt = Math.min(.1, (now - last) / 1000); last = now;
      if (!paused) { acc += dt; while (acc >= step) { update(step, input); input.pressed.clear(); input.swipe = null; acc -= step; } }
      draw(ctx, acc / step, size);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { stop: () => cancelAnimationFrame(raf), pause: () => { paused = true; }, resume: () => { paused = false; last = performance.now(); }, input, size };
  }
  if (typeof module === 'object' && module.exports) module.exports = gameLoop; else root.gameLoop = gameLoop;
})(typeof self !== 'undefined' ? self : globalThis);
