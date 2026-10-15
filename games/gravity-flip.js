(() => {
  const FLOOR = 440, CEIL = 60, PX = 150, R = 14;

  BR.register('gravity-flip', {
    howto: 'Space / クリックで重力を反転（床と天井を行き来する）\n迫ってくるトゲ（▲▼）に当たると終了。走った距離がスコア',
    init(S) {
      S.y = FLOOR; S.vy = 0; S.g = 1; S.obs = []; S.spawn = 1; S.dist = 0;
    },
    update(S, dt, I, B) {
      if (I.action()) { S.g *= -1; S.vy = 0; }
      S.vy += S.g * 1600 * dt;
      S.y += S.vy * dt;
      if (S.y >= FLOOR) { S.y = FLOOR; S.vy = 0; }
      if (S.y <= CEIL) { S.y = CEIL; S.vy = 0; }

      const speed = 260 + S.t * 6;
      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.spawn = Math.max(0.55, B.rand(0.8, 1.6) - S.t * 0.01);
        S.obs.push({ x: 830, side: Math.random() < 0.5 ? 0 : 1, w: B.rand(26, 40), h: B.rand(40, 70) });
      }
      for (const o of S.obs) {
        o.x -= speed * dt;
        const overlapX = Math.abs(o.x - PX) < o.w / 2 + R - 2;
        if (!overlapX) continue;
        const onFloor = o.side === 0 && S.y + R > FLOOR - o.h;
        const onCeil = o.side === 1 && S.y - R < CEIL + o.h;
        if (onFloor || onCeil) { S.over = true; S.msg = 'グサッ！'; return; }
      }
      S.obs = S.obs.filter((o) => o.x > -60);
      S.dist += speed * dt;
      S.score = Math.floor(S.dist / 10);
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#10051e'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#9d4edd'; g.fillRect(0, FLOOR + R + 2, W, 4); g.fillRect(0, CEIL - R - 6, W, 4);
      for (const o of S.obs) {
        g.fillStyle = '#ff5d8f';
        g.beginPath();
        if (o.side === 0) {
          g.moveTo(o.x - o.w / 2, FLOOR + R + 2); g.lineTo(o.x, FLOOR + R + 2 - o.h); g.lineTo(o.x + o.w / 2, FLOOR + R + 2);
        } else {
          g.moveTo(o.x - o.w / 2, CEIL - R - 6); g.lineTo(o.x, CEIL - R - 6 + o.h); g.lineTo(o.x + o.w / 2, CEIL - R - 6);
        }
        g.closePath(); g.fill();
      }
      B.emoji(g, '🙃', PX, S.y, 30);
      B.text(g, `DISTANCE ${Math.floor(S.dist / 10)} m`, W / 2, 20, 18, '#fff', 'center', 'bold');
    },
  });
})();
