(() => {
  const BAR = { x: 100, y: 250, w: 600, h: 60 };

  function newZone(S, B) {
    const w = Math.max(0.07, 0.22 - S.catches * 0.012);
    return { c: B.rand(0.15 + w / 2, 0.85 - w / 2), w };
  }

  BR.register('croco-fishing', {
    howto: 'Space / クリックでマーカーを止める（🐟のゾーンに止めると釣れる）\n失敗は3回まで。成功するほどゾーンが狭く、マーカーが速くなる',
    init(S, B) {
      S.pos = 0; S.dir = 1; S.speed = 0.75; S.catches = 0; S.combo = 0; S.miss = 0;
      S.zone = newZone(S, B); S.judge = null; S.fish = [];
    },
    update(S, dt, I, B) {
      S.pos += S.dir * S.speed * dt;
      if (S.pos >= 1) { S.pos = 1; S.dir = -1; }
      if (S.pos <= 0) { S.pos = 0; S.dir = 1; }

      if (S.judge) { S.judge.t -= dt; if (S.judge.t <= 0) S.judge = null; }
      if (!I.action()) return;

      const hit = Math.abs(S.pos - S.zone.c) <= S.zone.w / 2;
      if (hit) {
        S.catches++;
        S.combo++;
        S.score += 100 * Math.min(S.combo, 5);
        S.fish.push('🐟');
        S.judge = { text: `GET! コンボ ${S.combo}`, t: 0.8, color: '#7dff9b' };
        S.speed = Math.min(1.8, 0.75 + S.catches * 0.07);
        S.zone = newZone(S, B);
      } else {
        S.combo = 0;
        S.miss++;
        S.judge = { text: 'にがした…', t: 0.8, color: '#ff6b6b' };
        if (S.miss >= 3) { S.over = true; S.msg = 'ゲームオーバー'; }
      }
    },
    draw(S, g, W, H, B) {
      const water = g.createLinearGradient(0, 0, 0, H);
      water.addColorStop(0, '#0a4a6e'); water.addColorStop(1, '#03213a');
      g.fillStyle = water; g.fillRect(0, 0, W, H);
      B.emoji(g, '🐊', 80, 150, 60);

      B.box(g, BAR.x, BAR.y, BAR.w, BAR.h, 'rgba(0,0,0,0.35)', 14);
      B.box(g, BAR.x + S.zone.c * BAR.w - S.zone.w * BAR.w / 2, BAR.y, S.zone.w * BAR.w, BAR.h, '#2ecc71', 10);
      B.box(g, BAR.x + S.pos * BAR.w - 4, BAR.y - 10, 8, BAR.h + 20, '#fff', 4);
      B.text(g, 'Space でとめる', W / 2, 200, 20, '#cfe8ff', 'center', 'bold');

      if (S.judge) B.text(g, S.judge.text, W / 2, 360, 30, S.judge.color, 'center', '800');
      B.text(g, `ミス ${S.miss} / 3`, 40, 460, 20, '#ffb3b3', 'left', 'bold');
      B.text(g, S.fish.slice(-12).join(' '), W / 2, 430, 22, '#fff', 'center');
    },
  });
})();
