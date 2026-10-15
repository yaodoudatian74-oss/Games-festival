(() => {
  const COLS = 10, ROWS = 20, CELL = 24;
  const OX = 280, OY = 10;
  const PIECES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
  ];
  const COLORS = ['#38e8ff', '#ffe066', '#c77dff', '#ff9f1c', '#4cc9f0', '#80ed99', '#ff5c8a'];
  const rotate = (m) => m[0].map((_, c) => m.map((r) => r[c]).reverse());

  BR.register('odin-blocks', {
    howto: '← → で移動、↑ で回転、↓ で早落下、Space で即落下\n横一列を揃えて消そう。ラインを消すほどレベルアップ',
    init(S, B) {
      S.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      S.lines = 0; S.drop = 0; S.moveT = 0;
      S.next = newPiece(B);
      spawn(S, B);
    },
    update(S, dt, I, B) {
      const level = Math.floor(S.lines / 10) + 1;
      if (I.tap('ArrowLeft', 'KeyA') && !collide(S, S.cur.m, S.cur.x - 1, S.cur.y)) S.cur.x--;
      if (I.tap('ArrowRight', 'KeyD') && !collide(S, S.cur.m, S.cur.x + 1, S.cur.y)) S.cur.x++;
      if (I.tap('ArrowUp', 'KeyW')) {
        const r = rotate(S.cur.m);
        if (!collide(S, r, S.cur.x, S.cur.y)) S.cur.m = r;
      }
      S.moveT -= dt;
      if (I.held('ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD') && S.moveT <= 0) {
        const dx = I.held('ArrowLeft', 'KeyA') ? -1 : 1;
        if (!collide(S, S.cur.m, S.cur.x + dx, S.cur.y)) S.cur.x += dx;
        S.moveT = 0.09;
      }

      const interval = Math.max(0.05, 0.6 - (level - 1) * 0.06);
      const soft = I.held('ArrowDown', 'KeyS');
      if (I.tap('Space')) {
        while (!collide(S, S.cur.m, S.cur.x, S.cur.y + 1)) { S.cur.y++; S.score += 2; }
        lock(S, B);
        return;
      }
      S.drop += dt * (soft ? 12 : 1);
      if (S.drop >= interval) {
        S.drop = 0;
        if (!collide(S, S.cur.m, S.cur.x, S.cur.y + 1)) S.cur.y++;
        else lock(S, B);
      }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#0a0e1f'; g.fillRect(OX - 4, OY - 4, COLS * CELL + 8, ROWS * CELL + 8);
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const v = S.grid[r][c];
        if (v) B.box(g, OX + c * CELL + 1, OY + r * CELL + 1, CELL - 2, CELL - 2, COLORS[v - 1], 4);
      }
      if (S.cur) {
        S.cur.m.forEach((row, r) => row.forEach((v, c) => {
          if (v) B.box(g, OX + (S.cur.x + c) * CELL + 1, OY + (S.cur.y + r) * CELL + 1, CELL - 2, CELL - 2, S.cur.color, 4);
        }));
      }
      B.text(g, `LINES ${S.lines}`, 40, 60, 20, '#fff', 'left', 'bold');
      B.text(g, `LEVEL ${Math.floor(S.lines / 10) + 1}`, 40, 90, 20, '#ffe066', 'left', 'bold');
      B.text(g, 'NEXT', 600, 60, 18, '#9ad', 'left', 'bold');
      if (S.next) {
        S.next.m.forEach((row, r) => row.forEach((v, c) => {
          if (v) B.box(g, 600 + c * 22, 90 + r * 22, 20, 20, S.next.color, 4);
        }));
      }
    },
  });

  function newPiece(B) {
    const i = B.randi(0, PIECES.length - 1);
    return { m: PIECES[i].map((r) => r.slice()), color: COLORS[i] };
  }
  function spawn(S, B) {
    const p = S.next;
    S.next = newPiece(B);
    S.cur = { m: p.m, color: p.color, x: 3, y: 0 };
    if (collide(S, S.cur.m, S.cur.x, S.cur.y)) { S.over = true; S.msg = 'GAME OVER'; }
  }
  function collide(S, m, x, y) {
    for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const gx = x + c, gy = y + r;
      if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
      if (gy >= 0 && S.grid[gy][gx]) return true;
    }
    return false;
  }
  function lock(S, B) {
    const colorIdx = COLORS.indexOf(S.cur.color) + 1;
    S.cur.m.forEach((row, r) => row.forEach((v, c) => {
      const gy = S.cur.y + r;
      if (v && gy >= 0) S.grid[gy][S.cur.x + c] = colorIdx;
    }));
    let cleared = 0;
    S.grid = S.grid.filter((row) => {
      if (row.every((v) => v)) { cleared++; return false; }
      return true;
    });
    while (S.grid.length < ROWS) S.grid.unshift(Array(COLS).fill(0));
    if (cleared) {
      const level = Math.floor(S.lines / 10) + 1;
      S.score += [0, 100, 300, 500, 800][cleared] * level;
      S.lines += cleared;
    }
    spawn(S, B);
  }
})();
