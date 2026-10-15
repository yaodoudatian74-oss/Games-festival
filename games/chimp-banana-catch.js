(() => {
  BR.register('chimp-banana-catch', {
    howto: '← → / マウスで🧺を動かし、🍌をキャッチ\n🍄を取るとライフ−1。ライフが0になるとゲームオーバー',
    init(S) {
      S.x = 400; S.items = []; S.spawn = 0; S.lives = 3; S.catches = 0;
    },
    update(S, dt, I, B) {
      if (I.ptr.down) S.x = I.ptr.x;
      else S.x += I.dx * 440 * dt;
      S.x = B.clamp(S.x, 50, 750);

      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.spawn = Math.max(0.35, 0.8 - S.t * 0.01);
        S.items.push({
          x: B.rand(30, 770), y: -20, vy: 160 + S.t * 5 + B.rand(0, 60),
          kind: Math.random() < 0.25 ? 'bad' : 'good',
        });
      }
      for (const it of S.items) {
        it.y += it.vy * dt;
        if (Math.abs(it.x - S.x) < 52 && Math.abs(it.y - 440) < 30) {
          it.hit = true;
          if (it.kind === 'good') { S.score += 10; S.catches++; }
          else { S.lives--; if (S.lives <= 0) { S.over = true; S.msg = 'ライフ切れ'; } }
        }
      }
      S.items = S.items.filter((it) => !it.hit && it.y < 520);
    },
    draw(S, g, W, H, B) {
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0f3d2e'); bg.addColorStop(1, '#1f6b4a');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      for (const it of S.items) B.emoji(g, it.kind === 'good' ? '🍌' : '🍄', it.x, it.y, 34);
      B.emoji(g, '🧺', S.x, 450, 56);
      B.emoji(g, '🐒', S.x, 400, 40);
      B.text(g, '❤️'.repeat(Math.max(0, S.lives)), W / 2, 20, 20, '#fff', 'center');
    },
  });
})();
