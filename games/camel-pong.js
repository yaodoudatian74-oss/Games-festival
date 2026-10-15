(() => {
  const PAD_H = 90;

  BR.register('camel-pong', {
    howto: '↑↓ / マウスで左のパドル（🐪）を操作\n先に7点取ると勝ち。AIはあなたが得点するほど速くなる',
    init(S, B) {
      S.py = 250; S.ay = 250; S.lastPtr = null; S.pts = 0; S.opp = 0; S.hits = 0;
      S.bx = 400; S.by = 250; S.vx = 260 * (Math.random() < 0.5 ? 1 : -1); S.vy = B.rand(-120, 120);
    },
    update(S, dt, I, B) {
      if (I.ptr.y !== S.lastPtr) { S.py = B.clamp(I.ptr.y, 45, 455); S.lastPtr = I.ptr.y; }
      else S.py = B.clamp(S.py + I.dy * 420 * dt, 45, 455);

      const aiSpeed = 220 + S.pts * 30;
      S.ay += B.clamp(S.by - S.ay, -aiSpeed * dt, aiSpeed * dt);
      S.ay = B.clamp(S.ay, 45, 455);

      S.bx += S.vx * dt; S.by += S.vy * dt;
      if (S.by < 10) { S.by = 10; S.vy = Math.abs(S.vy); }
      if (S.by > 490) { S.by = 490; S.vy = -Math.abs(S.vy); }

      if (S.vx < 0 && S.bx - 8 <= 52 && S.bx > 40 && Math.abs(S.by - S.py) < PAD_H / 2 + 8) {
        S.vx = Math.min(700, Math.abs(S.vx) * 1.05);
        S.vy += (S.by - S.py) * 4;
        S.hits++;
      }
      if (S.vx > 0 && S.bx + 8 >= 748 && S.bx < 760 && Math.abs(S.by - S.ay) < PAD_H / 2 + 8) {
        S.vx = -Math.min(700, Math.abs(S.vx) * 1.05);
        S.vy += (S.by - S.ay) * 3;
      }
      S.vy = B.clamp(S.vy, -500, 500);

      if (S.bx < 0) {
        S.opp++;
        if (S.opp >= 7) { S.over = true; S.msg = 'AI WIN'; return; }
        S.bx = 400; S.by = 250; S.vx = 260; S.vy = B.rand(-120, 120);
      }
      if (S.bx > 800) {
        S.pts++;
        if (S.pts >= 7) { S.over = true; S.msg = 'YOU WIN'; return; }
        S.bx = 400; S.by = 250; S.vx = -260; S.vy = B.rand(-120, 120);
      }
      S.score = S.pts * 100 + S.hits * 10;
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#0f3d2e'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,0.4)'; g.setLineDash([12, 12]); g.lineWidth = 3;
      g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke(); g.setLineDash([]);
      B.box(g, 40, S.py - PAD_H / 2, 12, PAD_H, '#ffe066', 6);
      B.box(g, 748, S.ay - PAD_H / 2, 12, PAD_H, '#ff6b6b', 6);
      B.emoji(g, '🐪', 30, S.py, 26);
      B.emoji(g, '🐊', 770, S.ay, 26);
      g.beginPath(); g.arc(S.bx, S.by, 9, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      B.text(g, `${S.pts} : ${S.opp}`, W / 2, 40, 34, '#fff', 'center', '800');
    },
  });
})();
