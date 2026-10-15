(() => {
  const COLS = 12, ROWS = 8, CELL = 50, MINES = 14;
  const OX = (800 - COLS * CELL) / 2, OY = 60;
  const NUM_COLORS = ['', '#4dabf7', '#51cf66', '#ff6b6b', '#845ef7', '#ff922b', '#22b8cf', '#ffffff', '#adb5bd'];

  const idx = (c, r) => r * COLS + c;
  const neighbors = (c, r) => {
    const out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nc = c + dc, nr = r + dr;
      if (nc >= 0 && nr >= 0 && nc < COLS && nr < ROWS) out.push(idx(nc, nr));
    }
    return out;
  };

  BR.register('minesweeper', {
    howto: 'クリックでマスを開く。Fキーで旗モードに切り替え（旗を立てる / 外す）\n地雷（💣）以外のマスを全部開けばクリア',
    init(S) {
      S.mine = null; S.adj = []; S.open = Array(COLS * ROWS).fill(false);
      S.flag = Array(COLS * ROWS).fill(false); S.flagMode = false; S.safeLeft = COLS * ROWS - MINES;
      S.lost = false;
    },
    update(S, dt, I, B) {
      if (I.tap('KeyF')) S.flagMode = !S.flagMode;
      if (!I.ptr.clicked) return;
      if (I.ptr.x < OX || I.ptr.y < OY) return;
      const c = Math.floor((I.ptr.x - OX) / CELL), r = Math.floor((I.ptr.y - OY) / CELL);
      if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return;
      const i = idx(c, r);

      if (S.flagMode || S.flag[i] && !S.open[i]) {
        if (!S.open[i]) S.flag[i] = !S.flag[i];
        return;
      }
      if (S.open[i] || S.flag[i]) return;

      if (!S.mine) placeMines(S, c, r, B);
      reveal(S, i);
      if (S.open[i] && S.mine[i]) { lose(S); return; }
      if (S.safeLeft === 0) {
        S.over = true; S.msg = 'CLEAR!';
        S.score = Math.max(0, 1000 - Math.floor(S.t) * 5);
      }
    },
    draw(S, g, W, H, B) {
      B.text(g, `💣 ${MINES - S.flag.filter(Boolean).length}　${S.flagMode ? '🚩旗モード（Fで切替）' : '開くモード（Fで切替）'}`, W / 2, 30, 18, '#fff', 'center', 'bold');
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const i = idx(c, r);
        const x = OX + c * CELL, y = OY + r * CELL;
        if (S.open[i]) {
          B.box(g, x + 1, y + 1, CELL - 2, CELL - 2, '#2a2f4a', 4);
          if (S.mine && S.mine[i]) B.emoji(g, '💣', x + CELL / 2, y + CELL / 2, 26);
          else if (S.adj[i]) B.text(g, String(S.adj[i]), x + CELL / 2, y + CELL / 2 + 1, 24, NUM_COLORS[S.adj[i]], 'center', '800');
        } else {
          B.box(g, x + 1, y + 1, CELL - 2, CELL - 2, '#4a5580', 4);
          if (S.flag[i]) B.emoji(g, '🚩', x + CELL / 2, y + CELL / 2, 26);
        }
      }
    },
  });

  function placeMines(S, sc, sr, B) {
    const safe = new Set([idx(sc, sr), ...neighbors(sc, sr)]);
    S.mine = Array(COLS * ROWS).fill(false);
    let placed = 0;
    while (placed < MINES) {
      const i = B.randi(0, COLS * ROWS - 1);
      if (S.mine[i] || safe.has(i)) continue;
      S.mine[i] = true; placed++;
    }
    S.adj = Array(COLS * ROWS).fill(0);
    for (let i = 0; i < COLS * ROWS; i++) {
      const c = i % COLS, r = Math.floor(i / COLS);
      S.adj[i] = neighbors(c, r).filter((n) => S.mine[n]).length;
    }
  }

  function reveal(S, start) {
    const stack = [start];
    while (stack.length) {
      const i = stack.pop();
      if (S.open[i] || S.flag[i]) continue;
      S.open[i] = true;
      if (!S.mine[i]) {
        S.safeLeft--;
        S.score += 10;
      }
      if (!S.mine[i] && S.adj[i] === 0) {
        const c = i % COLS, r = Math.floor(i / COLS);
        neighbors(c, r).forEach((n) => { if (!S.open[n]) stack.push(n); });
      }
    }
  }

  function lose(S) {
    S.mine.forEach((m, i) => { if (m) S.open[i] = true; });
    S.over = true; S.msg = 'BOOM!';
  }
})();
