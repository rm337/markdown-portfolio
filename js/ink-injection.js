(() => {
  const canvas = document.getElementById('ink-injection-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const palette = [
    [1, 10, 38],
    [4, 30, 92],
    [8, 58, 150],
    [24, 35, 112],
    [52, 31, 118]
  ];

  let width = 1;
  let height = 1;
  let dpr = 1;
  let puffs = [];
  let nextSpawn = 0;
  let frameId = 0;
  let running = false;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (items) => items[(Math.random() * items.length) | 0];

  class Puff {
    constructor(x, y, scale = 1, ageOffset = 0) {
      this.color = pick(palette);
      this.x = x;
      this.y = y;
      this.r = rand(22, 58) * scale;
      this.vx = rand(-0.10, 0.10) * scale;
      this.vy = rand(0.10, 0.34) * scale;
      this.drift = rand(-0.18, 0.18);
      this.phase = rand(0, Math.PI * 2);
      this.spin = rand(-0.012, 0.012);
      this.age = ageOffset;
      this.life = rand(560, 980);
      this.alpha = rand(0.07, 0.17);
      this.stretch = rand(0.68, 1.35);
      this.seed = rand(0.7, 1.5);
    }

    update() {
      this.age += 1;
      this.phase += 0.012 + this.spin;
      const curl = Math.sin(this.phase * this.seed) * this.drift;
      this.vx = (this.vx + curl * 0.005) * 0.997;
      this.vy = Math.min(this.vy + 0.0008, 0.42);
      this.x += this.vx + Math.sin(this.phase * 0.7) * 0.08;
      this.y += this.vy;
      this.r += 0.016;
    }

    draw() {
      const t = this.age / this.life;
      if (t >= 1) return;

      const fadeIn = Math.min(1, this.age / 70);
      const fadeOut = Math.pow(Math.max(0, 1 - t), 1.8);
      const alpha = this.alpha * fadeIn * fadeOut;
      if (alpha < 0.002) return;

      const [r, g, b] = this.color;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.sin(this.phase * 0.45) * 0.10);
      ctx.scale(this.stretch, 1 / Math.sqrt(this.stretch));

      ctx.filter = `blur(${Math.max(5, this.r * 0.13)}px)`;
      const bloom = ctx.createRadialGradient(0, 0, this.r * 0.05, 0, 0, this.r);
      bloom.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.95})`);
      bloom.addColorStop(0.28, `rgba(${r},${g},${b},${alpha * 0.62})`);
      bloom.addColorStop(0.65, `rgba(${r},${g},${b},${alpha * 0.20})`);
      bloom.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.filter = `blur(${Math.max(2, this.r * 0.045)}px)`;
      const core = ctx.createRadialGradient(-this.r * 0.16, -this.r * 0.10, 0, 0, 0, this.r * 0.62);
      core.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.82})`);
      core.addColorStop(0.55, `rgba(${r},${g},${b},${alpha * 0.26})`);
      core.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(-this.r * 0.08, -this.r * 0.04, this.r * 0.64, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function releasePlume(x, y, strength = 1) {
    const count = Math.round(rand(10, 17) * strength);
    for (let i = 0; i < count; i += 1) {
      const spread = rand(18, 78) * strength;
      const px = x + rand(-spread, spread);
      const py = y + rand(-18, 30);
      const puff = new Puff(px, py, rand(0.72, 1.25) * strength, rand(0, 75));
      puff.vx += (px - x) * 0.0012;
      puff.vy *= rand(0.72, 1.05);
      puffs.push(puff);
    }
  }

  function seedScene() {
    puffs = [];
    releasePlume(width * 0.18, -8, 1.25);
    releasePlume(width * 0.46, -28, 1.5);
    releasePlume(width * 0.73, -12, 1.35);
    releasePlume(width * 0.91, -36, 0.9);

    for (let i = 0; i < 18; i += 1) {
      const puff = new Puff(rand(width * 0.06, width * 0.94), rand(height * 0.02, height * 0.30), rand(0.55, 0.92), rand(80, 360));
      puff.vy = rand(0.05, 0.18);
      puff.alpha *= 0.72;
      puffs.push(puff);
    }
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedScene();
  }

  function spawn(now) {
    if (now < nextSpawn) return;
    const lanes = [width * 0.12, width * 0.26, width * 0.43, width * 0.58, width * 0.72, width * 0.87];
    releasePlume(pick(lanes) + rand(-35, 35), rand(-45, -8), rand(0.65, 1.02));
    nextSpawn = now + rand(1500, 3100);
  }

  function drawFrame(now = 0) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';

    for (let i = puffs.length - 1; i >= 0; i -= 1) {
      const puff = puffs[i];
      puff.update();
      puff.draw();
      if (puff.age >= puff.life || puff.y > height + puff.r * 2) puffs.splice(i, 1);
    }

    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
    if (!reducedMotion.matches) spawn(now);
    if (puffs.length < 12) seedScene();
  }

  function render(now) {
    if (!running) return;
    drawFrame(now);
    frameId = requestAnimationFrame(render);
  }

  function start() {
    cancelAnimationFrame(frameId);
    resize();

    if (reducedMotion.matches) {
      running = false;
      for (let step = 0; step < 80; step += 1) puffs.forEach((puff) => puff.update());
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'multiply';
      puffs.forEach((puff) => puff.draw());
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
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
