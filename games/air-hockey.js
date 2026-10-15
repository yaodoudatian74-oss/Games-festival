(() => {
  const GOAL_TOP = 190, GOAL_BOT = 310, R_PUCK = 16, R_PAD = 34;

  BR.register('air-hockey', {
    howto: 'マウス / 矢印キーで左の🏒を動かし、パックを右のゴールへ\n先に5点取ると勝ち。AIは少しずつ強くなる',
    init(S, B) {
      S.me = 0; S.ai = 0; S.lastPtr = null;
      S.px = 150; S.py = 250; S.ax = 650; S.ay = 250;
      S.puck = { x: 400, y: 250, vx: 0, vy: 0 };
      S.serve = Math.random() < 0.5 ? 1 : -1;
      S.puck.vx = 200 * S.serve;
      S.puck.vy = B.rand(-80, 80);
    },
    update(S, dt, I, B) {
      const pk = S.puck;
      if (I.ptr.x !== S.lastPtr || I.ptr.y !== S.lastPtrY) {
        S.px = B.clamp(I.ptr.x, R_PAD, 380); S.py = B.clamp(I.ptr.y, R_PAD, 500 - R_PAD);
        S.lastPtr = I.ptr.x; S.lastPtrY = I.ptr.y;
      } else {
        S.px = B.clamp(S.px + I.dx * 380 * dt, R_PAD, 380);
        S.py = B.clamp(S.py + I.dy * 380 * dt, R_PAD, 500 - R_PAD);
      }

      const aiSpeed = 260 + S.me * 40;
      const tx = pk.vx > 0 ? pk.x + 30 : 650;
      const ty = pk.vx > 0 ? pk.y : 250;
      const dx = B.clamp(tx - S.ax, -aiSpeed * dt, aiSpeed * dt);
      const dy = B.clamp(ty - S.ay, -aiSpeed * dt, aiSpeed * dt);
      S.ax = B.clamp(S.ax + dx, 420 + R_PAD, 800 - R_PAD);
      S.ay = B.clamp(S.ay + dy, R_PAD, 500 - R_PAD);

      pk.x += pk.vx * dt; pk.y += pk.vy * dt;
      pk.vx *= 0.998; pk.vy *= 0.998;

      if (pk.y < R_PUCK) { pk.y = R_PUCK; pk.vy = Math.abs(pk.vy); }
      if (pk.y > 500 - R_PUCK) { pk.y = 500 - R_PUCK; pk.vy = -Math.abs(pk.vy); }

      collide(pk, S.px, S.py, S.px - S.ax, S.py - S.ay, B);
      collide(pk, S.ax, S.ay, 0, 0, B);

      const inGoal = pk.y > GOAL_TOP && pk.y < GOAL_BOT;
      if (pk.x < R_PUCK && !inGoal) { pk.x = R_PUCK; pk.vx = Math.abs(pk.vx); }
      if (pk.x > 800 - R_PUCK && !inGoal) { pk.x = 800 - R_PUCK; pk.vx = -Math.abs(pk.vx); }

      if (pk.x < -R_PUCK) { S.ai++; reset(S, B, -1); }
      if (pk.x > 800 + R_PUCK) { S.me++; reset(S, B, 1); }
      if (S.me >= 5) { S.over = true; S.msg = 'YOU WIN'; }
      if (S.ai >= 5) { S.over = true; S.msg = 'AI WIN'; }
      S.score = S.me * 100;
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#e0f2fe'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#38bdf8'; g.lineWidth = 4;
      g.strokeRect(4, 4, W - 8, H - 8);
      g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke();
      g.beginPath(); g.arc(W / 2, H / 2, 60, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#fca5a5'; g.fillRect(0, GOAL_TOP, 6, GOAL_BOT - GOAL_TOP);
      g.fillStyle = '#86efac'; g.fillRect(W - 6, GOAL_TOP, 6, GOAL_BOT - GOAL_TOP);
      B.emoji(g, '🏒', S.px, S.py, 66);
      B.emoji(g, '🦈', S.ax, S.ay, 66);
      g.beginPath(); g.arc(S.puck.x, S.puck.y, R_PUCK, 0, Math.PI * 2); g.fillStyle = '#111'; g.fill();
      B.text(g, `${S.me} : ${S.ai}`, W / 2, 30, 30, '#0c4a6e', 'center', '800');
    },
  });

  function collide(pk, cx, cy, ux, uy, B) {
    const dx = pk.x - cx, dy = pk.y - cy;
    const d = Math.hypot(dx, dy);
    if (d >= R_PUCK + R_PAD || d === 0) return;
    const nx = dx / d, ny = dy / d;
    pk.x = cx + nx * (R_PUCK + R_PAD);
    pk.y = cy + ny * (R_PUCK + R_PAD);
    const rvn = pk.vx * nx + pk.vy * ny;
    if (rvn < 0) {
      pk.vx -= 2 * rvn * nx;
      pk.vy -= 2 * rvn * ny;
    }
    pk.vx += nx * 120; pk.vy += ny * 120;
    const sp = Math.hypot(pk.vx, pk.vy);
    if (sp > 720) { pk.vx *= 720 / sp; pk.vy *= 720 / sp; }
  }

  function reset(S, B, toward) {
    S.puck = { x: 400, y: 250, vx: 220 * toward, vy: B.rand(-80, 80) };
  }
})();
