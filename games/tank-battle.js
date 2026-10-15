(() => {
  const CELL = 40, COLS = 20, ROWS = 12;

  BR.register('tank-battle', {
    howto: '←→ で戦車（🪖）を移動、Space / クリックで砲撃\n敵戦車（🐊）を全部撃破しよう。壁（🧱）は弾で壊せる。被弾3回で終了',
    init(S, B) {
      S.px = 10; S.cool = 0; S.lives = 3; S.bullets = []; S.enemies = []; S.spawnT = 1.5; S.kills = 0;
      S.walls = new Set();
      for (let r = 2; r < ROWS - 3; r++) for (let c = 0; c < COLS; c++) {
        if (B.rand(0, 1) < 0.18 && !(c === 9 || c === 10) && r % 2 === 0) S.walls.add(c + ',' + r);
      }
    },
    update(S, dt, I, B) {
      S.px = B.clamp(S.px + I.dx * 6 * dt, 0, COLS - 1);
      if (I.dx && Math.floor(S.px) < COLS) {
        const cc = Math.round(S.px);
        if (S.walls.has(cc + ',' + (ROWS - 1))) S.px = cc;
      }
      const py = (ROWS - 1) * CELL;
      S.cool -= dt;
      if (I.action() && S.cool <= 0) {
        S.bullets.push({ x: S.px * CELL + CELL / 2, y: py, vy: -460, owner: 'p' });
        S.cool = 0.4;
      }

      S.spawnT -= dt;
      if (S.spawnT <= 0 && S.enemies.length < 4) {
        S.spawnT = Math.max(1.2, 3 - S.kills * 0.1);
        S.enemies.push({ c: B.randi(0, COLS - 1), r: 0, dir: Math.random() < 0.5 ? 1 : -1, t: 0, shot: B.rand(0.8, 2) });
      }
      for (const e of S.enemies) {
        e.t += dt;
        if (e.t > 0.6) {
          e.t = 0;
          const nc = e.c + e.dir;
          if (nc < 0 || nc >= COLS || S.walls.has(nc + ',' + e.r)) e.dir *= -1;
          else e.c = nc;
          if (Math.random() < 0.2) e.r = Math.min(ROWS - 4, e.r + 1);
        }
        e.shot -= dt;
        if (e.shot <= 0) {
          e.shot = B.rand(1.2, 2.2);
          S.bullets.push({ x: e.c * CELL + CELL / 2, y: e.r * CELL + CELL, vy: 300, owner: 'e' });
        }
      }

      for (const b of S.bullets) b.y += b.vy * dt;
      const keep = [];
      for (const b of S.bullets) {
        const c = Math.floor(b.x / CELL), r = Math.floor(b.y / CELL);
        if (b.y < -10 || b.y > ROWS * CELL) continue;
        if (S.walls.has(c + ',' + r)) { S.walls.delete(c + ',' + r); continue; }
        if (b.owner === 'p') {
          const hitE = S.enemies.find((e) => Math.floor(b.x / CELL) === e.c && Math.floor(b.y / CELL) === e.r);
          if (hitE) {
            S.enemies.splice(S.enemies.indexOf(hitE), 1);
            S.kills++; S.score += 100;
            continue;
          }
        } else if (Math.abs(b.x - (S.px * CELL + CELL / 2)) < 16 && Math.abs(b.y - py) < 16) {
          S.lives--;
          if (S.lives <= 0) { S.over = true; S.msg = '撃破された'; return; }
          continue;
        }
        keep.push(b);
      }
      S.bullets = keep;
      if (S.enemies.some((e) => e.r >= ROWS - 4)) { S.over = true; S.msg = '突破された'; return; }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#c2b280'; g.fillRect(0, 0, W, H);
      for (const k of S.walls) {
        const [c, r] = k.split(',').map(Number);
        B.box(g, c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4, '#8b5a2b', 4);
      }
      for (const e of S.enemies) B.emoji(g, '🐊', e.c * CELL + CELL / 2, e.r * CELL + CELL / 2, 32);
      for (const b of S.bullets) {
        g.fillStyle = b.owner === 'p' ? '#ffe066' : '#ff6b6b';
        g.beginPath(); g.arc(b.x, b.y, 4, 0, Math.PI * 2); g.fill();
      }
      B.emoji(g, '🪖', S.px * CELL + CELL / 2, (ROWS - 1) * CELL + CELL / 2, 36);
      B.text(g, `撃破 ${S.kills}　❤️ ${S.lives}`, W / 2, 470, 20, '#2b2118', 'center', 'bold');
    },
  });
})();
