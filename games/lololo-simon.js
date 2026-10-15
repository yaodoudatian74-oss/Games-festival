(() => {
  const KEYS = ['KeyQ', 'KeyE', 'KeyZ', 'KeyC'];
  const PADS = [
    { x: 200, y: 50, color: '#ff4d6d', dim: '#5c1a2a', label: 'Q' },
    { x: 410, y: 50, color: '#4dff88', dim: '#1a5c30', label: 'E' },
    { x: 200, y: 260, color: '#4dabff', dim: '#1a3a5c', label: 'Z' },
    { x: 410, y: 260, color: '#ffd34d', dim: '#5c4d1a', label: 'C' },
  ];
  const PAD_W = 190, PAD_H = 195;

  const padAt = (x, y) => PADS.findIndex((p) => x >= p.x && x <= p.x + PAD_W && y >= p.y && y <= p.y + PAD_H);

  BR.register('lololo-simon', {
    howto: '光ったパッドの順番を覚えて、同じ順番で押そう\nQ E Z C キー または パッドをクリック。1回ごとに1つ増える',
    init(S, B) {
      S.seq = [B.randi(0, 3)];
      S.phase = 'show'; S.idx = 0; S.timer = 0.6; S.lit = -1; S.litT = 0;
      S.input = []; S.pending = false;
    },
    update(S, dt, I, B) {
      S.litT -= dt;
      if (S.litT <= 0 && S.phase === 'input') S.lit = -1;

      if (S.phase === 'show') {
        S.timer -= dt;
        if (S.timer > 0) return;
        if (S.lit >= 0) {
          S.lit = -1; S.timer = 0.25; S.idx++;
        } else if (S.idx < S.seq.length) {
          S.lit = S.seq[S.idx]; S.timer = 0.5;
        } else {
          S.phase = 'input'; S.input = []; S.lit = -1;
        }
        return;
      }

      if (S.phase === 'input') {
        let p = -1;
        KEYS.forEach((k, i) => { if (I.tap(k)) p = i; });
        if (p < 0 && I.ptr.clicked) p = padAt(I.ptr.x, I.ptr.y);
        if (p < 0) return;

        S.lit = p; S.litT = 0.2;
        if (p !== S.seq[S.input.length]) { S.over = true; S.msg = 'MISS'; return; }
        S.input.push(p);
        if (S.input.length === S.seq.length) {
          S.score = S.seq.length * 100;
          S.phase = 'next'; S.timer = 0.9;
        }
        return;
      }

      if (S.phase === 'next') {
        S.timer -= dt;
        if (S.timer <= 0) {
          S.seq.push(B.randi(0, 3));
          S.idx = 0; S.phase = 'show'; S.timer = 0.6; S.lit = -1;
        }
      }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#0b1020'; g.fillRect(0, 0, W, H);
      PADS.forEach((p, i) => {
        const on = S.lit === i;
        B.box(g, p.x, p.y, PAD_W, PAD_H, on ? p.color : p.dim, 18);
        B.text(g, p.label, p.x + PAD_W / 2, p.y + PAD_H / 2, 26, 'rgba(255,255,255,0.6)', 'center', 'bold');
      });
      const msg = S.phase === 'input' ? 'あなたの番！' : (S.phase === 'show' ? '覚えて…' : '次のラウンド…');
      B.text(g, `ラウンド ${S.seq.length}　${msg}`, W / 2, 470, 18, '#ffe066', 'center', 'bold');
    },
  });
})();
