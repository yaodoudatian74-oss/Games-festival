(() => {
  const CX = 400, CY = 250, R_IN = 150, R_OUT = 205, LAPS = 3;
  const polar = (a, r) => ({ x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r });

  BR.register('kart-ring', {
    howto: 'Space を押している間アクセル（離すと減速）\n←→ で内側／外側のレーンを移動。コースを3周して最初にゴール！',
    init(S) {
      S.a0 = -Math.PI / 2; S.a = S.a0; S.r = 178; S.speed = 0;
      S.ai = { a: S.a0, r: 190, sp: 1.9 };
      S.lap = 0; S.aiLap = 0; S.finish = null;
    },
    update(S, dt, I) {
      const throttle = I.held('Space', 'ArrowUp', 'KeyW');
      const target = throttle ? 2.4 : 0.0;
      const onRoad = S.r > R_IN + 6 && S.r < R_OUT - 6;
      const top = onRoad ? target : target * 0.45;
      S.speed += (top - S.speed) * Math.min(1, dt * 2.2);
      S.a += S.speed * dt;

      if (I.held('ArrowLeft', 'KeyA')) S.r -= 110 * dt;
      if (I.held('ArrowRight', 'KeyD')) S.r += 110 * dt;
      S.r = Math.max(R_IN, Math.min(R_OUT, S.r));

      // 出発点からの累計角度を2π割った数が周回数
      S.lap = Math.min(LAPS, Math.floor((S.a - S.a0) / (Math.PI * 2)));

      S.ai.a += S.ai.sp * dt;
      S.ai.r = 180 + Math.sin(S.t * 0.8) * 20;
      S.aiLap = Math.min(LAPS, Math.floor((S.ai.a - S.a0) / (Math.PI * 2)));

      if (!S.finish) {
        if (S.lap >= LAPS) S.finish = 'win';
        else if (S.aiLap >= LAPS) S.finish = 'lose';
      }
      if (S.finish) {
        S.over = true;
        S.msg = S.finish === 'win' ? 'YOU WIN!' : 'AI WIN';
        S.score = S.finish === 'win' ? Math.max(0, 6000 - Math.floor(S.t) * 20) : S.lap * 500;
      } else {
        S.score = S.lap * 1000;
      }
    },
    draw(S, g, W, H, B) {
      g.fillStyle = '#2d6a2d'; g.fillRect(0, 0, W, H);
      g.beginPath(); g.arc(CX, CY, R_OUT + 20, 0, Math.PI * 2); g.fillStyle = '#3f8f3f'; g.fill();
      g.beginPath(); g.arc(CX, CY, R_OUT, 0, Math.PI * 2); g.fillStyle = '#4a4f5c'; g.fill();
      g.beginPath(); g.arc(CX, CY, R_IN, 0, Math.PI * 2); g.fillStyle = '#2d6a2d'; g.fill();
      g.setLineDash([14, 14]); g.strokeStyle = '#ffffffaa'; g.lineWidth = 3;
      g.beginPath(); g.arc(CX, CY, (R_IN + R_OUT) / 2, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      g.strokeStyle = '#fff'; g.lineWidth = 6;
      g.beginPath(); g.moveTo(CX, CY - R_IN); g.lineTo(CX, CY - R_OUT); g.stroke();

      const ai = polar(S.ai.a, S.ai.r);
      const me = polar(S.a, S.r);
      B.emoji(g, '🐊', ai.x, ai.y, 34);
      B.emoji(g, '🏎️', me.x, me.y, 38);

      B.text(g, `LAP ${Math.min(S.lap + 1, LAPS)} / ${LAPS}`, 20, 20, 20, '#fff', 'left', 'bold');
      B.text(g, `AI LAP ${Math.min(S.aiLap + 1, LAPS)}`, 20, 46, 16, '#ffb3b3', 'left', 'bold');
      B.box(g, 600, 470, 170 * Math.min(1, S.speed / 2.4), 12, '#ffe066', 6);
      B.text(g, 'SPEED', 600, 460, 14, '#fff', 'left', 'bold');
    },
  });
})();
