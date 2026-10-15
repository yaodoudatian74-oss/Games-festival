(() => {
  const PATH = [[-30, 110], [200, 110], [200, 330], [560, 330], [560, 150], [830, 150]];
  const SEG = [];
  let TOTAL = 0;
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, ay] = PATH[i], [bx, by] = PATH[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    SEG.push({ ax, ay, bx, by, start: TOTAL, len });
    TOTAL += len;
  }
  const posAt = (d) => {
    for (const s of SEG) {
      if (d <= s.start + s.len) {
        const t = (d - s.start) / s.len;
        return { x: s.ax + (s.bx - s.ax) * t, y: s.ay + (s.by - s.ay) * t };
      }
    }
    return { x: PATH[PATH.length - 1][0], y: PATH[PATH.length - 1][1] };
  };
  const distToPath = (x, y) => {
    let best = Infinity;
    for (const s of SEG) {
      const dx = s.bx - s.ax, dy = s.by - s.ay;
      const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (y - s.ay) * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(x - (s.ax + dx * t), y - (s.ay + dy * t)));
    }
    return best;
  };

  BR.register('lirili-defense', {
    howto: 'クリックで草地に🌵タワーを設置（50コイン）\n道を進む敵を倒そう。敵がゴールに着くとライフ−1',
    init(S) {
      S.coins = 120; S.lives = 10; S.towers = []; S.enemies = []; S.kills = 0;
      S.wave = 0; S.spawnLeft = 0; S.spawnT = 0; S.waitT = 2; S.flashes = [];
    },
    update(S, dt, I, B) {
      if (I.ptr.clicked && S.coins >= 50) {
        const x = I.ptr.x, y = I.ptr.y;
        const onTower = S.towers.some((t) => Math.hypot(t.x - x, t.y - y) < 36);
        if (y > 20 && y < 480 && distToPath(x, y) > 34 && !onTower) {
          S.towers.push({ x, y, cool: 0 });
          S.coins -= 50;
        }
      }

      if (S.spawnLeft === 0 && S.enemies.length === 0) {
        S.waitT -= dt;
        if (S.waitT <= 0) {
          S.wave++;
          S.spawnLeft = 4 + S.wave * 2;
          S.spawnT = 0;
          S.waitT = 4;
        }
      }
      if (S.spawnLeft > 0) {
        S.spawnT -= dt;
        if (S.spawnT <= 0) {
          S.spawnT = Math.max(0.35, 0.9 - S.wave * 0.03);
          S.spawnLeft--;
          const boss = S.wave % 5 === 0 && S.spawnLeft === 0;
          S.enemies.push({
            d: 0, hp: (boss ? 180 : 20) + S.wave * 8, max: (boss ? 180 : 20) + S.wave * 8,
            sp: 60 + S.wave * 4 + (boss ? -20 : 0), e: boss ? '🐘' : (Math.random() < 0.5 ? '🐒' : '🦈'),
          });
        }
      }

      for (const e of S.enemies) e.d += e.sp * dt;
      S.enemies = S.enemies.filter((e) => {
        if (e.d >= TOTAL) { S.lives--; return false; }
        return true;
      });
      if (S.lives <= 0) { S.over = true; S.msg = '侵入された'; return; }

      for (const t of S.towers) {
        t.cool -= dt;
        if (t.cool > 0) continue;
        let target = null, bestD = Infinity;
        for (const e of S.enemies) {
          const p = posAt(e.d);
          const dd = Math.hypot(p.x - t.x, p.y - t.y);
          if (dd < 140 && dd < bestD) { bestD = dd; target = { e, p }; }
        }
        if (!target) continue;
        t.cool = 0.6;
        target.e.hp -= 14;
        S.flashes.push({ x1: t.x, y1: t.y, x2: target.p.x, y2: target.p.y, t: 0.12 });
        if (target.e.hp <= 0) {
          S.enemies.splice(S.enemies.indexOf(target.e), 1);
          S.kills++;
          S.coins += 8 + S.wave;
          S.score += 10 + S.wave;
        }
      }
      for (const f of S.flashes) f.t -= dt;
      S.flashes = S.flashes.filter((f) => f.t > 0);
      S.score = S.kills * 10 + S.wave * 50;
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#4f7d3a'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#d9b26f'; g.lineWidth = 46; g.lineJoin = 'round';
      g.beginPath();
      PATH.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      for (const t of S.towers) {
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(t.x, t.y + 4, 22, 0, Math.PI * 2); g.fill();
        B.emoji(g, '🌵', t.x, t.y, 40);
      }
      for (const e of S.enemies) {
        const p = posAt(e.d);
        B.emoji(g, e.e, p.x, p.y, 34);
        const w = 34;
        g.fillStyle = '#300'; g.fillRect(p.x - w / 2, p.y - 30, w, 5);
        g.fillStyle = '#6f6'; g.fillRect(p.x - w / 2, p.y - 30, w * Math.max(0, e.hp) / e.max, 5);
      }
      g.strokeStyle = '#ffe066'; g.lineWidth = 3;
      for (const f of S.flashes) { g.beginPath(); g.moveTo(f.x1, f.y1); g.lineTo(f.x2, f.y2); g.stroke(); }
      B.text(g, `💰 ${S.coins}　❤️ ${S.lives}　WAVE ${S.wave}`, W / 2, 20, 19, '#fff', 'center', 'bold');
      if (S.spawnLeft === 0 && S.enemies.length === 0) {
        B.text(g, `次の波まで ${Math.ceil(S.waitT)} 秒`, W / 2, 470, 18, '#ffe066', 'center', 'bold');
      }
    },
  });
})();
