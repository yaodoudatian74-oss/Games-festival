(() => {
  const N = 4, CELL = 96, GAP = 10;
  const OX = (800 - (N * CELL + (N + 1) * GAP)) / 2, OY = 70;
  const COLORS = {
    0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f',
    64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
  };

  BR.register('game-2048', {
    howto: '矢印 / WASD で全てのタイルを同じ方向にスライド\n同じ数字がぶつかると合体して2倍に。2048を作るとクリア',
    init(S, B) {
      S.g = Array.from({ length: N }, () => Array(N).fill(0));
      addTile(S.g, B); addTile(S.g, B);
      S.fresh = null;
    },
    update(S, dt, I, B) {
      let d = null;
      if (I.tap('ArrowLeft', 'KeyA')) d = 'L';
      else if (I.tap('ArrowRight', 'KeyD')) d = 'R';
      else if (I.tap('ArrowUp', 'KeyW')) d = 'U';
      else if (I.tap('ArrowDown', 'KeyS')) d = 'D';
      if (!d) return;

      const { grid, gained, moved } = slide(S.g, d);
      if (!moved) return;
      S.g = grid;
      S.score += gained;
      addTile(S.g, B);
      if (S.g.some((row) => row.includes(2048))) { S.over = true; S.msg = 'YOU WIN!'; return; }
      if (!canMove(S.g)) { S.over = true; S.msg = 'GAME OVER'; }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#bbada0';
      g.fillRect(OX, OY, N * CELL + (N + 1) * GAP, N * CELL + (N + 1) * GAP);
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const v = S.g[r][c];
        const x = OX + GAP + c * (CELL + GAP), y = OY + GAP + r * (CELL + GAP);
        B.box(g, x, y, CELL, CELL, COLORS[v] || '#3c3a32', 8);
        if (v) {
          const size = v >= 1024 ? 30 : v >= 128 ? 36 : 44;
          B.text(g, String(v), x + CELL / 2, y + CELL / 2 + 2, size, v <= 4 ? '#776e65' : '#f9f6f2', 'center', 'bold');
        }
      }
    },
  });

  function addTile(grid, B) {
    const empty = [];
    grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
    if (!empty.length) return;
    const [r, c] = B.pick(empty);
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  // 方向ごとに「移動先から見た」行の座標列を作り、その順に詰める
  function slide(grid, d) {
    const next = grid.map((row) => row.slice());
    let gained = 0, moved = false;
    for (let i = 0; i < N; i++) {
      const coords = [];
      for (let k = 0; k < N; k++) {
        if (d === 'L') coords.push([i, k]);
        if (d === 'R') coords.push([i, N - 1 - k]);
        if (d === 'U') coords.push([k, i]);
        if (d === 'D') coords.push([N - 1 - k, i]);
      }
      const vals = coords.map(([r, c]) => next[r][c]).filter((v) => v);
      const out = [];
      for (let k = 0; k < vals.length; k++) {
        if (vals[k] && vals[k] === vals[k + 1]) {
          out.push(vals[k] * 2); gained += vals[k] * 2; k++;
        } else {
          out.push(vals[k]);
        }
      }
      while (out.length < N) out.push(0);
      coords.forEach(([r, c], k) => {
        if (next[r][c] !== out[k]) moved = true;
        next[r][c] = out[k];
      });
    }
    return { grid: next, gained, moved };
  }

  function canMove(grid) {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const v = grid[r][c];
      if (!v) return true;
      if (c + 1 < N && grid[r][c + 1] === v) return true;
      if (r + 1 < N && grid[r + 1][c] === v) return true;
    }
    return false;
  }
})();
