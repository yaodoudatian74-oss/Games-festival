(() => {
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SUITS = ['♠', '♥', '♦', '♣'];
  const BET = 100, START = 1000, TARGET = 2000;

  const draw = (B) => ({ r: B.randi(0, 12), s: B.pick(SUITS) });
  const value = (hand) => {
    let total = 0, aces = 0;
    for (const c of hand) {
      if (c.r === 0) { aces++; total += 11; }
      else if (c.r >= 10) total += 10;
      else total += c.r + 1;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  };
  const rankName = (c) => RANKS[c.r];

  BR.register('blackjack', {
    howto: 'Space で賭けて配札（1ラウンド100コイン）\nH（またはボタン左）でヒット、S（右）でスタンド。ディーラーは17以上で止まる\n2000コイン到達で勝利、100コイン未満で終了',
    init(S, B) {
      S.bank = START; S.phase = 'bet'; S.player = []; S.dealer = []; S.result = ''; S.rounds = 0;
    },
    update(S, dt, I, B) {
      if (S.bank >= TARGET) { S.over = true; S.msg = '目標達成！'; return; }
      if (S.bank < BET) { S.over = true; S.msg = '破産…'; return; }

      if (S.phase === 'bet') {
        if (I.action() || (I.ptr.clicked && inRect(I.ptr, 300, 400, 200, 60))) {
          S.bank -= BET;
          S.player = [draw(B), draw(B)];
          S.dealer = [draw(B), draw(B)];
          S.phase = 'player';
          S.result = '';
          if (value(S.player) === 21) settle(S, 'BLACKJACK！', 2.5);
        }
        return;
      }

      if (S.phase === 'player') {
        const hit = I.tap('KeyH') || (I.ptr.clicked && inRect(I.ptr, 120, 400, 160, 60));
        const stand = I.tap('KeyS') || (I.ptr.clicked && inRect(I.ptr, 520, 400, 160, 60));
        if (hit) {
          S.player.push(draw(B));
          if (value(S.player) > 21) settle(S, 'バースト…', 0);
        } else if (stand) {
          while (value(S.dealer) < 17) S.dealer.push(draw(B));
          const pv = value(S.player), dv = value(S.dealer);
          if (dv > 21 || pv > dv) settle(S, '勝ち！', 2);
          else if (pv === dv) settle(S, '引き分け', 1);
          else settle(S, '負け…', 0);
        }
      }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#14532d'; g.fillRect(0, 0, W, H);
      B.text(g, 'ディーラー', 40, 40, 18, '#cfe', 'left', 'bold');
      const dvHide = S.phase === 'player';
      S.dealer.forEach((c, i) => {
        if (i === 1 && dvHide) drawCard(g, B, 40 + i * 90, 60, null);
        else drawCard(g, B, 40 + i * 90, 60, c);
      });
      if (S.dealer.length && !dvHide) B.text(g, `合計 ${value(S.dealer)}`, 40, 200, 18, '#fff', 'left', 'bold');

      B.text(g, 'あなた', 40, 240, 18, '#cfe', 'left', 'bold');
      S.player.forEach((c, i) => drawCard(g, B, 40 + i * 90, 260, c));
      if (S.player.length) B.text(g, `合計 ${value(S.player)}`, 40, 390, 18, '#fff', 'left', 'bold');

      if (S.phase === 'bet') button(g, B, 300, 400, 200, 60, 'Space: 賭ける', '#f59e0b');
      if (S.phase === 'player') {
        button(g, B, 120, 400, 160, 60, 'ヒット (H)', '#2563eb');
        button(g, B, 520, 400, 160, 60, 'スタンド (S)', '#dc2626');
      }
      if (S.result) B.text(g, S.result, W / 2, 230, 34, '#ffe066', 'center', '800');
      B.text(g, `所持金 ${S.bank}　目標 ${TARGET}`, W - 20, 470, 20, '#fff', 'right', 'bold');
      B.text(g, `ラウンド ${S.rounds}`, 20, 470, 16, '#cfe', 'left');
    },
  });

  // mult は賭け金に対する払い戻し倍率（負け0 / 引き分け1 / 勝ち2 / ブラックジャック2.5）
  function settle(S, text, mult) {
    S.bank += BET * mult;
    S.rounds++;
    S.result = text;
    S.phase = 'bet';
    S.score = S.bank;
  }
  function inRect(p, x, y, w, h) {
    return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
  }
  function button(g, B, x, y, w, h, label, color) {
    B.box(g, x, y, w, h, color, 12);
    B.text(g, label, x + w / 2, y + h / 2, 19, '#fff', 'center', 'bold');
  }
  function drawCard(g, B, x, y, c) {
    B.box(g, x, y, 76, 108, c ? '#fff' : '#1e3a8a', 10);
    if (!c) return;
    const red = c.s === '♥' || c.s === '♦';
    B.text(g, rankName(c), x + 10, y + 18, 20, red ? '#dc2626' : '#111', 'left', 'bold');
    B.text(g, c.s, x + 38, y + 56, 30, red ? '#dc2626' : '#111', 'center');
  }
})();
