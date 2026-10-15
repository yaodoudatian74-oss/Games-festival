(() => {
  BR.register('bombardiro-bombing', {
    howto: 'Space / クリックで爆弾を投下（飛行機の真下に落ちる）\n地上のビル🏢を爆撃！制限時間は60秒',
    init(S) {
      S.plane = 40; S.dir = 1; S.bombs = []; S.cool = 0; S.left = 60;
      S.slots = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ x: 60 + i * 105, alive: true, timer: 0 }));
    },
    update(S, dt, I, B) {
      S.left -= dt;
      if (S.left <= 0) { S.left = 0; S.over = true; S.msg = 'TIME UP'; return; }

      S.plane += S.dir * (200 + S.t * 4) * dt;
      if (S.plane > 760) { S.plane = 760; S.dir = -1; }
      if (S.plane < 40) { S.plane = 40; S.dir = 1; }

      S.cool -= dt;
      if (I.action() && S.cool <= 0) {
        S.bombs.push({ x: S.plane, y: 70, vy: 0 });
        S.cool = 0.25;
      }

      for (const b of S.bombs) { b.vy += 600 * dt; b.y += b.vy * dt; }
      S.bombs = S.bombs.filter((b) => {
        const slot = S.slots.find((s) => s.alive && b.x > s.x && b.x < s.x + 60 && b.y >= 360);
        if (slot) {
          slot.alive = false; slot.timer = 1.6;
          S.score += 100;
          return false;
        }
        return b.y < 460;
      });
      for (const s of S.slots) {
        if (!s.alive) { s.timer -= dt; if (s.timer <= 0) s.alive = true; }
      }
    },
    draw(S, g, W, H, B) {
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#5ec8ff'); sky.addColorStop(1, '#cfefff');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      g.fillStyle = '#5bbf5b'; g.fillRect(0, 460, W, 40);
      for (const s of S.slots) {
        if (s.alive) {
          B.box(g, s.x, 360, 60, 100, '#4a5a7a', 4);
          g.fillStyle = '#ffe066';
          for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) g.fillRect(s.x + 10 + c * 24, 372 + r * 22, 12, 12);
        } else {
          B.emoji(g, '💥', s.x + 30, 440, 36);
        }
      }
      B.emoji(g, '🐊', S.plane - 14, 40, 36);
      B.emoji(g, '✈️', S.plane + 20, 46, 30);
      for (const b of S.bombs) B.emoji(g, '💣', b.x, b.y, 22);
    },
  });
})();
