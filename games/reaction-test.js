(() => {
  const ROUNDS = 5;

  BR.register('reaction-test', {
    howto: '画面が🟢（緑）に変わったら、すぐ Space / クリック！\n赤い間に押すとフライング。5回の平均反応速度でスコアが決まる',
    init(S, B) {
      S.round = 0; S.times = []; S.stage = 'wait'; S.wait = B.rand(1.5, 3.5);
      S.early = 0; S.resT = 0; S.goT = 0; S.last = null;
    },
    update(S, dt, I, B) {
      if (S.early > 0) S.early -= dt;

      if (S.stage === 'wait') {
        if (I.action()) {
          S.early = 1.0;
          S.wait = B.rand(1.5, 3.0);
          return;
        }
        S.wait -= dt;
        if (S.wait <= 0) { S.stage = 'go'; S.goT = S.t; }
        return;
      }
      if (S.stage === 'go') {
        if (I.action()) {
          const ms = Math.round((S.t - S.goT) * 1000);
          S.times.push(ms);
          S.last = ms;
          S.stage = 'result';
          S.resT = 1.2;
        }
        return;
      }
      S.resT -= dt;
      if (S.resT <= 0) {
        S.round++;
        if (S.round >= ROUNDS) {
          const avg = S.times.reduce((a, b) => a + b, 0) / S.times.length;
          S.score = Math.max(0, Math.round(1000 - avg));
          S.over = true;
          S.msg = `平均 ${Math.round(avg)} ms`;
          return;
        }
        S.stage = 'wait';
        S.wait = B.rand(1.5, 3.5);
      }
    },
    draw(S, g, W, H, B) {
      let bg = '#7f1d1d', main = 'まだ…', sub = '赤いうちは待とう';
      if (S.stage === 'go') { bg = '#15803d'; main = 'いま！'; sub = 'Space / クリック'; }
      if (S.stage === 'result') { bg = '#1e3a8a'; main = `${S.last} ms`; sub = '次のラウンドへ…'; }
      if (S.stage === 'wait' && S.early > 0) { bg = '#92400e'; main = 'フライング！'; sub = '赤いうちは押さない'; }
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      B.text(g, main, W / 2, H / 2 - 20, 56, '#fff', 'center', '800');
      B.text(g, sub, W / 2, H / 2 + 40, 22, '#fff', 'center', 'bold');
      B.text(g, `ラウンド ${Math.min(S.round + 1, ROUNDS)} / ${ROUNDS}`, W / 2, 470, 18, '#fff', 'center', 'bold');
    },
  });
})();
