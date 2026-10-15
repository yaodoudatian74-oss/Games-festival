(() => {
  const COLS = 10, ROWS = 6, BW = 72, BH = 22;
  const ROW_COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc'];
  const PADDLE_Y = 470;

  BR.register('gusini-breakout', {
    howto: '←→ / マウスでパドルを動かし、ボールを跳ね返そう\nブロックを全部壊すとクリア。ボールを3回落とすと終了',
    init(S) {
      S.px = 400; S.lastPtr = null; S.lives = 3;
      S.bricks = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        S.bricks.push({ x: 40 + c * 75, y: 70 + r * 30, w: BW, h: BH, alive: true, r, pts: (ROWS - r) * 10, color: ROW_COLORS[r] });
      }
      S.ball = { x: 400, y: PADDLE_Y - 10, vx: 0, vy: 0, stuck: true };
    },
    update(S, dt, I, B) {
      if (I.ptr.x !== S.lastPtr) { S.px = B.clamp(I.ptr.x, 50, 750); S.lastPtr = I.ptr.x; }
      else S.px = B.clamp(S.px + I.dx * 480 * dt, 50, 750);

      const b = S.ball;
      if (b.stuck) {
        b.x = S.px; b.y = PADDLE_Y - 10;
        if (I.action()) { b.stuck = false; b.vx = B.rand(-160, 160); b.vy = -360; }
        return;
      }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < 10) { b.x = 10; b.vx = Math.abs(b.vx); }
      if (b.x > 790) { b.x = 790; b.vx = -Math.abs(b.vx); }
      if (b.y < 10) { b.y = 10; b.vy = Math.abs(b.vy); }

      if (b.vy > 0 && b.y + 8 >= PADDLE_Y && b.y < PADDLE_Y + 12 && Math.abs(b.x - S.px) < 60) {
        b.vy = -Math.abs(b.vy);
        b.vx = (b.x - S.px) / 60 * 320;
        b.y = PADDLE_Y - 8;
      }
      if (b.y > 515) {
        S.lives--;
        if (S.lives <= 0) { S.over = true; return; }
        b.stuck = true;
        return;
      }
      for (const br of S.bricks) {
        if (!br.alive) continue;
        if (b.x + 8 > br.x && b.x - 8 < br.x + br.w && b.y + 8 > br.y && b.y - 8 < br.y + br.h) {
          br.alive = false;
          S.score += br.pts;
          const ox = Math.min(b.x + 8 - br.x, br.x + br.w - (b.x - 8));
          const oy = Math.min(b.y + 8 - br.y, br.y + br.h - (b.y - 8));
          if (ox < oy) b.vx = -b.vx; else b.vy = -b.vy;
          break;
        }
      }
      if (S.bricks.every((v) => !v.alive)) { S.over = true; S.msg = 'CLEAR!'; }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#101426'; g.fillRect(0, 0, W, H);
      for (const br of S.bricks) {
        if (!br.alive) continue;
        B.box(g, br.x, br.y, br.w, br.h, br.color, 5);
      }
      B.box(g, S.px - 60, PADDLE_Y, 120, 12, '#ffffff', 6);
      B.emoji(g, '🪿', S.px, PADDLE_Y - 14, 24);
      g.beginPath(); g.arc(S.ball.x, S.ball.y, 8, 0, Math.PI * 2); g.fillStyle = '#ffe066'; g.fill();
      B.text(g, '❤️'.repeat(S.lives), W / 2, 20, 18, '#fff', 'center');
    },
  });
})();
