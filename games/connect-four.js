(() => {
  const ROWS = 6, COLS = 7, CELL = 62;
  const OX = (800 - COLS * CELL) / 2, OY = 90;
  const DEPTH = 4;

  BR.register('connect-four', {
    howto: 'マウスの列にカーソルを合わせてクリックで🔴を落とす（1〜7キーでも可）\n4つ並べたら勝ち。AI（🟡）は数手先まで読んで打つ',
    init(S) {
      S.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      S.turn = 1; S.aiT = 0; S.result = null; S.wins = 0;
    },
    update(S, dt, I) {
      S.ptrX = I.ptr.x;
      if (S.result) { S.over = true; S.msg = S.result; S.score = S.wins * 100; return; }
      if (S.turn === 1) {
        let col = -1;
        for (let k = 0; k < COLS; k++) if (I.tap(`Digit${k + 1}`)) col = k;
        if (I.ptr.clicked && I.ptr.y > OY && I.ptr.x >= OX && I.ptr.x < OX + COLS * CELL) {
          col = Math.floor((I.ptr.x - OX) / CELL);
        }
        if (col >= 0 && dropOk(S.board, col)) {
          place(S.board, col, 1);
          afterMove(S, 1);
          if (!S.result) { S.turn = 2; S.aiT = 0.5; }
        }
      } else {
        S.aiT -= dt;
        if (S.aiT <= 0) {
          const col = bestMove(S.board);
          place(S.board, col, 2);
          afterMove(S, 2);
          if (!S.result) S.turn = 1;
        }
      }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#1d4ed8'; g.fillRect(OX - 14, OY - 14, COLS * CELL + 28, ROWS * CELL + 28);
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const v = S.board[r][c];
        const x = OX + c * CELL + CELL / 2, y = OY + r * CELL + CELL / 2;
        g.beginPath(); g.arc(x, y, CELL / 2 - 6, 0, Math.PI * 2);
        g.fillStyle = v === 1 ? '#ef4444' : v === 2 ? '#facc15' : '#0f172a';
        g.fill();
      }
      if (S.turn === 1 && !S.result) {
        const col = Math.floor((S.ptrX - OX) / CELL);
        if (col >= 0 && col < COLS) {
          g.fillStyle = 'rgba(239,68,68,0.5)';
          g.beginPath(); g.arc(OX + col * CELL + CELL / 2, OY - 30, CELL / 2 - 10, 0, Math.PI * 2); g.fill();
        }
      }
      B.text(g, S.turn === 1 ? 'あなたの番（🔴）' : 'AIが考え中…（🟡）', W / 2, 40, 22, '#fff', 'center', 'bold');
      B.text(g, `勝ち ${S.wins}`, 20, 470, 18, '#fff', 'left', 'bold');
    },
  });

  function dropOk(b, c) { return b[0][c] === 0; }
  function place(b, c, p) {
    for (let r = ROWS - 1; r >= 0; r--) if (b[r][c] === 0) { b[r][c] = p; return r; }
    return -1;
  }
  function winner(b) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const v = b[r][c];
      if (!v) continue;
      for (const [dr, dc] of dirs) {
        let ok = true;
        for (let k = 1; k < 4; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || b[rr][cc] !== v) { ok = false; break; }
        }
        if (ok) return v;
      }
    }
    return 0;
  }
  function full(b) { return b[0].every((v) => v !== 0); }

  function afterMove(S, p) {
    const w = winner(S.board);
    if (w === 1) { S.result = 'YOU WIN!'; S.wins++; }
    else if (w === 2) S.result = 'AI WIN';
    else if (full(S.board)) S.result = 'DRAW';
  }

  // 評価：AI(2)側の有利さ
  function evaluate(b) {
    let score = 0;
    for (let r = 0; r < ROWS; r++) if (b[r][3] === 2) score += 3;
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        let ai = 0, hu = 0, emp = 0;
        for (let k = 0; k < 4; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { ai = hu = -1; break; }
          const v = b[rr][cc];
          if (v === 2) ai++; else if (v === 1) hu++; else emp++;
        }
        if (ai < 0) continue;
        if (ai === 4) score += 1000;
        else if (hu === 0 && ai === 3) score += 8;
        else if (hu === 0 && ai === 2) score += 2;
        if (hu === 4) score -= 1000;
        else if (ai === 0 && hu === 3) score -= 9;
      }
    }
    return score;
  }

  function minimax(b, depth, alpha, beta, maxing) {
    const w = winner(b);
    if (w === 2) return 100000 + depth;
    if (w === 1) return -100000 - depth;
    if (full(b) || depth === 0) return evaluate(b);
    const cols = [3, 2, 4, 1, 5, 0, 6].filter((c) => dropOk(b, c));
    if (maxing) {
      let best = -Infinity;
      for (const c of cols) {
        const r = place(b, c, 2);
        best = Math.max(best, minimax(b, depth - 1, alpha, beta, false));
        b[r][c] = 0;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    }
    let best = Infinity;
    for (const c of cols) {
      const r = place(b, c, 1);
      best = Math.min(best, minimax(b, depth - 1, alpha, beta, true));
      b[r][c] = 0;
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  function bestMove(board) {
    const b = board.map((row) => row.slice());
    let best = -1, bestScore = -Infinity;
    for (const c of [3, 2, 4, 1, 5, 0, 6]) {
      if (!dropOk(b, c)) continue;
      const r = place(b, c, 2);
      const s = minimax(b, DEPTH - 1, -Infinity, Infinity, false);
      b[r][c] = 0;
      if (s > bestScore) { bestScore = s; best = c; }
    }
    return best;
  }
})();
