(() => {
  const SYM = ['🦈', '🐊', '🪵', '🐒', '🩰', '🐘', '🪿', '🌵'];

  BR.register('patapim-memory', {
    howto: 'カードをクリックして同じ絵柄のペアを探そう\n手数が少ないほど、クリアボーナスが高い',
    init(S, B) {
      const deck = B.shuffle([...SYM, ...SYM]);
      S.cards = deck.map((s, i) => ({
        s, x: 80 + (i % 4) * 170, y: 60 + Math.floor(i / 4) * 105, open: false, done: false,
      }));
      S.open = []; S.moves = 0; S.wait = 0; S.matched = 0;
    },
    update(S, dt, I, B) {
      if (S.wait > 0) {
        S.wait -= dt;
        if (S.wait <= 0) {
          S.open.forEach((c) => { c.open = false; });
          S.open = [];
        }
        return;
      }
      if (!I.ptr.clicked) return;
      const c = S.cards.find((v) => !v.open && !v.done
        && I.ptr.x >= v.x && I.ptr.x <= v.x + 130 && I.ptr.y >= v.y && I.ptr.y <= v.y + 95);
      if (!c) return;

      c.open = true;
      S.open.push(c);
      if (S.open.length < 2) return;

      S.moves++;
      if (S.open[0].s === S.open[1].s) {
        S.open.forEach((v) => { v.done = true; });
        S.open = [];
        S.matched++;
        S.score += 100;
        if (S.matched === SYM.length) {
          S.score += Math.max(0, 800 - S.moves * 20);
          S.over = true; S.msg = 'CLEAR!';
        }
      } else {
        S.wait = 0.8;
      }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#1b2440'; g.fillRect(0, 0, W, H);
      B.text(g, `手数 ${S.moves}`, W / 2, 30, 20, '#fff', 'center', 'bold');
      for (const c of S.cards) {
        if (c.open || c.done) {
          B.box(g, c.x, c.y, 130, 95, c.done ? '#2b6e4f' : '#fff8e7', 12);
          B.emoji(g, c.s, c.x + 65, c.y + 48, 46);
        } else {
          B.box(g, c.x, c.y, 130, 95, '#3b4f9e', 12);
          B.text(g, '?', c.x + 65, c.y + 48, 40, 'rgba(255,255,255,0.5)', 'center', 'bold');
        }
      }
    },
  });
})();
