(() => {
  BR.register('shark-arena', {
    howto: 'マウス（またはWASD / 矢印）で🦈を動かして、🪨を避け続けよう\n生存時間がそのままスコア。時間とともに隕石が増える',
    init(S) {
      S.x = 400; S.y = 250; S.hz = []; S.spawn = 0;
    },
    update(S, dt, I, B) {
      if (I.ptr.down) {
        S.x += (I.ptr.x - S.x) * Math.min(1, dt * 10);
        S.y += (I.ptr.y - S.y) * Math.min(1, dt * 10);
      } else {
        S.x += I.dx * 300 * dt;
        S.y += I.dy * 300 * dt;
      }
      S.x = B.clamp(S.x, 16, 784); S.y = B.clamp(S.y, 16, 484);

      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.spawn = Math.max(0.15, 0.6 - S.t * 0.01);
        const side = B.randi(0, 3);
        const r = B.rand(14, 26);
        let x, y;
        if (side === 0) { x = -30; y = B.rand(0, 500); }
        else if (side === 1) { x = 830; y = B.rand(0, 500); }
        else if (side === 2) { x = B.rand(0, 800); y = -30; }
        else { x = B.rand(0, 800); y = 530; }
        const a = Math.atan2(B.rand(0, 500) - y, B.rand(0, 800) - x);
        const sp = 120 + S.t * 4;
        S.hz.push({ x, y, r, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: 0 });
      }
      for (const h of S.hz) { h.x += h.vx * dt; h.y += h.vy * dt; h.rot += dt * 3; }
      S.hz = S.hz.filter((h) => h.x > -60 && h.x < 860 && h.y > -60 && h.y < 560);

      if (S.hz.some((h) => B.circHit({ x: S.x, y: S.y, r: 14 }, h))) { S.over = true; S.msg = '被弾！'; return; }
      S.score = Math.floor(S.t * 10);
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#0b1a33'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,0.05)';
      for (let x = 0; x < W; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y < H; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      for (const h of S.hz) {
        g.save(); g.translate(h.x, h.y); g.rotate(h.rot);
        B.emoji(g, '🪨', 0, 0, h.r * 2.2);
        g.restore();
      }
      B.emoji(g, '🦈', S.x, S.y, 34);
    },
  });
})();
