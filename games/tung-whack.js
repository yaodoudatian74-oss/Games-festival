(() => {
  BR.register('tung-whack', {
    howto: '穴から飛び出す🪵をクリックして +10点\n🐒を叩くと −20点。制限時間は45秒',
    init(S) {
      S.holes = Array.from({ length: 9 }, (_, i) => ({
        x: 170 + (i % 3) * 230, y: 160 + Math.floor(i / 3) * 120, c: null, life: 0, max: 1,
      }));
      S.left = 45; S.spawn = 0.5; S.pops = [];
    },
    update(S, dt, I, B) {
      S.left -= dt;
      if (S.left <= 0) { S.left = 0; S.over = true; S.msg = 'TIME UP'; return; }

      S.spawn -= dt;
      if (S.spawn <= 0) {
        const free = S.holes.filter((h) => !h.c);
        if (free.length) {
          const h = B.pick(free);
          h.c = Math.random() < 0.25 ? '🐒' : '🪵';
          h.max = h.life = Math.max(0.5, 1.2 - S.t * 0.01);
        }
        S.spawn = Math.max(0.25, 0.7 - S.t * 0.005);
      }
      for (const h of S.holes) {
        if (!h.c) continue;
        h.life -= dt;
        if (h.life <= 0) h.c = null;
      }

      if (I.ptr.clicked) {
        const h = S.holes.find((v) => v.c && Math.hypot(I.ptr.x - v.x, I.ptr.y - v.y) < 55);
        if (h) {
          if (h.c === '🪵') { S.score += 10; S.pops.push({ x: h.x, y: h.y, text: '+10', t: 0.6, color: '#7dff9b' }); }
          else { S.score = Math.max(0, S.score - 20); S.pops.push({ x: h.x, y: h.y, text: '−20', t: 0.6, color: '#ff6b6b' }); }
          h.c = null;
        }
      }
      for (const p of S.pops) p.t -= dt;
      S.pops = S.pops.filter((p) => p.t > 0);
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#2f7d32'; g.fillRect(0, 0, W, H);
      for (const h of S.holes) {
        g.fillStyle = '#1b3d1c';
        g.beginPath(); g.ellipse(h.x, h.y + 8, 62, 30, 0, 0, Math.PI * 2); g.fill();
        if (h.c) {
          const rise = Math.min(1, (h.max - h.life) * 6, h.life * 6);
          B.emoji(g, h.c, h.x, h.y - 10 - rise * 18, 56);
        }
      }
      for (const p of S.pops) B.text(g, p.text, p.x, p.y - 60 - (0.6 - p.t) * 40, 26, p.color, 'center', 'bold');
      B.text(g, `残り ${Math.ceil(S.left)} 秒`, W / 2, 20, 20, '#fff', 'center', 'bold');
    },
  });
})();
