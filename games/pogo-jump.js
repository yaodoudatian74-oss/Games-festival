(() => {
  const GRAV = 900, MAX_CHARGE = 1.2;

  BR.register('pogo-jump', {
    howto: 'Space / クリックを押し続けて溜め、離すとジャンプ（溜めるほど高く跳ぶ）\n←→ で跳ぶ方向を決める。足場に着地して、上へ上へ！',
    init(S, B) {
      S.x = 400; S.y = 440; S.vx = 0; S.vy = 0; S.onGround = true;
      S.charge = 0; S.dir = 1; S.camY = 0; S.maxH = 0;
      S.plats = [{ x: 310, y: 470, w: 180 }];
      S.topGen = 400;
    },
    update(S, dt, I, B) {
      if (S.onGround) {
        if (I.held('ArrowLeft', 'KeyA')) S.dir = -1;
        if (I.held('ArrowRight', 'KeyD')) S.dir = 1;
        if (I.held('Space') || (I.ptr.down && I.ptr.y > 0)) {
          S.charge = Math.min(MAX_CHARGE, S.charge + dt);
        } else if (S.charge > 0) {
          const p = S.charge / MAX_CHARGE;
          S.vy = -(260 + p * 640);
          S.vx = S.dir * (80 + p * 300);
          S.onGround = false;
          S.charge = 0;
        }
      } else {
        if (I.held('ArrowLeft', 'KeyA')) S.vx -= 300 * dt * 0.3;
        if (I.held('ArrowRight', 'KeyD')) S.vx += 300 * dt * 0.3;
      }

      const prevFeet = S.y + 12;
      S.vy += GRAV * dt;
      S.x += S.vx * dt;
      S.y += S.vy * dt;
      S.x = B.clamp(S.x, 20, 780);

      if (S.vy > 0) {
        for (const p of S.plats) {
          const feet = S.y + 12;
          if (prevFeet <= p.y && feet >= p.y && S.x + 16 > p.x && S.x - 16 < p.x + p.w) {
            S.y = p.y - 12; S.vy = 0; S.vx *= 0.3; S.onGround = true;
            break;
          }
        }
      }
      if (S.onGround && S.vy === 0) {
        S.plats.forEach((p) => { if (Math.abs(S.y + 12 - p.y) < 1 && S.x + 16 > p.x && S.x - 16 < p.x + p.w) S.onGround = true; });
      }

      while (S.topGen > S.camY - 700) {
        S.topGen -= B.rand(90, 130);
        S.plats.push({ x: B.rand(20, 680), y: S.topGen, w: B.rand(90, 150) });
      }
      S.plats = S.plats.filter((p) => p.y < S.camY + 600);

      if (S.y < S.camY + 260) S.camY = S.y - 260;
      S.maxH = Math.max(S.maxH, Math.round(440 - S.y));
      S.score = Math.floor(S.maxH / 10);
      if (S.y > S.camY + 540) { S.over = true; S.msg = '落下！'; }
    },
    draw(S, g, W, H, B) {
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0f2027'); sky.addColorStop(1, '#2c5364');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      g.save();
      g.translate(0, -S.camY);
      for (const p of S.plats) {
        if (p.y < S.camY - 30 || p.y > S.camY + H + 30) continue;
        B.box(g, p.x, p.y, p.w, 12, '#9d8189', 6);
      }
      if (S.onGround && S.charge > 0) {
        g.fillStyle = 'rgba(255,224,102,0.9)';
        g.fillRect(S.x - 22, S.y - 40, 44 * (S.charge / MAX_CHARGE), 6);
      }
      B.emoji(g, '🦘', S.x, S.y, 44);
      g.restore();
      B.text(g, `HEIGHT ${Math.floor(S.maxH / 10)} m　チャージ ${Math.round(S.charge / MAX_CHARGE * 100)}%`, W / 2, 20, 18, '#fff', 'center', 'bold');
    },
  });
})();
