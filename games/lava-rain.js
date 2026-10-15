(() => {
  BR.register('lava-rain', {
    howto: '←→ / マウスで🧍を動かし、降ってくる🔥🌋を避けよう\n💎を取るとボーナス。当たると終了。時間とともに雨が激しくなる',
    init(S) {
      S.x = 400; S.drops = []; S.spawn = 0; S.gems = 0;
    },
    update(S, dt, I, B) {
      if (I.ptr.down) S.x = I.ptr.x;
      else S.x += I.dx * 420 * dt;
      S.x = B.clamp(S.x, 24, 776);

      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.spawn = Math.max(0.12, 0.5 - S.t * 0.008);
        const roll = Math.random();
        if (roll < 0.12) S.drops.push({ x: B.rand(40, 760), y: -40, r: 12, vy: 220, kind: 'gem' });
        else if (roll < 0.3) S.drops.push({ x: B.rand(60, 740), y: -60, r: 30, vy: 130 + S.t * 3, kind: 'big' });
        else S.drops.push({ x: B.rand(20, 780), y: -20, r: 10, vy: 260 + S.t * 6, kind: 'fire' });
      }
      for (const d of S.drops) {
        d.y += d.vy * dt;
        if (!B.circHit({ x: S.x, y: 440, r: 18 }, { x: d.x, y: d.y, r: d.r })) continue;
        if (d.kind === 'gem') { d.got = true; S.gems++; S.score += 150; }
        else { S.over = true; S.msg = '焼かれた！'; return; }
      }
      S.drops = S.drops.filter((d) => !d.got && d.y < 540);
      S.score = Math.floor(S.t * 10) + S.gems * 150;
    },
    draw(S, g, W, H, B) {
      const bg = g.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#2b0d0d'); bg.addColorStop(1, '#5c1d0d');
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = '#ff6a00'; g.fillRect(0, 478, W, 22);
      for (const d of S.drops) {
        if (d.kind === 'gem') B.emoji(g, '💎', d.x, d.y, 28);
        else if (d.kind === 'big') B.emoji(g, '🌋', d.x, d.y, 60);
        else B.emoji(g, '🔥', d.x, d.y, 26);
      }
      B.emoji(g, '🧍', S.x, 440, 46);
      B.text(g, `💎 ${S.gems}`, W - 14, 20, 18, '#9ef', 'right', 'bold');
    },
  });
})();
