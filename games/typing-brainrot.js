(() => {
  const WORDS = [
    'tralalero tralala', 'bombardiro crocodilo', 'tung tung tung sahur', 'chimpanzini bananini',
    'ballerina cappuccina', 'lirili larila', 'glorbo fruttodrillo', 'odin din din dun',
    'bombombini gusini', 'brr brr patapim', 'svinina bombardino', 'trippi troppi',
  ];

  BR.register('typing-brainrot', {
    howto: '落ちてくる名前を、キーボードでそのまま入力しよう\n入力が一致すると消えて得点。画面の下まで落ちると1ミス（3ミスで終了）',
    init(S) {
      S.words = []; S.spawn = 0.5; S.buf = ''; S.miss = 0; S.flash = 0; S.flashOk = true;
    },
    update(S, dt, I, B) {
      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.spawn = Math.max(0.9, 2.2 - S.t * 0.02);
        const w = B.pick(WORDS);
        S.words.push({ w, x: B.rand(40, 620), y: -30 });
      }
      const speed = 30 + S.t * 1.2;
      for (const v of S.words) v.y += speed * dt;

      for (const ch of I.chars) {
        if (ch === '\b') S.buf = S.buf.slice(0, -1);
        else if (ch.length === 1) S.buf = (S.buf + ch).slice(-40);
      }
      const hit = S.words.find((v) => v.w === S.buf);
      if (hit) {
        S.score += hit.w.length * 10;
        S.words.splice(S.words.indexOf(hit), 1);
        S.buf = '';
        S.flash = 0.3; S.flashOk = true;
      }

      const gone = S.words.filter((v) => v.y > 470);
      if (gone.length) {
        S.miss += gone.length;
        S.words = S.words.filter((v) => v.y <= 470);
        S.flash = 0.3; S.flashOk = false;
        if (S.miss >= 3) { S.over = true; S.msg = 'ミス3回'; }
      }
      if (S.flash > 0) S.flash -= dt;
    },
    draw(S, g, W, H, B) {
      g.fillStyle = S.flash > 0 ? (S.flashOk ? '#14532d' : '#7f1d1d') : '#0f172a';
      g.fillRect(0, 0, W, H);
      for (const v of S.words) {
        const match = S.buf.length > 0 && v.w.startsWith(S.buf);
        B.box(g, v.x - 6, v.y - 18, Math.max(160, v.w.length * 14), 36, 'rgba(255,255,255,0.08)', 10);
        const typed = match ? S.buf : '';
        g.font = `bold 24px ${B.FONT}`;
        const tw = g.measureText(typed).width;
        B.text(g, typed, v.x + 8, v.y, 24, '#7dff9b', 'left', 'bold');
        B.text(g, v.w.slice(typed.length), v.x + 8 + tw, v.y, 24, '#fff', 'left', 'bold');
      }
      g.fillStyle = '#1e293b'; g.fillRect(0, 470, W, 30);
      B.text(g, `入力: ${S.buf}_`, 20, 485, 22, '#ffe066', 'left', 'bold');
      B.text(g, `ミス ${S.miss} / 3`, W - 20, 485, 18, '#ffb3b3', 'right', 'bold');
    },
  });
})();
