(() => {
  const GRAVITY = 1400;

  BR.register('orangutini-climb', {
    howto: '←→ / マウスでキャラ（🍍）を左右に動かす\n雲の足場に自動で跳ね上がって高く登ろう。落下したら終了',
    init(S, B) {
      S.x = 400; S.y = 440; S.vy = -620; S.camY = 0; S.maxH = 0;
      S.plats = [{ x: 340, y: 470, w: 120 }];
      S.topGen = 430;
    },
    update(S, dt, I, B) {
      if (I.ptr.down) S.x = I.ptr.x;
      else S.x += I.dx * 380 * dt;
      S.x = B.clamp(S.x, 20, 780);

      const prevFeet = S.y + 12;
      S.vy += GRAVITY * dt;
      S.y += S.vy * dt;
      const feet = S.y + 12;
      if (S.vy > 0) {
        for (const p of S.plats) {
          if (prevFeet <= p.y && feet >= p.y && S.x + 20 > p.x && S.x - 20 < p.x + p.w) {
            S.vy = -680;
            S.y = p.y - 12;
            break;
          }
        }
      }

      while (S.topGen > S.camY - 700) {
        S.topGen -= B.rand(70, 105);
        S.plats.push({ x: B.rand(20, 700), y: S.topGen, w: 100 });
      }
      S.plats = S.plats.filter((p) => p.y < S.camY + 600);

      if (S.y < S.camY + 260) S.camY = S.y - 260;
      S.maxH = Math.max(S.maxH, Math.round(440 - S.y));
      S.score = Math.floor(S.maxH / 10);
      if (S.y > S.camY + 520) { S.over = true; S.msg = '落下！'; }
    },
    draw(S, g, W, H, B) {
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#4b3f9e'); sky.addColorStop(1, '#ffb3c6');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      g.save();
      g.translate(0, -S.camY);
      for (const p of S.plats) {
        const sy = p.y;
        if (sy < S.camY - 30 || sy > S.camY + H + 30) continue;
        B.box(g, p.x, sy, p.w, 12, '#ffffff', 6);
        B.box(g, p.x + 8, sy + 6, p.w - 16, 8, '#dfe9ff', 4);
      }
      B.emoji(g, '🍍', S.x, S.y, 44);
      B.emoji(g, '🐒', S.x + 24, S.y - 18, 22);
      g.restore();
      B.text(g, `HEIGHT ${Math.floor(S.maxH / 10)} m`, W / 2, 20, 20, '#fff', 'center', 'bold');
    },
  });
})();
