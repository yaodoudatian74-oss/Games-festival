(() => {
  const N = 4, CELL = 110, OX = (800 - N * CELL) / 2, OY = 60;
  const SOLVED = [...Array(15).keys()].map((i) => i + 1).concat([0]);

  BR.register('sliding-15', {
    howto: '数字タイルをクリック（または矢印キーで空きマスを動かす）して、1〜15を順番に並べよう\n少ない手数でクリアするほど高得点',
    init(S, B) {
      S.tiles = scramble(B);
      S.moves = 0;
    },
    update(S, dt, I) {
      const e = S.tiles.indexOf(0);
      const er = Math.floor(e / N), ec = e % N;
      let target = -1;

      if (I.ptr.clicked) {
        const c = Math.floor((I.ptr.x - OX) / CELL), r = Math.floor((I.ptr.y - OY) / CELL);
        if (c >= 0 && c < N && r >= 0 && r < N) {
          const i = r * N + c;
          if ((Math.abs(r - er) + Math.abs(c - ec)) === 1) target = i;
        }
      }
      if (I.tap('ArrowUp', 'KeyW') && er < N - 1) target = (er + 1) * N + ec;
      if (I.tap('ArrowDown', 'KeyS') && er > 0) target = (er - 1) * N + ec;
      if (I.tap('ArrowLeft', 'KeyA') && ec < N - 1) target = er * N + ec + 1;
      if (I.tap('ArrowRight', 'KeyD') && ec > 0) target = er * N + ec - 1;

      if (target >= 0) {
        S.tiles[e] = S.tiles[target];
        S.tiles[target] = 0;
        S.moves++;
        S.score = Math.max(0, 2000 - S.moves * 10);
        if (S.tiles.every((v, i) => v === SOLVED[i])) {
          S.over = true; S.msg = 'SOLVED!';
          S.score = Math.max(1, 2000 - S.moves * 10);
        }
      }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#2d3748'; g.fillRect(OX - 8, OY - 8, N * CELL + 16, N * CELL + 16);
      S.tiles.forEach((v, i) => {
        if (!v) return;
        const r = Math.floor(i / N), c = i % N;
        const x = OX + c * CELL + 4, y = OY + r * CELL + 4;
        const ok = v === SOLVED[i];
        B.box(g, x, y, CELL - 8, CELL - 8, ok ? '#2f9e6e' : '#577590', 14);
        B.text(g, String(v), x + (CELL - 8) / 2, y + (CELL - 8) / 2 + 2, 44, '#fff', 'center', 'bold');
      });
      B.text(g, `手数 ${S.moves}`, W / 2, 30, 20, '#fff', 'center', 'bold');
    },
  });

  // 解ける並びになるよう、完成状態から空きマスをランダムに動かして作る
  function scramble(B) {
    const t = SOLVED.slice();
    let e = 15, last = -1;
    for (let k = 0; k < 300; k++) {
      const r = Math.floor(e / N), c = e % N;
      const opts = [];
      if (r > 0) opts.push(e - N);
      if (r < N - 1) opts.push(e + N);
      if (c > 0) opts.push(e - 1);
      if (c < N - 1) opts.push(e + 1);
      const cand = opts.filter((o) => o !== last);
      const n = B.pick(cand);
      t[e] = t[n]; t[n] = 0;
      last = e; e = n;
    }
    return t;
  }
})();
