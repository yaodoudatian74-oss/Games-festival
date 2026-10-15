(() => {
  const GROUND = 400;
  const ATK = {
    punch: { key: 'KeyZ', range: 70, dmg: 6, cool: 0.35, stun: 0.2 },
    kick: { key: 'KeyX', range: 92, dmg: 10, cool: 0.7, stun: 0.35 },
  };

  function newRound(S) {
    S.p = { x: 230, y: GROUND, vy: 0, hp: 100, face: 1, cool: 0, hit: 0, atk: null, atkT: 0 };
    S.e = { x: 570, y: GROUND, vy: 0, hp: 100, face: -1, cool: 0, hit: 0, atk: null, atkT: 0, think: 0 };
    S.roundT = 0;
  }

  BR.register('duel-fighter', {
    howto: '←→ で移動、↑ でジャンプ\nZ：パンチ（近距離・速い）　X：キック（遠距離・強い）\n相手のHPを0にすると1ラウンド勝利。5勝で優勝、3敗で終了',
    init(S) {
      S.wins = 0; S.losses = 0; S.banner = 0; S.bannerText = 'ROUND 1';
      newRound(S);
    },
    update(S, dt, I, B) {
      if (S.banner > 0) { S.banner -= dt; return; }
      const p = S.p, e = S.e;

      step(p, dt, I.dx * 230, I.tap('ArrowUp', 'KeyW'));
      p.face = e.x > p.x ? 1 : -1;
      if (I.tap('KeyZ')) strike(p, e, ATK.punch, S);
      if (I.tap('KeyX')) strike(p, e, ATK.kick, S);

      e.think -= dt;
      const dist = Math.abs(e.x - p.x);
      if (e.think <= 0) {
        e.think = B.rand(0.25, 0.6);
        const roll = Math.random();
        if (dist > 120) e.move = 1;
        else if (dist < 60) e.move = roll < 0.4 ? -1 : 0;
        else e.move = roll < 0.3 ? 1 : 0;
        if (dist <= ATK.kick.range && e.cool <= 0 && roll < 0.35) strike(e, p, Math.random() < 0.5 ? ATK.kick : ATK.punch, S);
      }
      const eDir = e.move || 0;
      step(e, dt, eDir * 200, Math.random() < 0.01);
      e.face = p.x > e.x ? 1 : -1;
      if (e.cool <= 0 && dist <= ATK.punch.range && Math.random() < 0.02) strike(e, p, ATK.punch, S);

      [p, e].forEach((f) => {
        f.x = B.clamp(f.x, 30, 770);
        f.cool -= dt; f.hit -= dt; f.atkT -= dt;
        if (f.atkT <= 0) f.atk = null;
      });
      if (Math.abs(p.x - e.x) < 34) {
        const m = (p.x < e.x ? -1 : 1) * (34 - Math.abs(p.x - e.x)) / 2;
        p.x += m; e.x -= m;
      }

      if (p.hp <= 0 || e.hp <= 0) {
        if (e.hp <= 0) S.wins++; else S.losses++;
        S.roundT += dt;
        if (S.wins >= 5 || S.losses >= 3) {
          S.over = true;
          S.msg = S.wins >= 5 ? 'YOU WIN!' : 'YOU LOSE…';
          S.score = S.wins * 1000 - S.losses * 200;
          return;
        }
        S.bannerText = `ROUND ${S.wins + S.losses + 1}`;
        newRound(S);
        S.banner = 1.2;
      }
      S.score = S.wins * 1000 - S.losses * 200;
    },
    draw(S, g, W, H, B) {
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#2b1d4d'); sky.addColorStop(1, '#f28482');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      g.fillStyle = '#3d2b1f'; g.fillRect(0, GROUND + 40, W, H);
      drawFighter(g, B, S.p, '🥊', '#ffe066');
      drawFighter(g, B, S.e, '🐊', '#ff6b6b');
      hpBar(g, 20, 40, 300, S.p.hp, '#ffe066', 'YOU');
      hpBar(g, W - 320, 40, 300, S.e.hp, '#ff6b6b', 'CPU', true);
      B.text(g, `${S.wins}勝 ${S.losses}敗`, W / 2, 26, 18, '#fff', 'center', 'bold');
      if (S.banner > 0) B.text(g, S.bannerText, W / 2, H / 2 - 40, 46, '#fff', 'center', '800');
      B.text(g, 'Z:パンチ　X:キック　↑:ジャンプ', W / 2, 470, 16, '#fff', 'center');
    },
  });

  function step(f, dt, vx, jump) {
    if (jump && f.y >= GROUND) f.vy = -560;
    f.vy += 1400 * dt;
    f.y += f.vy * dt;
    if (f.y > GROUND) { f.y = GROUND; f.vy = 0; }
    if (f.hit <= 0) f.x += vx * dt;
  }

  function strike(a, b, atk, S) {
    if (a.cool > 0 || a.hit > 0) return;
    a.cool = atk.cool;
    a.atk = atk; a.atkT = 0.18;
    const dist = Math.abs(a.x - b.x);
    if (dist <= atk.range && b.hit <= 0) {
      b.hp = Math.max(0, b.hp - atk.dmg);
      b.hit = atk.stun;
      b.x += (b.x > a.x ? 1 : -1) * 14;
    }
  }

  function drawFighter(g, B, f, e, color) {
    B.emoji(g, e, f.x, f.y - 56, 60);
    if (f.atk) {
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.beginPath();
      g.arc(f.x + f.face * 40, f.y - 52, f.atk === ATK.kick ? 20 : 12, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = color; g.fillRect(f.x - 14, GROUND + 38, 28, 4);
  }

  function hpBar(g, x, y, w, hp, color, label, right) {
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x, y, w, 18);
    g.fillStyle = color; g.fillRect(right ? x + w - w * hp / 100 : x, y, w * hp / 100, 18);
    g.font = `bold 14px ${BR.FONT}`; g.fillStyle = '#fff';
    g.textAlign = right ? 'right' : 'left'; g.textBaseline = 'bottom';
    g.fillText(`${label} ${Math.round(hp)}`, right ? x + w : x, y - 2);
  }
})();
