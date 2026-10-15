(() => {
  const QUESTIONS = [
    { q: 'ブレインロットはどんな意味の俗語？', c: ['無意味で過剰なネットミーム', '脳の病気の名称', '料理の名前', '新しい通貨の名前'], a: 0 },
    { q: 'トラレロ・トララの見た目のモチーフは？', c: ['ネコ', 'サメ（ナイキのスニーカーを履いた）', 'ペンギン', 'ヘビ'], a: 1 },
    { q: 'ボンバルディーロ・クロコディーロは何と何が合体したキャラ？', c: ['ワニと爆撃機', 'ゾウと戦車', 'カバと潜水艦', 'ライオンと列車'], a: 0 },
    { q: 'トゥン・トゥン・トゥン・サフールの素材は？', c: ['木', '金属', '氷', 'ガラス'], a: 0 },
    { q: 'リリリ・ラリラのモチーフは？', c: ['ゾウとサボテン', 'キリンとキノコ', 'ペンギンと氷山', 'クジラと灯台'], a: 0 },
    { q: 'チンパンジーニ・バナナニーニのモチーフは？', c: ['サルとバナナ', 'イヌとリンゴ', 'ウマとブドウ', 'トリとイチゴ'], a: 0 },
    { q: 'イタリア風ブレインロットの多くは、何で作られた画像や動画？', c: ['AI生成', '手描きアニメ', '実写撮影', '3Dスキャン'], a: 0 },
    { q: 'Roblox の「Steal a Brainrot」で主にすることは？', c: ['ブレインロットを盗む・買って拠点に置き、収入を得る', '野菜を育てる', 'レースで順位を競う', '宇宙を探索する'], a: 0 },
  ];
  const TIME_PER_Q = 10;
  const BOX = [
    { x: 60, y: 200 }, { x: 420, y: 200 }, { x: 60, y: 320 }, { x: 420, y: 320 },
  ];

  BR.register('brainrot-quiz', {
    howto: '4択の答えを 1〜4 キー / クリックで選ぼう\n早く答えるほどボーナス。全8問に挑戦！',
    init(S, B) {
      S.qi = 0; S.sel = -1; S.reveal = 0; S.correct = 0;
      S.order = B.shuffle(QUESTIONS.map((_, i) => i));
      S.qt = TIME_PER_Q;
      S.choices = shuffleChoices(S, B);
    },
    update(S, dt, I, B) {
      if (S.reveal > 0) {
        S.reveal -= dt;
        if (S.reveal <= 0) {
          S.qi++;
          if (S.qi >= S.order.length) { S.over = true; S.msg = `${S.correct}/${S.order.length} 正解`; return; }
          S.sel = -1; S.qt = TIME_PER_Q;
          S.choices = shuffleChoices(S, B);
        }
        return;
      }
      const q = current(S);
      S.qt -= dt;
      let pick = -1;
      [0, 1, 2, 3].forEach((k) => { if (I.tap(`Digit${k + 1}`)) pick = k; });
      if (I.ptr.clicked) {
        const k = BOX.findIndex((b) => I.ptr.x >= b.x && I.ptr.x <= b.x + 320 && I.ptr.y >= b.y && I.ptr.y <= b.y + 100);
        if (k >= 0) pick = k;
      }
      if (S.qt <= 0) { S.qt = 0; pick = 99; }
      if (pick < 0) return;

      const ok = pick < 4 && S.choices[pick] === q.a;
      S.sel = pick;
      if (ok) {
        S.correct++;
        S.score += 100 + Math.round(S.qt * 10);
      }
      S.lastOk = ok;
      S.reveal = 1.2;
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#1b1040'; g.fillRect(0, 0, W, H);
      const q = current(S);
      B.text(g, `Q${S.qi + 1} / ${S.order.length}`, W / 2, 50, 18, '#9ad', 'center', 'bold');
      wrapText(g, q.q, W / 2, 110, 26, 680, B);
      B.box(g, 60, 150, 680 * S.qt / TIME_PER_Q, 8, '#ffe066', 4);
      S.choices.forEach((ci, k) => {
        const b = BOX[k];
        let fill = '#3a2d6b';
        if (S.reveal > 0) {
          if (ci === q.a) fill = '#2a9d5b';
          else if (k === S.sel) fill = '#c1121f';
        }
        B.box(g, b.x, b.y, 320, 100, fill, 14);
        B.text(g, `${k + 1}. ${q.c[ci]}`, b.x + 16, b.y + 50, 18, '#fff', 'left', 'bold');
      });
      if (S.reveal > 0) {
        B.text(g, S.lastOk ? '正解！' : (S.sel === 99 ? '時間切れ…' : '不正解…'), W / 2, 450, 26, S.lastOk ? '#7dff9b' : '#ff6b6b', 'center', '800');
      } else {
        B.text(g, `残り ${Math.ceil(S.qt)} 秒`, W / 2, 450, 18, '#fff', 'center');
      }
    },
  });

  function current(S) { return QUESTIONS[S.order[S.qi]]; }
  function shuffleChoices(S, B) {
    return B.shuffle([0, 1, 2, 3]);
  }
  function wrapText(g, s, x, y, size, maxW, B) {
    const lines = [];
    let line = '';
    g.font = `bold ${size}px ${B.FONT}`;
    for (const ch of s) {
      if (line && g.measureText(line + ch).width > maxW) { lines.push(line); line = ch; }
      else line += ch;
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => B.text(g, l, x, y + i * (size + 8), size, '#fff', 'center', 'bold'));
  }
})();
