(() => {
  const N = 8, CELL = 48;
  const OX = (800 - N * CELL) / 2, OY = (500 - N * CELL) / 2 + 8;
  const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  const WEIGHT = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [10, -2, -1, -1, -1, -1, -2, 10],
    [5, -2, -1, -1, -1, -1, -2, 5],
    [5, -2, -1, -1, -1, -1, -2, 5],
    [10, -2, -1, -1, -1, -1, -2, 10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10, 5, 5, 10, -20, 100],
  ];

  BR.register('othello', {
    howto: 'あなたは⚫（黒）。置ける場所（●の印）をクリックして、相手の石を挟んで裏返そう\n石の数が多い方の勝ち。AIは白⚪',
    init(S) {
      S.b = Array.from({ length: N }, () => Array(N).fill(0));
      S.b[3][3] = 2; S.b[4][4] = 2; S.b[3][4] = 1; S.b[4][3] = 1;
      S.turn = 1; S.aiT = 0; S.passMsg = '';
      S.legal = legalMoves(S.b, 1);
    },
    update(S, dt, I, B) {
      if (S.turn === 1) {
        if (!S.legal.length) { S.turn = 2; S.passMsg = 'あなたはパス'; S.aiT = 0.8; return; }
        if (I.ptr.clicked) {
          const c = Math.floor((I.ptr.x - OX) / CELL), r = Math.floor((I.ptr.y - OY) / CELL);
          const m = S.legal.find((v) => v.r === r && v.c === c);
          if (m) {
            apply(S.b, m, 1);
            S.passMsg = '';
            S.turn = 2; S.aiT = 0.5;
            S.legal = [];
          }
        }
        if (!S.legal.length && S.turn === 1) S.legal = legalMoves(S.b, 1);
      } else {
        S.aiT -= dt;
        if (S.aiT > 0) return;
        const ai = legalMoves(S.b, 2);
        if (ai.length) {
          const m = pickAi(S.b, ai);
          apply(S.b, m, 2);
        } else if (!legalMoves(S.b, 1).length) {
          finish(S);
          return;
        }
        S.turn = 1;
        S.legal = legalMoves(S.b, 1);
        if (!S.legal.length) {
          if (!legalMoves(S.b, 2).length) { finish(S); return; }
          S.passMsg = 'あなたはパス（AIの番）';
          S.turn = 2; S.aiT = 0.8;
        }
      }
      S.score = count(S.b, 1) * 10;
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#166534'; g.fillRect(OX - 6, OY - 6, N * CELL + 12, N * CELL + 12);
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const x = OX + c * CELL, y = OY + r * CELL;
        g.fillStyle = '#15803d'; g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        const v = S.b[r][c];
        if (v) {
          g.beginPath(); g.arc(x + CELL / 2, y + CELL / 2, CELL / 2 - 6, 0, Math.PI * 2);
          g.fillStyle = v === 1 ? '#111' : '#f5f5f5'; g.fill();
        }
      }
      if (S.turn === 1) for (const m of S.legal) {
        g.beginPath(); g.arc(OX + m.c * CELL + CELL / 2, OY + m.r * CELL + CELL / 2, 6, 0, Math.PI * 2);
        g.fillStyle = 'rgba(255,255,255,0.6)'; g.fill();
      }
      B.text(g, `⚫ ${count(S.b, 1)}　⚪ ${count(S.b, 2)}　${S.turn === 1 ? 'あなたの番' : 'AIの番'}`, W / 2, 26, 20, '#fff', 'center', 'bold');
      if (S.passMsg) B.text(g, S.passMsg, W / 2, 470, 16, '#ffe066', 'center', 'bold');
    },
  });

  function legalMoves(b, p) {
    const out = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (b[r][c]) continue;
      const flips = flipsFor(b, r, c, p);
      if (flips.length) out.push({ r, c, flips });
    }
    return out;
  }
  function flipsFor(b, r, c, p) {
    const flips = [];
    for (const [dr, dc] of DIRS) {
      const line = [];
      let rr = r + dr, cc = c + dc;
      while (rr >= 0 && rr < N && cc >= 0 && cc < N && b[rr][cc] === 3 - p) {
        line.push([rr, cc]); rr += dr; cc += dc;
      }
      if (line.length && rr >= 0 && rr < N && cc >= 0 && cc < N && b[rr][cc] === p) flips.push(...line);
    }
    return flips;
  }
  function apply(b, m, p) {
    b[m.r][m.c] = p;
    for (const [r, c] of m.flips) b[r][c] = p;
  }
  function pickAi(b, moves) {
    let best = moves[0], bestV = -Infinity;
    for (const m of moves) {
      const v = WEIGHT[m.r][m.c] * 3 + m.flips.length * 2 + Math.random() * 4;
      if (v > bestV) { bestV = v; best = m; }
    }
    return best;
  }
  function count(b, p) {
    let n = 0;
    for (const row of b) for (const v of row) if (v === p) n++;
    return n;
  }
  function finish(S) {
    const a = count(S.b, 1), w = count(S.b, 2);
    S.over = true;
    S.msg = a > w ? 'YOU WIN!' : a < w ? 'AI WIN' : 'DRAW';
  }
})();
