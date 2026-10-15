(() => {
  BR.register('bombini-asteroid', {
    howto: '←→ で回転、↑ で加速、Space / クリックで弾を発射\n🪨の隕石を全部壊そう。ライフは3つ。画面の端はつながっている',
    init(S, B) {
      S.x = 400; S.y = 250; S.a = -Math.PI / 2; S.vx = 0; S.vy = 0;
      S.lives = 3; S.inv = 0; S.cool = 0; S.wave = 1;
      S.bullets = []; S.rocks = [];
      spawnWave(S, B);
    },
    update(S, dt, I, B) {
      if (I.held('ArrowLeft', 'KeyA')) S.a -= 3.5 * dt;
      if (I.held('ArrowRight', 'KeyD')) S.a += 3.5 * dt;
      if (I.held('ArrowUp', 'KeyW')) {
        S.vx += Math.cos(S.a) * 260 * dt;
        S.vy += Math.sin(S.a) * 260 * dt;
      }
      S.vx *= 0.995; S.vy *= 0.995;
      S.x = wrap(S.x + S.vx * dt, 800);
      S.y = wrap(S.y + S.vy * dt, 500);

      S.cool -= dt; S.inv -= dt;
      if (I.action() && S.cool <= 0) {
        S.bullets.push({
          x: S.x + Math.cos(S.a) * 18, y: S.y + Math.sin(S.a) * 18,
          vx: Math.cos(S.a) * 520 + S.vx * 0.3, vy: Math.sin(S.a) * 520 + S.vy * 0.3, t: 1.1,
        });
        S.cool = 0.22;
      }
      for (const b of S.bullets) {
        b.x = wrap(b.x + b.vx * dt, 800); b.y = wrap(b.y + b.vy * dt, 500); b.t -= dt;
      }
      S.bullets = S.bullets.filter((b) => b.t > 0);

      for (const r of S.rocks) {
        r.x = wrap(r.x + r.vx * dt, 800); r.y = wrap(r.y + r.vy * dt, 500);
        r.rot += r.spin * dt;
      }
      const next = [];
      for (const r of S.rocks) {
        const hitBullet = S.bullets.find((b) => B.circHit({ x: b.x, y: b.y, r: 3 }, r));
        if (hitBullet) {
          S.bullets.splice(S.bullets.indexOf(hitBullet), 1);
          if (r.r > 16) {
            S.score += 20;
            for (let k = 0; k < 2; k++) next.push(makeRock(r.x, r.y, r.r * 0.5, B));
          } else {
            S.score += 50;
          }
          continue;
        }
        if (S.inv <= 0 && B.circHit({ x: S.x, y: S.y, r: 12 }, r)) {
          S.lives--; S.inv = 2; S.vx = 0; S.vy = 0; S.x = 400; S.y = 250;
          next.push(r);
          if (S.lives <= 0) { S.over = true; S.msg = '撃沈'; return; }
          continue;
        }
        next.push(r);
      }
      S.rocks = next;
      if (S.rocks.length === 0) { S.wave++; spawnWave(S, B); }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#05081a'; g.fillRect(0, 0, W, H);
      for (const r of S.rocks) {
        g.save(); g.translate(r.x, r.y); g.rotate(r.rot);
        B.emoji(g, '🪨', 0, 0, r.r * 2.2);
        g.restore();
      }
      g.fillStyle = '#ffe066';
      for (const b of S.bullets) { g.beginPath(); g.arc(b.x, b.y, 3, 0, Math.PI * 2); g.fill(); }
      if (S.lives > 0 && (S.inv <= 0 || Math.floor(S.t * 10) % 2 === 0)) {
        g.save(); g.translate(S.x, S.y); g.rotate(S.a);
        g.beginPath(); g.moveTo(16, 0); g.lineTo(-12, 10); g.lineTo(-7, 0); g.lineTo(-12, -10); g.closePath();
        g.fillStyle = '#4cc9f0'; g.fill();
        g.restore();
      }
      B.text(g, `WAVE ${S.wave}　${'❤️'.repeat(S.lives)}`, W / 2, 20, 18, '#fff', 'center', 'bold');
    },
  });

  function wrap(v, max) { return v < 0 ? v + max : v >= max ? v - max : v; }
  function makeRock(x, y, r, B) {
    const a = B.rand(0, Math.PI * 2), s = B.rand(40, 110);
    return { x, y, r, vx: Math.cos(a) * s, vy: Math.sin(a) * s, rot: 0, spin: B.rand(-2, 2) };
  }
  function spawnWave(S, B) {
    const n = 2 + S.wave;
    for (let i = 0; i < n; i++) {
      const edge = B.rand(0, 1) < 0.5;
      const x = edge ? B.rand(0, 800) : (Math.random() < 0.5 ? 20 : 780);
      const y = edge ? (Math.random() < 0.5 ? 20 : 480) : B.rand(0, 500);
      S.rocks.push(makeRock(x, y, 40, B));
    }
  }
})();
