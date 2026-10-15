(() => {
  const KEYS = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
  const COLORS = ['#ff6b9d', '#ffd166', '#06d6a0', '#7b8cff'];
  const LANE_X = [250, 350, 450, 550];
  const JUDGE_Y = 420;

  BR.register('cappuccina-rhythm', {
    howto: 'D F J K でノーツを判定ラインで押そう\nPERFECT / GOOD でコンボ増加。ミスを10回すると失敗',
    init(S) {
      S.notes = []; S.spawn = 1; S.combo = 0; S.maxCombo = 0; S.miss = 0;
      S.flash = [0, 0, 0, 0]; S.judge = null;
    },
    update(S, dt, I, B) {
      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.notes.push({ lane: B.randi(0, 3), y: -20 });
        S.spawn = Math.max(0.28, 0.6 - S.t * 0.005);
      }
      const speed = 240 + S.t * 3;
      for (const n of S.notes) n.y += speed * dt;

      KEYS.forEach((k, lane) => {
        if (!I.tap(k)) return;
        S.flash[lane] = 0.12;
        let best = null, bd = 999;
        for (const n of S.notes) {
          if (n.lane !== lane) continue;
          const d = Math.abs(n.y - JUDGE_Y);
          if (d < 40 && d < bd) { bd = d; best = n; }
        }
        if (best) {
          S.notes.splice(S.notes.indexOf(best), 1);
          S.combo++;
          S.maxCombo = Math.max(S.maxCombo, S.combo);
          const perfect = bd < 12;
          S.score += 100 + S.combo * 5 + (perfect ? 50 : 0);
          S.judge = { text: perfect ? 'PERFECT' : 'GOOD', t: 0.4, color: perfect ? '#ffd166' : '#06d6a0' };
        } else {
          S.combo = 0;
        }
      });

      S.notes = S.notes.filter((n) => {
        if (n.y > 462) { S.combo = 0; S.miss++; S.judge = { text: 'MISS', t: 0.4, color: '#ff6b6b' }; return false; }
        return true;
      });
      if (S.miss >= 10) { S.over = true; S.msg = 'FAILED'; }
      S.flash = S.flash.map((v) => Math.max(0, v - dt));
      if (S.judge) { S.judge.t -= dt; if (S.judge.t <= 0) S.judge = null; }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#120b2a'; g.fillRect(0, 0, W, H);
      LANE_X.forEach((x, i) => {
        g.fillStyle = S.flash[i] > 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)';
        g.fillRect(x - 50, 0, 100, H);
      });
      g.fillStyle = '#ffffff'; g.fillRect(200, JUDGE_Y, 400, 3);
      for (const n of S.notes) {
        B.box(g, LANE_X[n.lane] - 42, n.y - 9, 84, 18, COLORS[n.lane], 9);
      }
      LANE_X.forEach((x, i) => {
        B.box(g, x - 40, 455, 80, 34, S.flash[i] > 0 ? COLORS[i] : '#2a2250', 8);
        B.text(g, 'DFJK'[i], x, 472, 20, '#fff', 'center', 'bold');
      });
      if (S.judge) B.text(g, S.judge.text, W / 2, 300, 34, S.judge.color, 'center', '800');
      B.text(g, `COMBO ${S.combo}　MISS ${S.miss}/10`, W / 2, 60, 18, '#ffe066', 'center', 'bold');
      B.emoji(g, '🩰', 110, 260, 90);
    },
  });
})();
