(() => {
  const canvas = document.getElementById('ink-injection-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles = [];
  const tendrils = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let frameId = 0;
  let running = false;
  let lastRelease = 0;

  const INK = {
    core: '2,18,48',
    deep: '3,32,72',
    blue: '5,55,104',
    haze: '18,78,126'
  };

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addParticle(x, y, options = {}) {
    const size = options.size ?? 26 + Math.random() * 34;
    particles.push({
      x,
      y,
      vx: options.vx ?? (Math.random() - 0.5) * 0.18,
      vy: options.vy ?? 0.22 + Math.random() * 0.34,
      size,
      stretch: options.stretch ?? 0.9 + Math.random() * 1.5,
      alpha: options.alpha ?? 0.035 + Math.random() * 0.055,
      age: options.age ?? 0,
      life: options.life ?? 520 + Math.random() * 360,
      phase: Math.random() * Math.PI * 2,
      drift: 0.006 + Math.random() * 0.012,
      tone: options.tone ?? [INK.deep, INK.blue, INK.core][Math.floor(Math.random() * 3)]
    });
  }

  function addTendril(x, y, scale = 1) {
    const points = [];
    const count = 12 + Math.floor(Math.random() * 7);
    for (let i = 0; i < count; i += 1) {
      points.push({
        x: x + (Math.random() - 0.5) * 5 * scale,
        y: y + i * (7 + Math.random() * 4) * scale,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (0.22 + Math.random() * 0.18) * scale
      });
    }
    tendrils.push({
      points,
      age: 0,
      life: 620 + Math.random() * 260,
      alpha: 0.12 + Math.random() * 0.08,
      width: (5 + Math.random() * 8) * scale,
      phase: Math.random() * Math.PI * 2,
      curl: (Math.random() - 0.5) * 0.026,
      tone: Math.random() > 0.45 ? INK.core : INK.deep
    });
  }

  function release(x, y, strength = 1) {
    // Dense source cloud, deliberately irregular so it never reads as a single blob.
    for (let i = 0; i < 48; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.55) * 70 * strength;
      addParticle(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius * 0.48,
        {
          size: (18 + Math.random() * 54) * strength,
          stretch: 0.7 + Math.random() * 1.9,
          vy: 0.12 + Math.random() * 0.30,
          alpha: 0.025 + Math.random() * 0.05,
          tone: Math.random() < 0.52 ? INK.core : INK.deep
        }
      );
    }

    // Long descending filaments, inspired by real ink dispersing through water.
    const tendrilCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < tendrilCount; i += 1) {
      addTendril(
        x + (i - (tendrilCount - 1) / 2) * 18 * strength + (Math.random() - 0.5) * 16,
        y + 18 + Math.random() * 30,
        strength * (0.78 + Math.random() * 0.5)
      );
    }
  }

  function drawParticle(p, time) {
    const life = Math.max(0, 1 - p.age / p.life);
    const fadeIn = Math.min(1, p.age / 28);
    const alpha = p.alpha * life * fadeIn;
    if (alpha <= 0) return;

    const sway = Math.sin(p.phase + time * p.drift * 0.04 + p.age * 0.018);
    const rx = p.size * (0.68 + sway * 0.10);
    const ry = p.size * p.stretch * (0.86 - sway * 0.06);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(sway * 0.12);

    const gradient = ctx.createRadialGradient(0, -ry * 0.12, 0, 0, 0, Math.max(rx, ry));
    gradient.addColorStop(0, `rgba(${p.tone},${alpha * 0.95})`);
    gradient.addColorStop(0.38, `rgba(${p.tone},${alpha * 0.62})`);
    gradient.addColorStop(1, `rgba(${p.tone},0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTendril(t, time) {
    const life = Math.max(0, 1 - t.age / t.life);
    const fadeIn = Math.min(1, t.age / 36);
    const alpha = t.alpha * life * fadeIn;
    if (alpha <= 0 || t.points.length < 3) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 16;
    ctx.shadowColor = `rgba(${t.tone},${alpha * 0.8})`;

    // Soft outside body.
    ctx.beginPath();
    ctx.moveTo(t.points[0].x, t.points[0].y);
    for (let i = 1; i < t.points.length - 1; i += 1) {
      const p = t.points[i];
      const n = t.points[i + 1];
      ctx.quadraticCurveTo(p.x, p.y, (p.x + n.x) / 2, (p.y + n.y) / 2);
    }
    const last = t.points[t.points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.strokeStyle = `rgba(${t.tone},${alpha * 0.26})`;
    ctx.lineWidth = t.width * 2.8;
    ctx.stroke();

    // Denser ink spine.
    ctx.strokeStyle = `rgba(${t.tone},${alpha * 0.72})`;
    ctx.lineWidth = t.width;
    ctx.stroke();

    // Fine inner filament.
    ctx.shadowBlur = 4;
    ctx.strokeStyle = `rgba(${INK.haze},${alpha * 0.24})`;
    ctx.lineWidth = Math.max(1, t.width * 0.18);
    ctx.stroke();
    ctx.restore();
  }

  function updateTendril(t, time) {
    t.age += 1;
    for (let i = 0; i < t.points.length; i += 1) {
      const p = t.points[i];
      const depth = i / Math.max(1, t.points.length - 1);
      const wave = Math.sin(time * 0.00055 + t.phase + i * 0.63) * (0.035 + depth * 0.09);
      p.vx += wave * 0.015 + t.curl * depth * 0.014;
      p.vx *= 0.986;
      p.x += p.vx;
      p.y += p.vy * (0.78 + depth * 0.48);
    }

    // Seed translucent turbulence along the filament, especially lower down.
    if (t.age % 11 === 0 && t.age < t.life * 0.72) {
      const index = 3 + Math.floor(Math.random() * Math.max(1, t.points.length - 4));
      const p = t.points[Math.min(index, t.points.length - 1)];
      addParticle(p.x, p.y, {
        size: 12 + Math.random() * 26,
        stretch: 1.2 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.10,
        vy: 0.12 + Math.random() * 0.18,
        alpha: 0.018 + Math.random() * 0.03,
        life: 300 + Math.random() * 180,
        tone: t.tone
      });
    }
  }

  function drawStaticInk() {
    ctx.clearRect(0, 0, width, height);
    const x = width * 0.68;
    const y = height * 0.02;
    const gradient = ctx.createRadialGradient(x, y, 4, x, y + 70, Math.max(190, width * 0.22));
    gradient.addColorStop(0, 'rgba(2,18,48,.24)');
    gradient.addColorStop(0.45, 'rgba(3,32,72,.13)');
    gradient.addColorStop(1, 'rgba(3,32,72,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, Math.min(height, 360));
  }

  function render(time) {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.age += 1;
      const curl = Math.sin(p.phase + p.age * 0.017) * 0.018;
      p.vx = (p.vx + curl) * 0.991;
      p.x += p.vx;
      p.y += p.vy;
      p.size += 0.022;
      p.stretch += 0.0007;
      drawParticle(p, time);

      if (p.age > p.life || p.y - p.size > height) {
        particles.splice(i, 1);
      }
    }

    for (let i = tendrils.length - 1; i >= 0; i -= 1) {
      const t = tendrils[i];
      updateTendril(t, time);
      drawTendril(t, time);
      const last = t.points[t.points.length - 1];
      if (t.age > t.life || last.y > height + 80) {
        tendrils.splice(i, 1);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;

    // A new pulse enters from the surface before the previous one fully disappears.
    if (time - lastRelease > 5600) {
      release(width * (0.61 + Math.random() * 0.16), -8, 0.78 + Math.random() * 0.22);
      lastRelease = time;
    }

    frameId = requestAnimationFrame(render);
  }

  function start() {
    cancelAnimationFrame(frameId);
    resize();

    if (reducedMotion.matches) {
      running = false;
      drawStaticInk();
      return;
    }

    running = true;
    particles.length = 0;
    tendrils.length = 0;

    // Begin above the visible surface so the ink appears to enter the water rather than hang from the page.
    release(width * 0.68, -18, 1.0);
    lastRelease = performance.now();
    frameId = requestAnimationFrame(render);
  }

  canvas.addEventListener('pointerdown', event => {
    if (reducedMotion.matches) return;
    const box = canvas.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = Math.max(-8, event.clientY - box.top - 18);
    release(x, y, 0.72);
  });

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
