(() => {
  const SHOP = [
    { key: 'auto', name: '自動叩き', base: 50, desc: '+1コイン/秒（1段階ごと）' },
    { key: 'power', name: '叩き力アップ', base: 30, desc: '+1コイン/クリック（1段階ごと）' },
    { key: 'gold', name: '黄金の🪵', base: 500, desc: '+8コイン/秒（1段階ごと）' },
  ];
  const BTN = { x: 260, y: 250, r: 95 };
  const costOf = (S, i) => Math.round(SHOP[i].base * Math.pow(2.2, S.lv[SHOP[i].key]));

  BR.register('baraboom-clicker', {
    howto: '🪵をクリック / Space で叩いてコインを稼ぐ\n右のショップで自動化・強化（1〜3キーでも購入）。制限時間180秒',
    init(S) {
      S.coins = 0; S.total = 0; S.left = 180; S.lv = { auto: 0, power: 0, gold: 0 }; S.pops = [];
    },
    update(S, dt, I, B) {
      S.left -= dt;
      if (S.left <= 0) { S.left = 0; S.over = true; S.msg = 'TIME UP'; }

      const power = 1 + S.lv.power;
      const perSec = S.lv.auto + S.lv.gold * 8;
      const gain = perSec * dt;
      S.coins += gain; S.total += gain;

      const click = (I.tap('Space') || (I.ptr.clicked && Math.hypot(I.ptr.x - BTN.x, I.ptr.y - BTN.y) < BTN.r));
      if (click) {
        S.coins += power; S.total += power;
        S.pops.push({ x: BTN.x + B.rand(-60, 60), y: BTN.y - 80, text: `+${power}`, t: 0.7 });
      }
      SHOP.forEach((item, i) => {
        const y = 110 + i * 110;
        const hit = I.ptr.clicked && I.ptr.x >= 520 && I.ptr.x <= 780 && I.ptr.y >= y && I.ptr.y <= y + 92;
        if ((hit || I.tap(`Digit${i + 1}`)) && S.coins >= costOf(S, i)) {
          S.coins -= costOf(S, i);
          S.lv[item.key]++;
        }
      });
      for (const p of S.pops) { p.t -= dt; p.y -= 40 * dt; }
      S.pops = S.pops.filter((p) => p.t > 0);
      S.score = Math.floor(S.total);
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#2a1b12'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#3d2a1c'; g.fillRect(500, 0, 300, H);
      const pulse = 1 + Math.sin(S.t * 6) * 0.02;
      g.save(); g.translate(BTN.x, BTN.y); g.scale(pulse, pulse);
      g.beginPath(); g.arc(0, 0, BTN.r, 0, Math.PI * 2); g.fillStyle = '#c08552'; g.fill();
      g.restore();
      B.emoji(g, '🪵', BTN.x, BTN.y, 130);
      for (const p of S.pops) B.text(g, p.text, p.x, p.y, 24, '#ffe066', 'center', 'bold');

      B.text(g, `💰 ${Math.floor(S.coins).toLocaleString()}`, 40, 40, 30, '#ffe066', 'left', 'bold');
      B.text(g, `毎秒 ${S.lv.auto + S.lv.gold * 8}　クリック ${1 + S.lv.power}`, 40, 80, 17, '#fff', 'left');
      B.text(g, `残り ${Math.ceil(S.left)} 秒`, 40, 460, 18, '#fff', 'left', 'bold');

      SHOP.forEach((item, i) => {
        const y = 110 + i * 110;
        const can = S.coins >= costOf(S, i);
        B.box(g, 520, y, 260, 92, can ? '#5b3d26' : '#33241a', 12);
        B.text(g, `${i + 1}. ${item.name}  Lv${S.lv[item.key]}`, 534, y + 22, 17, '#fff', 'left', 'bold');
        B.text(g, item.desc, 534, y + 48, 13, '#ddd', 'left');
        B.text(g, `費用 ${costOf(S, i).toLocaleString()}`, 534, y + 72, 15, can ? '#7dff9b' : '#999', 'left', 'bold');
      });
    },
  });
})();
