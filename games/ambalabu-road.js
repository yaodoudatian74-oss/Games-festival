(() => {
  const CELL = 40, COLS = 20, ROWS = 12;
  const GOAL_ROW = 0, START_ROW = 11, GRASS_ROW = 10;
  const ROAD_ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const CARS = ['🚙', '🚗', '🚕', '🚌'];

  function makeLanes(S, B) {
    S.lanes = {};
    ROAD_ROWS.forEach((r) => {
      const dir = r % 2 ? 1 : -1;
      const speed = (60 + Math.random() * 70 + S.level * 8) * dir;
      const n = B.randi(2, 3);
      const cars = [];
      for (let i = 0; i < n; i++) {
        cars.push({ x: (i * COLS * CELL) / n + B.rand(0, 60), w: B.rand(70, 110), e: B.pick(CARS) });
      }
      S.lanes[r] = { speed, cars };
    });
  }

  BR.register('ambalabu-road', {
    howto: '矢印 / WASD で🐸を1マスずつ動かし、道路を渡ろう\n車に当たるとライフ−1。向こう岸に着くと得点、速度アップ',
    init(S, B) {
      S.level = 0; S.lives = 3; S.r = START_ROW; S.c = 10; S.hitT = 0;
      makeLanes(S, B);
    },
    update(S, dt, I, B) {
      if (I.tap('ArrowUp', 'KeyW') && S.r > GOAL_ROW) S.r--;
      if (I.tap('ArrowDown', 'KeyS') && S.r < START_ROW) S.r++;
      if (I.tap('ArrowLeft', 'KeyA') && S.c > 0) S.c--;
      if (I.tap('ArrowRight', 'KeyD') && S.c < COLS - 1) S.c++;

      for (const r of ROAD_ROWS) {
        const lane = S.lanes[r];
        for (const car of lane.cars) {
          car.x += lane.speed * dt;
          if (car.x > COLS * CELL + 120) car.x = -car.w - 40;
          if (car.x < -car.w - 120) car.x = COLS * CELL + 40;
        }
      }

      S.hitT -= dt;
      if (S.r >= 1 && S.r <= 9 && S.hitT <= 0) {
        const fx = S.c * CELL + CELL / 2;
        const hit = S.lanes[S.r].cars.some((car) => Math.abs(fx - (car.x + car.w / 2)) < car.w / 2 + 12);
        if (hit) {
          S.lives--; S.hitT = 0.8;
          S.r = START_ROW; S.c = 10;
          if (S.lives <= 0) { S.over = true; S.msg = 'はねられた…'; return; }
        }
      }

      if (S.r === GOAL_ROW) {
        S.score += 100 + S.level * 20;
        S.level++;
        S.r = START_ROW; S.c = 10;
        makeLanes(S, B);
      }
    },
    draw(S, g, W, H, B) {
      for (let r = 0; r < ROWS; r++) {
        let color = '#2e7d32';
        if (r === GOAL_ROW) color = '#ffd166';
        else if (r === GRASS_ROW || r === START_ROW) color = '#4caf50';
        else if (r >= 1 && r <= 9) color = r % 2 ? '#3a3f4b' : '#333845';
        g.fillStyle = color; g.fillRect(0, r * CELL, W, CELL);
        if (r >= 1 && r <= 9) {
          g.fillStyle = 'rgba(255,255,255,0.4)';
          for (let x = 0; x < W; x += 60) g.fillRect(x, r * CELL + CELL / 2 - 2, 30, 4);
        }
      }
      for (const r of ROAD_ROWS) {
        for (const car of S.lanes[r].cars) B.emoji(g, car.e, car.x + car.w / 2, r * CELL + CELL / 2, 34);
      }
      B.emoji(g, '🐸', S.c * CELL + CELL / 2, S.r * CELL + CELL / 2, 34);
      B.text(g, `❤️ ${S.lives}　Lv ${S.level + 1}`, 14, 460 + 20, 18, '#fff', 'left', 'bold');
    },
  });
})();
