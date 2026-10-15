(() => {
  const TILE = 48;
  const LEVELS = [
    [
      '#######',
      '#.....#',
      '#.@$*.#',
      '#.....#',
      '#######',
    ],
    [
      '########',
      '#......#',
      '#.$..*.#',
      '#..@...#',
      '########',
    ],
  ];

  function parse(rows) {
    const S = { walls: new Set(), boxes: new Set(), targets: new Set(), p: null, cols: rows[0].length, rows: rows.length };
    rows.forEach((row, r) => [...row].forEach((ch, c) => {
      const k = c + ',' + r;
      if (ch === '#') S.walls.add(k);
      if (ch === '$') S.boxes.add(k);
      if (ch === '*') S.targets.add(k);
      if (ch === '@') S.p = { c, r };
    }));
    return S;
  }

  BR.register('sokoban-box', {
    howto: '矢印 / WASD で📦を押して、すべて📍（目標）の上に置こう\n箱は引けない。詰まったらRキーでやり直し',
    init(S) {
      S.level = 0; S.moves = 0; S.cleared = 0;
      load(S);
    },
    update(S, dt, I) {
      let d = null;
      if (I.tap('ArrowLeft', 'KeyA')) d = { c: -1, r: 0 };
      else if (I.tap('ArrowRight', 'KeyD')) d = { c: 1, r: 0 };
      else if (I.tap('ArrowUp', 'KeyW')) d = { c: 0, r: -1 };
      else if (I.tap('ArrowDown', 'KeyS')) d = { c: 0, r: 1 };
      if (!d) return;

      const key = (c, r) => c + ',' + r;
      const nx = S.p.c + d.c, ny = S.p.r + d.r;
      if (S.walls.has(key(nx, ny))) return;
      if (S.boxes.has(key(nx, ny))) {
        const bx = nx + d.c, by = ny + d.r;
        if (S.walls.has(key(bx, by)) || S.boxes.has(key(bx, by))) return;
        S.boxes.delete(key(nx, ny));
        S.boxes.add(key(bx, by));
      }
      S.p = { c: nx, r: ny };
      S.moves++;

      if ([...S.boxes].every((b) => S.targets.has(b))) {
        S.cleared++;
        S.score += 1000 + Math.max(0, 100 - S.moves * 2);
        if (S.level + 1 < LEVELS.length) {
          S.level++;
          S.moves = 0;
          load(S);
        } else {
          S.over = true; S.msg = 'ALL CLEAR!';
        }
      }
    },
    draw(S, g, W, H, B) {
      const ox = (W - S.cols * TILE) / 2, oy = (H - S.rows * TILE) / 2 + 10;
      g.fillStyle = '#2b2118'; g.fillRect(0, 0, W, H);
      for (let r = 0; r < S.rows; r++) for (let c = 0; c < S.cols; c++) {
        const k = c + ',' + r;
        const x = ox + c * TILE, y = oy + r * TILE;
        if (S.walls.has(k)) { B.box(g, x, y, TILE, TILE, '#5c4a3a', 6); continue; }
        B.box(g, x + 1, y + 1, TILE - 2, TILE - 2, '#e7d7b5', 4);
        if (S.targets.has(k)) B.emoji(g, '📍', x + TILE / 2, y + TILE / 2, 30);
        if (S.boxes.has(k)) B.emoji(g, '📦', x + TILE / 2, y + TILE / 2, 36);
      }
      B.emoji(g, '🪵', ox + S.p.c * TILE + TILE / 2, oy + S.p.r * TILE + TILE / 2, 38);
      B.text(g, `LEVEL ${S.level + 1} / ${LEVELS.length}　手数 ${S.moves}`, W / 2, oy - 18, 18, '#fff', 'center', 'bold');
    },
  });

  function load(S) {
    const P = parse(LEVELS[S.level]);
    Object.assign(S, P);
  }
})();
