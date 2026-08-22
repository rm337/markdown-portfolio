(() => {
  const canvas = document.getElementById('ink-injection-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1;
  let height = 1;
  let dpr = 1;
  let particles = [];
  let frameId = 0;
  let running = false;
  let frame = 0;

  function makeParticle(scatter = false) {
    const depth = Math.random();
    const direction = Math.random() > 0.5 ? 1 : -1;
    return {
      x: Math.random() * width,
      y: scatter ? Math.random() * height * 0.82 : height * (0.12 + Math.random() * 0.62),
      r: 18 + Math.random() * 58,
      depth,
      drift: 0.06 + depth * 0.26,
      rise: direction * (0.012 + depth * 0.045),
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.58 ? '2, 24, 62' : '3, 70, 138',
      alpha: 0.022 + depth * 0.04,
      stretch: 1.8 + Math.random() * 3.8,
      spin: Math.random() * Math.PI
    };
  }

  function seed() {
    const count = reducedMotion.matches ? 18 : Math.min(44, Math.max(24, Math.floor(width / 30)));
    particles = Array.from({ length: count }, () => makeParticle(true));
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function draw(p, time) {
    const wobbleX = Math.sin(time * p.drift + p.phase) * (18 + p.depth * 42);
    const wobbleY = Math.cos(time * 0.18 + p.phase) * (14 + p.depth * 18);
    const x = p.x + wobbleX;
    const y = p.y + wobbleY;
    const radius = p.r * (1 + Math.sin(time * 0.11 + p.phase) * 0.08);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    gradient.addColorStop(0, `rgba(${p.hue},${p.alpha * 2.15})`);
    gradient.addColorStop(0.36, `rgba(${p.hue},${p.alpha})`);
    gradient.addColorStop(1, `rgba(${p.hue},0)`);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.spin + Math.sin(time * 0.08 + p.phase) * 0.35);
    ctx.scale(p.stretch, 0.62 + p.depth * 0.42);
    ctx.translate(-x, -y);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function update(p) {
    p.y -= p.rise;
    p.x += Math.sin(frame * 0.004 + p.phase) * 0.018;

    if (p.y < height * 0.02) {
      p.y = height * 0.02;
      p.rise = -Math.abs(p.rise);
    }
    if (p.y > height * 0.80) {
      p.y = height * 0.80;
      p.rise = Math.abs(p.rise);
    }
  }

  function render() {
    if (!running) return;

    frame += 1;
    const time = frame / 60;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';

    for (const p of particles) {
      update(p);
      draw(p, time);
    }

    ctx.globalCompositeOperation = 'source-over';
    frameId = requestAnimationFrame(render);
  }

  function drawStatic() {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';
    for (const p of particles) draw(p, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  function start() {
    cancelAnimationFrame(frameId);
    resize();

    if (reducedMotion.matches) {
      running = false;
      drawStatic();
      return;
    }

    running = true;
    frameId = requestAnimationFrame(render);
  }

  window.addEventListener('resize', start, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frameId);
    } else {
      start();
    }
  });
  reducedMotion.addEventListener?.('change', start);

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (canvas.clientWidth && canvas.clientHeight) start();
    }).observe(canvas);
  }

  start();
})();
