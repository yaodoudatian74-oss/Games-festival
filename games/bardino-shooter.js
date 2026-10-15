(() => {
  const COLS = 10, ROWS = 5;

  BR.register('bardino-shooter', {
    howto: '←→ で移動、Space / クリックで発射\n🐷の軍団を全滅させよう。撃ち返してくる弾に当たると終了',
    init(S) {
      S.px = 400; S.cool = 0; S.ecool = 1;
      S.ox = 0; S.oy = 0; S.dir = 1; S.step = 0.5;
      S.inv = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        S.inv.push({ c, r, alive: true });
      }
      S.bullets = []; S.enemyB = [];
    },
    update(S, dt, I, B) {
      S.px = B.clamp(S.px + I.dx * 340 * dt, 30, 770);
      S.cool -= dt;
      if (I.action() && S.cool <= 0) { S.bullets.push({ x: S.px, y: 440 }); S.cool = 0.35; }

      const alive = S.inv.filter((v) => v.alive);
      if (alive.length === 0) { S.over = true; S.msg = 'CLEAR!'; return; }

      S.step -= dt;
      if (S.step <= 0) {
        S.step = Math.max(0.05, 0.6 - alive.length * 0.008);
        const cx = alive.map((v) => v.c * 64 + 90 + S.ox);
        const minC = Math.min(...cx), maxC = Math.max(...cx);
        const edge = S.dir > 0 ? maxC + 30 + 12 > 790 : minC - 30 - 12 < 10;
        if (edge) { S.dir *= -1; S.oy += 18; } else { S.ox += S.dir * 12; }
      }
      if (alive.some((v) => 60 + v.r * 44 + S.oy > 410)) { S.over = true; S.msg = '侵略された'; return; }

      S.ecool -= dt;
      if (S.ecool <= 0 && alive.length) {
        const v = B.pick(alive);
        S.enemyB.push({ x: v.c * 64 + 90 + S.ox, y: 60 + v.r * 44 + S.oy + 20 });
        S.ecool = Math.max(0.4, 1.2 - S.score * 0.001);
      }

      for (const b of S.bullets) b.y -= 520 * dt;
      S.bullets = S.bullets.filter((b) => b.y > -10);
      for (const b of S.bullets) {
        for (const v of S.inv) {
          if (!v.alive) continue;
          const x = v.c * 64 + 90 + S.ox, y = 60 + v.r * 44 + S.oy;
          if (Math.abs(b.x - x) < 20 && Math.abs(b.y - y) < 16) {
            v.alive = false; b.y = -99;
            S.score += (ROWS - v.r) * 10;
            break;
          }
        }
      }
      S.bullets = S.bullets.filter((b) => b.y > -10);

      for (const b of S.enemyB) b.y += 230 * dt;
      for (const b of S.enemyB) {
        if (Math.abs(b.x - S.px) < 18 && b.y > 440 && b.y < 470) { S.over = true; S.msg = '撃ち落とされた'; }
      }
      S.enemyB = S.enemyB.filter((b) => b.y < 520);
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#060818'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#fff';
      for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53 + S.t * 30 * (i % 3 + 1)) % H, 2, 2);
      for (const v of S.inv) {
        if (!v.alive) continue;
        const x = v.c * 64 + 90 + S.ox, y = 60 + v.r * 44 + S.oy;
        B.emoji(g, v.r % 2 ? '🐷' : '🐖', x, y, 32);
      }
      for (const b of S.bullets) B.box(g, b.x - 2, b.y - 8, 4, 14, '#ffe066', 2);
      for (const b of S.enemyB) B.box(g, b.x - 2, b.y - 6, 4, 12, '#ff6b6b', 2);
      B.emoji(g, '🚀', S.px, 462, 36);
    },
  });
})();
