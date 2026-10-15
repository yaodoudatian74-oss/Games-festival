(() => {
  BR.register('tralalero-dash', {
    howto: '← → / A D でレーン移動\n🪨を避けて、💰コインを集めよう。時間とともに加速する',
    init(S) {
      S.lane = 1; S.px = 400; S.items = []; S.spawn = 0; S.coins = 0; S.dist = 0; S.stripe = 0;
    },
    update(S, dt, I, B) {
      if (I.tap('ArrowLeft', 'KeyA')) S.lane = Math.max(0, S.lane - 1);
      if (I.tap('ArrowRight', 'KeyD')) S.lane = Math.min(2, S.lane + 1);
      S.px += (200 + S.lane * 200 - S.px) * Math.min(1, dt * 14);

      const speed = Math.min(720, 260 + S.t * 8);
      S.dist += speed * dt;
      S.stripe = (S.stripe + speed * dt) % 60;

      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.spawn = Math.max(0.35, 0.9 - S.t * 0.01);
        const lanes = B.shuffle([0, 1, 2]);
        const n = Math.random() < 0.4 ? 2 : 1;
        for (let i = 0; i < n; i++) S.items.push({ lane: lanes[i], y: -40, kind: 'obs' });
        if (Math.random() < 0.6) S.items.push({ lane: lanes[2], y: -160, kind: 'coin' });
      }

      for (const it of S.items) {
        it.y += speed * dt;
        if (it.lane !== S.lane) continue;
        if (it.kind === 'obs' && Math.abs(it.y - 420) < 28) S.over = true;
        if (it.kind === 'coin' && !it.got && Math.abs(it.y - 420) < 32) { it.got = true; S.coins++; }
      }
      S.items = S.items.filter((it) => it.y < 540 && !it.got);
      S.score = Math.floor(S.dist / 10) + S.coins * 50;
    },
    draw(S, g, W, H, B) {
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#1a1040'); sky.addColorStop(1, '#3b1d6b');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      for (let l = 0; l < 3; l++) {
        g.fillStyle = l % 2 ? '#2a2358' : '#271f52';
        g.fillRect(100 + l * 200, 0, 200, H);
      }
      g.fillStyle = 'rgba(255,255,255,0.15)';
      for (let y = -60 + S.stripe; y < H; y += 60) { g.fillRect(298, y, 4, 30); g.fillRect(498, y, 4, 30); }
      for (const it of S.items) B.emoji(g, it.kind === 'coin' ? '💰' : '🪨', 200 + it.lane * 200, it.y, 40);
      B.emoji(g, '🦈', S.px, 420, 56);
    },
  });
})();
