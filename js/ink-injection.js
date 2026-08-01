(() => {
  const canvas = document.getElementById('ink-injection-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const plumes = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let lastRelease = 0;
  let frameId = 0;
  let running = false;

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function release(x, y, strength = 1) {
    for (let i = 0; i < 7; i += 1) {
      plumes.push({
        x: x + (i - 3) * 10 + (Math.random() - 0.5) * 14,
        y: y - i * 7,
        vx: (Math.random() - 0.5) * 0.22,
        vy: 0.16 + Math.random() * 0.18,
        w: (48 + Math.random() * 42) * strength,
        h: (62 + Math.random() * 52) * strength,
        age: -i * 11,
        life: 520 + Math.random() * 190,
        phase: Math.random() * Math.PI * 2,
        turn: (Math.random() - 0.5) * 0.0032,
        tone: i % 3 === 0 ? '20,34,104' : '3,30,88',
        alpha: 0.25 + Math.random() * 0.11
      });
    }
  }

  function blobPath(p, time) {
    const points = [];
    const count = 24;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const wobble = 1
        + Math.sin(angle * 3 + p.phase + time * 0.00032) * 0.17
        + Math.sin(angle * 5 - p.phase * 0.7) * 0.09;
      points.push({
        x: Math.cos(angle) * p.w * wobble,
        y: Math.sin(angle) * p.h * wobble
      });
    }

    ctx.beginPath();
    const last = points[count - 1];
    ctx.moveTo((points[0].x + last.x) / 2, (points[0].y + last.y) / 2);
    for (let i = 0; i < count; i += 1) {
      const next = points[(i + 1) % count];
      ctx.quadraticCurveTo(
        points[i].x,
        points[i].y,
        (points[i].x + next.x) / 2,
        (points[i].y + next.y) / 2
      );
    }
    ctx.closePath();
  }

  function drawStaticInk() {
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createRadialGradient(
      width * 0.68,
      height * 0.08,
      4,
      width * 0.68,
      height * 0.08,
      Math.max(width, height) * 0.34
    );
    gradient.addColorStop(0, 'rgba(10,36,104,.28)');
    gradient.addColorStop(0.5, 'rgba(4,32,88,.15)');
    gradient.addColorStop(1, 'rgba(4,32,88,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function render(time) {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';

    for (let i = plumes.length - 1; i >= 0; i -= 1) {
      const p = plumes[i];
      p.age += 1;
      if (p.age < 0) continue;

      p.x += p.vx + Math.sin(p.age * 0.014 + p.phase) * 0.055;
      p.y += p.vy;
      p.w += 0.07;
      p.h += 0.09;
      p.phase += p.turn;

      const fadeIn = Math.min(1, p.age / 24);
      const fadeOut = Math.max(0, 1 - p.age / p.life);
      const alpha = p.alpha * fadeIn * fadeOut;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.sin(p.age * 0.006 + p.phase) * 0.12);
      ctx.shadowBlur = 34;
      ctx.shadowColor = `rgba(${p.tone},${alpha * 0.9})`;
      blobPath(p, time);
      ctx.fillStyle = `rgba(${p.tone},${alpha})`;
      ctx.fill();
      ctx.clip();

      for (let wisp = -1; wisp <= 1; wisp += 1) {
        ctx.beginPath();
        ctx.moveTo(wisp * p.w * 0.22, -p.h * 0.66);
        ctx.bezierCurveTo(
          -p.w * 0.48,
          -p.h * 0.14,
          p.w * 0.48,
          p.h * 0.18,
          wisp * p.w * 0.28,
          p.h * 0.72
        );
        ctx.strokeStyle = `rgba(1,20,70,${alpha * 0.72})`;
        ctx.lineWidth = 6 + (wisp + 1) * 2;
        ctx.stroke();
      }

      ctx.restore();

      if (p.age > p.life || p.y - p.h > height) {
        plumes.splice(i, 1);
      }
    }

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';

    if (time - lastRelease > 4200) {
      release(width * (0.54 + Math.random() * 0.22), height * 0.03, 1.04);
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
    plumes.length = 0;
    release(width * 0.66, height * 0.035, 1.18);
    release(width * 0.76, height * 0.08, 0.82);
    lastRelease = performance.now();
    frameId = requestAnimationFrame(render);
  }

  canvas.addEventListener('pointerdown', event => {
    if (reducedMotion.matches) return;
    const box = canvas.getBoundingClientRect();
    release(
      event.clientX - box.left,
      Math.max(14, event.clientY - box.top),
      1.08
    );
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
