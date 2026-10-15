/* ブレインロット・アーケード 共通エンジン
 * 各ゲームは BR.register(id, { howto, init(S,B,W,H), update(S,dt,I,B), draw(S,g,W,H,B) }) を登録する。
 *   S : ゲーム状態。エンジンが score / over / msg / t を管理する
 *   I : 入力。I.dx, I.dy（矢印・WASD）/ I.held(code..) / I.tap(code..) / I.action() / I.ptr / I.chars
 *   over を true にするとゲームオーバー。msg を入れると見出しになる
 */
(function (global) {
  'use strict';
  const W = 800, H = 500;
  const FONT = '"Hiragino Sans","Yu Gothic UI","Noto Sans JP","Meiryo",sans-serif';
  const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const logics = {};
  const down = Object.create(null);
  const tapped = Object.create(null);
  const ptr = { x: W / 2, y: H / 2, down: false, clicked: false };

  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rectHit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const circHit = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) { const j = randi(0, i); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  };
  const text = (g, s, x, y, size = 20, color = '#fff', align = 'left', weight = '') => {
    g.font = `${weight} ${size}px ${FONT}`;
    g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
    g.fillText(s, x, y);
  };
  const emoji = (g, s, x, y, size = 32) => {
    g.font = `${size}px ${EMOJI}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#fff';
    g.fillText(s, x, y);
  };
  const box = (g, x, y, w, h, fill, r = 10) => {
    g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill();
  };
  const bestOf = (id) => {
    try { return Number(localStorage.getItem('brBest-' + id)) || 0; } catch (e) { return 0; }
  };
  const saveBest = (id, score) => {
    try { if (score > bestOf(id)) localStorage.setItem('brBest-' + id, String(score)); } catch (e) { /* 保存できない環境では無視 */ }
  };

  const I = {
    dx: 0, dy: 0, ptr, chars: [],
    held: (...c) => c.some((k) => down[k]),
    tap: (...c) => c.some((k) => tapped[k]),
    action: () => I.tap('Space', 'Enter') || ptr.clicked,
  };

  const BR = {
    W, H, FONT, rand, randi, pick, clamp, rectHit, circHit, shuffle, text, emoji, box, bestOf, saveBest,
    register(id, logic) { logics[id] = logic; },
  };

  function mount(canvas, id) {
    const logic = logics[id];
    const meta = (global.BR_MANIFEST || []).find((m) => m.id === id) || { title: id, genre: '' };
    canvas.width = W; canvas.height = H;
    const g = canvas.getContext('2d');
    const S = {};
    let phase = 'title', paused = false, last = performance.now();
    let bestScore = bestOf(id);

    const reset = () => {
      for (const k of Object.keys(S)) delete S[k];
      S.score = 0; S.over = false; S.t = 0; S.msg = '';
      logic.init(S, BR, W, H);
      phase = 'play'; paused = false;
    };
    const toLogical = (p) => {
      const r = canvas.getBoundingClientRect();
      return { x: (p.clientX - r.left) * W / r.width, y: (p.clientY - r.top) * H / r.height };
    };
    const setPtr = (p) => Object.assign(ptr, toLogical(p));

    // 全リスナーを1つの AbortController で管理し、destroy() で一括解除する
    const ac = new AbortController();
    const sig = { signal: ac.signal };
    canvas.addEventListener('mousemove', (e) => setPtr(e), sig);
    canvas.addEventListener('mousedown', (e) => { setPtr(e); ptr.down = true; ptr.clicked = true; }, sig);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault(); setPtr(e.touches[0]); ptr.down = true; ptr.clicked = true;
    }, { passive: false, signal: ac.signal });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); setPtr(e.touches[0]); }, { passive: false, signal: ac.signal });
    window.addEventListener('mouseup', () => { ptr.down = false; }, sig);
    window.addEventListener('touchend', () => { ptr.down = false; }, sig);
    window.addEventListener('keydown', (e) => {
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
      if (!down[e.code]) tapped[e.code] = true;
      down[e.code] = true;
      if (e.key.length === 1) I.chars.push(e.key);
      else if (e.code === 'Backspace') I.chars.push('\b');
    }, sig);
    window.addEventListener('keyup', (e) => { down[e.code] = false; }, sig);

    const drawTitle = () => {
      const grd = g.createLinearGradient(0, 0, W, H);
      grd.addColorStop(0, '#2b1055'); grd.addColorStop(1, '#0d1020');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      text(g, meta.title, W / 2, 120, 40, '#ffe066', 'center', '800');
      text(g, meta.genre || '', W / 2, 170, 20, '#9ad', 'center');
      (logic.howto || '').split('\n').forEach((line, i) => text(g, line, W / 2, 250 + i * 32, 19, '#eee', 'center'));
      text(g, 'Space / クリック でスタート', W / 2, 400, 24, '#fff', 'center', 'bold');
      text(g, 'Pキー: 一時停止　Rキー: やり直し', W / 2, 440, 15, '#aaa', 'center');
    };
    const hud = () => {
      text(g, `SCORE ${S.score}`, 14, 18, 18, '#fff', 'left', 'bold');
      text(g, `BEST ${bestScore}`, W - 14, 18, 18, '#ffe066', 'right', 'bold');
    };
    const dim = (title, sub, sub2) => {
      g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 0, W, H);
      text(g, title, W / 2, H / 2 - 40, 46, '#fff', 'center', '800');
      if (sub) text(g, sub, W / 2, H / 2 + 12, 22, '#ffe066', 'center', 'bold');
      if (sub2) text(g, sub2, W / 2, H / 2 + 52, 17, '#ddd', 'center');
    };

    let alive = true;
    const frame = (now) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      I.dx = (I.held('ArrowRight', 'KeyD') ? 1 : 0) - (I.held('ArrowLeft', 'KeyA') ? 1 : 0);
      I.dy = (I.held('ArrowDown', 'KeyS') ? 1 : 0) - (I.held('ArrowUp', 'KeyW') ? 1 : 0);

      if (phase === 'title') {
        if (I.action()) reset();
      } else if (I.tap('KeyR')) {
        reset();
      } else if (phase === 'over') {
        if (I.action()) reset();
      } else {
        if (I.tap('KeyP')) paused = !paused;
        if (!paused) {
          S.t += dt;
          logic.update(S, dt, I, BR);
          if (S.over) {
            phase = 'over';
            saveBest(id, S.score);
            bestScore = bestOf(id);
          }
        }
      }

      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#0d1020'; g.fillRect(0, 0, W, H);
      if (phase === 'title') {
        drawTitle();
      } else {
        logic.draw(S, g, W, H, BR);
        hud();
        if (phase === 'over') dim(S.msg || 'GAME OVER', `SCORE ${S.score}　BEST ${bestScore}`, 'Space / クリックでリトライ（Rキーでも可）');
        else if (paused) dim('一時停止', 'Pキーで再開', 'Rキーでやり直し');
      }
      ptr.clicked = false;
      for (const k of Object.keys(tapped)) delete tapped[k];
      I.chars.length = 0;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return function destroy() {
      alive = false;
      ac.abort();
      for (const k of Object.keys(down)) delete down[k];
      for (const k of Object.keys(tapped)) delete tapped[k];
      I.chars.length = 0;
    };
  }

  BR.mount = mount;
  global.BR = BR;
})(window);
