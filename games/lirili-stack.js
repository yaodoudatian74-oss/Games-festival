(() => {
  const BLOCK_H = 24;
  const BASE_Y = 470;

  BR.register('lirili-stack', {
    howto: 'Space / クリックで積み木を落とす\n下の段と重なった部分だけが残る。ズレすぎると崩壊！',
    init(S) {
      S.stack = [{ x: 300, w: 200 }];
      S.cur = { x: 0, w: 200 };
      S.dir = 1; S.speed = 180; S.debris = [];
    },
    update(S, dt, I, B) {
      const cur = S.cur;
      const top = S.stack[S.stack.length - 1];
      cur.x += S.dir * S.speed * dt;
      if (cur.x < 0) { cur.x = 0; S.dir = 1; }
      if (cur.x + cur.w > 800) { cur.x = 800 - cur.w; S.dir = -1; }

      if (I.action()) {
        const left = Math.max(cur.x, top.x);
        const right = Math.min(cur.x + cur.w, top.x + top.w);
        const w = right - left;
        if (w < 6) {
          S.debris.push({ x: cur.x, w: cur.w, y: BASE_Y - S.stack.length * BLOCK_H, vy: 0 });
          S.over = true; S.msg = 'COLLAPSE';
          return;
        }
        if (cur.x < left) S.debris.push({ x: cur.x, w: left - cur.x, y: BASE_Y - S.stack.length * BLOCK_H, vy: 0 });
        if (cur.x + cur.w > right) S.debris.push({ x: right, w: cur.x + cur.w - right, y: BASE_Y - S.stack.length * BLOCK_H, vy: 0 });
        S.stack.push({ x: left, w });
        S.score = S.stack.length - 1;
        S.speed = Math.min(430, 180 + S.score * 12);
        cur.x = 0; cur.w = w; S.dir = 1;
      }
      for (const d of S.debris) { d.vy += 1200 * dt; d.y += d.vy * dt; }
      S.debris = S.debris.filter((d) => d.y < 560);
    },
    draw(S, g, W, H, B) {
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1d2b53'); bg.addColorStop(1, '#7e2553');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      const off = Math.max(0, S.stack.length - 12) * BLOCK_H;
      const n = S.stack.length;
      S.stack.forEach((b, i) => {
        B.box(g, b.x, BASE_Y - i * BLOCK_H + off, b.w, BLOCK_H - 3, `hsl(${(i * 22) % 360} 80% 60%)`, 5);
      });
      if (!S.over || S.msg !== 'COLLAPSE') {
        const cy = BASE_Y - n * BLOCK_H + off;
        B.box(g, S.cur.x, cy, S.cur.w, BLOCK_H - 3, `hsl(${(n * 22) % 360} 80% 70%)`, 5);
      }
      for (const d of S.debris) B.box(g, d.x, d.y + off, d.w, BLOCK_H - 3, '#ffffff66', 4);
      B.text(g, `TOWER ${S.stack.length - 1}`, W / 2, 20, 20, '#fff', 'center', 'bold');
      B.emoji(g, '🐘', 60, 440, 46);
    },
  });
})();
