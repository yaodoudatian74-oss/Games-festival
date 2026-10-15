(() => {
  const SLING = { x: 110, y: 380 };
  const GROUND = 470;
  const G = 620;

  function makeTargets() {
    const t = [];
    for (let i = 0; i < 3; i++) {
      const x = 470 + i * 110;
      for (let r = 0; r < 3; r++) {
        t.push({ x, y: GROUND - (r + 1) * 40, w: 36, h: 36, hp: 1, e: '🧱' });
      }
    }
    t.push({ x: 600, y: 180, w: 40, h: 40, hp: 1, e: '🐊' });
    t.push({ x: 690, y: 370, w: 40, h: 40, hp: 1, e: '🐷' });
    return t;
  }

  BR.register('slingshot-brainrot', {
    howto: 'マウスで🍌をドラッグして引っ張り、離して発射\n標的（🧱🐊🐷）をすべて倒そう。発射は6回まで',
    init(S) {
      S.shots = 6; S.targets = makeTargets(); S.balls = [];
      S.dragging = false; S.drag = { x: SLING.x, y: SLING.y }; S.wasDown = false;
    },
    update(S, dt, I, B) {
      const p = I.ptr;
      const dist = Math.hypot(p.x - SLING.x, p.y - SLING.y);
      if (p.down && !S.wasDown && dist < 90 && S.shots > 0 && S.balls.length === 0) S.dragging = true;
      if (S.dragging && p.down) {
        S.drag.x = B.clamp(p.x, SLING.x - 110, SLING.x + 40);
        S.drag.y = B.clamp(p.y, SLING.y - 110, SLING.y + 110);
      }
      if (S.dragging && !p.down) {
        S.dragging = false;
        const vx = (SLING.x - S.drag.x) * 6, vy = (SLING.y - S.drag.y) * 6;
        if (Math.hypot(vx, vy) > 60) {
          S.balls.push({ x: S.drag.x, y: S.drag.y, vx, vy, t: 0 });
          S.shots--;
        }
        S.drag = { x: SLING.x, y: SLING.y };
      }
      S.wasDown = p.down;

      for (const b of S.balls) {
        b.t += dt;
        b.vy += G * dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        for (const tg of S.targets) {
          if (tg.hp <= 0) continue;
          if (B.circHit({ x: b.x, y: b.y, r: 12 }, { x: tg.x + tg.w / 2, y: tg.y + tg.h / 2, r: tg.w / 2 })) {
            tg.hp = 0;
            S.score += tg.e === '🧱' ? 50 : 200;
            b.vx *= 0.6; b.vy *= 0.6;
          }
        }
        if (b.y > GROUND - 12) { b.y = GROUND - 12; b.vy = -Math.abs(b.vy) * 0.3; b.vx *= 0.7; }
      }
      S.balls = S.balls.filter((b) => b.t < 6 && b.x < 830 && b.x > -40);
      S.targets = S.targets.filter((t) => t.hp > 0);

      if (S.targets.length === 0) { S.over = true; S.msg = 'CLEAR!'; S.score += S.shots * 100; return; }
      if (S.shots === 0 && S.balls.length === 0) { S.over = true; S.msg = '弾切れ'; }
    },
    draw(S, g, W, H, B) {
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#7ec8ff'); sky.addColorStop(1, '#e8f7ff');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      g.fillStyle = '#7bc96f'; g.fillRect(0, GROUND, W, H - GROUND);
      for (const tg of S.targets) B.emoji(g, tg.e, tg.x + tg.w / 2, tg.y + tg.h / 2, tg.w * 1.05);

      g.strokeStyle = '#6b4226'; g.lineWidth = 8;
      g.beginPath(); g.moveTo(SLING.x - 12, SLING.y - 40); g.lineTo(SLING.x, SLING.y + 10); g.lineTo(SLING.x + 12, SLING.y - 40); g.stroke();
      if (S.dragging) {
        g.strokeStyle = 'rgba(0,0,0,0.5)'; g.setLineDash([6, 6]); g.lineWidth = 2;
        g.beginPath(); g.moveTo(SLING.x, SLING.y); g.lineTo(S.drag.x, S.drag.y); g.stroke(); g.setLineDash([]);
        const vx = (SLING.x - S.drag.x) * 6, vy = (SLING.y - S.drag.y) * 6;
        g.fillStyle = 'rgba(0,0,0,0.35)';
        for (let i = 1; i <= 6; i++) {
          const t = i * 0.05;
          g.beginPath(); g.arc(S.drag.x + vx * t, S.drag.y + vy * t + 0.5 * G * t * t, 3, 0, Math.PI * 2); g.fill();
        }
      }
      B.emoji(g, '🍌', S.dragging ? S.drag.x : SLING.x, S.dragging ? S.drag.y : SLING.y - 14, 32);
      for (const b of S.balls) B.emoji(g, '🍌', b.x, b.y, 28);
      B.text(g, `残り発射 ${S.shots}`, W / 2, 20, 20, '#fff', 'center', 'bold');
    },
  });
})();
