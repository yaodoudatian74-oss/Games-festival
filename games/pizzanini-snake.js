(() => {
  const COLS = 32, ROWS = 20, CELL = 25;

  BR.register('pizzanini-snake', {
    howto: '矢印 / WASD で移動。🍕を食べて長く伸ばそう\n壁や自分の体にぶつかるとゲームオーバー',
    init(S, B) {
      S.body = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
      S.dir = { x: 1, y: 0 }; S.next = { x: 1, y: 0 };
      S.timer = 0; S.food = null;
      placeFood(S, B);
    },
    update(S, dt, I, B) {
      if (I.tap('ArrowLeft', 'KeyA') && S.dir.x !== 1) S.next = { x: -1, y: 0 };
      if (I.tap('ArrowRight', 'KeyD') && S.dir.x !== -1) S.next = { x: 1, y: 0 };
      if (I.tap('ArrowUp', 'KeyW') && S.dir.y !== 1) S.next = { x: 0, y: -1 };
      if (I.tap('ArrowDown', 'KeyS') && S.dir.y !== -1) S.next = { x: 0, y: 1 };

      S.timer += dt;
      const interval = Math.max(0.06, 0.14 - S.body.length * 0.001);
      if (S.timer < interval) return;
      S.timer -= interval;

      S.dir = S.next;
      const head = { x: S.body[0].x + S.dir.x, y: S.body[0].y + S.dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) { S.over = true; return; }
      if (S.body.some((p) => p.x === head.x && p.y === head.y)) { S.over = true; return; }

      S.body.unshift(head);
      if (S.food && head.x === S.food.x && head.y === S.food.y) {
        S.score += 10;
        placeFood(S, B);
      } else {
        S.body.pop();
      }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#14213d'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,0.04)';
      for (let x = 0; x <= COLS; x++) { g.beginPath(); g.moveTo(x * CELL, 0); g.lineTo(x * CELL, H); g.stroke(); }
      for (let y = 0; y <= ROWS; y++) { g.beginPath(); g.moveTo(0, y * CELL); g.lineTo(W, y * CELL); g.stroke(); }
      if (S.food) B.emoji(g, '🍕', S.food.x * CELL + CELL / 2, S.food.y * CELL + CELL / 2, 22);
      S.body.forEach((p, i) => {
        const color = i === 0 ? '#ffe066' : `hsl(${140 + i * 2} 60% ${45 - Math.min(i, 20) * 0.5}%)`;
        B.box(g, p.x * CELL + 2, p.y * CELL + 2, CELL - 4, CELL - 4, color, 6);
      });
    },
  });

  function placeFood(S, B) {
    let p;
    do {
      p = { x: B.randi(0, COLS - 1), y: B.randi(0, ROWS - 1) };
    } while (S.body.some((b) => b.x === p.x && b.y === p.y));
    S.food = p;
  }
})();
