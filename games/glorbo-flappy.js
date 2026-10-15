(() => {
  BR.register('glorbo-flappy', {
    howto: 'Space / クリックで羽ばたく（🍉が上昇）\n緑の土管の隙間を通り抜けてスコアを稼ごう',
    init(S) {
      S.y = 240; S.vy = 0; S.pipes = []; S.spawn = 0.5; S.speed = 200;
    },
    update(S, dt, I, B) {
      if (I.action()) S.vy = -340;
      S.vy = Math.min(560, S.vy + 1100 * dt);
      S.y += S.vy * dt;
      if (S.y - 16 < 0 || S.y + 16 > 500) { S.over = true; return; }

      S.speed = 200 + S.t * 3;
      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.spawn = 1.6;
        S.pipes.push({ x: 820, gap: B.rand(150, 350), passed: false });
      }
      for (const p of S.pipes) {
        p.x -= S.speed * dt;
        if (!p.passed && p.x + 60 < 200) { p.passed = true; S.score++; }
        const hitX = 200 + 16 > p.x && 200 - 16 < p.x + 60;
        if (hitX && (S.y - 16 < p.gap - 75 || S.y + 16 > p.gap + 75)) S.over = true;
      }
      S.pipes = S.pipes.filter((p) => p.x > -70);
    },
    draw(S, g, W, H, B) {
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#2a7bd6'); sky.addColorStop(1, '#a6e3ff');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      for (const p of S.pipes) {
        g.fillStyle = '#3ea54a';
        g.fillRect(p.x, 0, 60, p.gap - 75);
        g.fillRect(p.x, p.gap + 75, 60, H - (p.gap + 75));
        g.fillStyle = '#2d7d36';
        g.fillRect(p.x - 6, p.gap - 95, 72, 20);
        g.fillRect(p.x - 6, p.gap + 75, 72, 20);
      }
      B.emoji(g, '🍉', 200, S.y, 36);
    },
  });
})();
