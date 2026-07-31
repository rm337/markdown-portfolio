(() => {
  const canvas = document.getElementById('ink-injection-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, dpr = 1, lastAuto = 0;
  const strands = [];

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width); height = Math.max(1, box.height);
    dpr = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const inject = (x, y, strength = 1) => {
    const count = Math.round(58 * strength);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.PI * (.32 + Math.random() * .36);
      const speed = (.35 + Math.random() * 1.35) * strength;
      strands.push({
        x, y, px: x, py: y,
        vx: Math.cos(angle) * speed + (Math.random() - .5) * .42,
        vy: Math.sin(angle) * speed * .72,
        curl: (Math.random() - .5) * .055,
        width: 2.5 + Math.random() * 12,
        life: 0, max: 180 + Math.random() * 190,
        alpha: .12 + Math.random() * .22,
        tone: Math.random() > .28 ? '30,145,183' : '74,199,204'
      });
    }
  };

  const draw = (time) => {
    ctx.fillStyle = 'rgba(11,49,86,.035)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'screen';
    for (let i = strands.length - 1; i >= 0; i -= 1) {
      const p = strands[i];
      p.px = p.x; p.py = p.y;
      const turn = Math.sin(p.life * .045 + p.x * .009) * p.curl;
      const cos = Math.cos(turn), sin = Math.sin(turn);
      const vx = p.vx * cos - p.vy * sin;
      p.vy = p.vx * sin + p.vy * cos - .006;
      p.vx = vx * .997; p.vy *= .997;
      p.x += p.vx; p.y += p.vy; p.life += 1;
      const fade = Math.max(0, 1 - p.life / p.max);
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.quadraticCurveTo((p.px+p.x)/2 + Math.sin(p.life*.08)*4, (p.py+p.y)/2, p.x, p.y);
      ctx.lineWidth = p.width * (.35 + fade); ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(${p.tone},${p.alpha * fade})`;
      ctx.shadowBlur = 18; ctx.shadowColor = `rgba(${p.tone},${.22 * fade})`; ctx.stroke();
      if (p.life >= p.max || p.y > height + 80) strands.splice(i, 1);
    }
    ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    if (!reduced.matches && time - lastAuto > 5200) { inject(width * (.62 + Math.random()*.22), height * .08, .82); lastAuto = time; }
    requestAnimationFrame(draw);
  };

  canvas.addEventListener('pointerdown', (event) => {
    const box = canvas.getBoundingClientRect();
    inject(event.clientX - box.left, event.clientY - box.top, 1.08);
  });
  addEventListener('resize', resize, { passive: true });
  resize(); inject(width * .72, height * .08, .95); requestAnimationFrame(draw);
})();
