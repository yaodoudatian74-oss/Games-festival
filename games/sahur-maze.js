(() => {
  const COLS = 20, ROWS = 12, CELL = 40;
  const DIRS = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];

  // 偶数行・偶数列の格子点を柱にした迷路（通路は常につながる）
  const isWall = (c, r) => c === 0 || r === 0 || c === COLS - 1 || r === ROWS - 1
    || (r % 2 === 0 && c % 2 === 0);
  const open = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS && !isWall(c, r);

  BR.register('sahur-maze', {
    howto: '矢印 / WASD で🪵を操作し、通路の全ての🔸を食べよう\n🐊🐒🦈（追跡者）に触れるとゲームオーバー',
    init(S) {
      S.p = { c: 1, r: 1 }; S.dir = { x: 0, y: 0 }; S.want = { x: 0, y: 0 }; S.pt = 0;
      S.ghosts = [
        { c: 17, r: 1, dir: { x: -1, y: 0 }, t: 0, e: '🐊' },
        { c: 1, r: 9, dir: { x: 1, y: 0 }, t: 0, e: '🐒' },
        { c: 17, r: 9, dir: { x: -1, y: 0 }, t: 0, e: '🦈' },
      ];
      S.dots = new Set();
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (open(c, r) && !(c === 1 && r === 1)) S.dots.add(c + ',' + r);
      }
      S.dotCount = S.dots.size;
    },
    update(S, dt, I, B) {
      if (I.tap('ArrowLeft', 'KeyA')) S.want = { x: -1, y: 0 };
      if (I.tap('ArrowRight', 'KeyD')) S.want = { x: 1, y: 0 };
      if (I.tap('ArrowUp', 'KeyW')) S.want = { x: 0, y: -1 };
      if (I.tap('ArrowDown', 'KeyS')) S.want = { x: 0, y: 1 };

      S.pt += dt;
      if (S.pt >= 0.13) {
        S.pt -= 0.13;
        const tryDir = (d) => open(S.p.c + d.x, S.p.r + d.y);
        if (tryDir(S.want)) S.dir = S.want;
        if (tryDir(S.dir)) {
          S.p.c += S.dir.x; S.p.r += S.dir.y;
          const key = S.p.c + ',' + S.p.r;
          if (S.dots.has(key)) { S.dots.delete(key); S.score += 10; }
        }
      }

      for (const gh of S.ghosts) {
        gh.t += dt;
        if (gh.t < 0.2) continue;
        gh.t = 0;
        const opts = DIRS.filter((d) => open(gh.c + d.x, gh.r + d.y));
        const forward = opts.filter((d) => !(d.x === -gh.dir.x && d.y === -gh.dir.y));
        const pool = forward.length ? forward : opts;
        if (pool.length) gh.dir = B.pick(pool);
        gh.c += gh.dir.x; gh.r += gh.dir.y;
      }

      if (S.ghosts.some((gh) => gh.c === S.p.c && gh.r === S.p.r)) { S.over = true; S.msg = 'つかまった！'; return; }
      if (S.dots.size === 0) { S.over = true; S.msg = 'CLEAR!'; S.score += 500; }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#05070f'; g.fillRect(0, 0, W, H);
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (isWall(c, r)) B.box(g, c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4, '#2c3e9e', 8);
      }
      g.fillStyle = '#ffe066';
      for (const k of S.dots) {
        const [c, r] = k.split(',').map(Number);
        g.beginPath(); g.arc(c * CELL + 20, r * CELL + 20, 3.5, 0, Math.PI * 2); g.fill();
      }
      for (const gh of S.ghosts) B.emoji(g, gh.e, gh.c * CELL + 20, gh.r * CELL + 20, 32);
      B.emoji(g, '🪵', S.p.c * CELL + 20, S.p.r * CELL + 20, 34);
      B.text(g, `残りの🔸 ${S.dots.size} / ${S.dotCount}`, W / 2, 470, 16, '#fff', 'center', 'bold');
    },
  });
})();
