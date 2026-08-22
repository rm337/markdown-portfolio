(() => {
  const canvas = document.getElementById('ink-injection-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clouds = [];

  let width = 1;
  let height = 1;
  let dpr = 1;
  let frameId = 0;
  let running = false;

  const TONES = [
    '2,18,48',
    '3,30,68',
    '4,44,88',
    '7,58,108',
    '14,72,120'
  ];

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeLobes(scale) {
    const lobes = [];
    const count = 5 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 44 * scale;
      lobes.push({
        ox: Math.cos(angle) * spread,
        oy: Math.sin(angle) * spread * 0.62,
        size: (28 + Math.random() * 58) * scale,
        stretch: 0.72 + Math.random() * 0.72,
        rotation: (Math.random() - 0.5) * 0.9,
        alpha: 0.045 + Math.random() * 0.07,
        phase: Math.random() * Math.PI * 2,
        tone: TONES[Math.floor(Math.random() * TONES.length)]
      });
    }

    return lobes;
  }

  function addCloud(x, y, scale = 1, options = {}) {
    clouds.push({
      x,
      y,
      vx: options.vx ?? (Math.random() - 0.5) * 0.055,
      vy: options.vy ?? (Math.random() - 0.5) * 0.018,
      scale,
      phase: Math.random() * Math.PI * 2,
      verticalPhase: Math.random() * Math.PI * 2,
      horizontalPhase: Math.random() * Math.PI * 2,
      verticalAmp: (12 + Math.random() * 26) * scale,
      horizontalAmp: (8 + Math.random() * 20) * scale,
      verticalSpeed: 0.00022 + Math.random() * 0.00022,
      horizontalSpeed: 0.00016 + Math.random() * 0.00018,
      rotation: (Math.random() - 0.5) * 0.18,
      rotationSpeed: (Math.random() - 0.5) * 0.000018,
      lobes: makeLobes(scale)
    });
  }

  function seedInk() {
    clouds.length = 0;

    const count = width < 720 ? 12 : 20;
    for (let i = 0; i < count; i += 1) {
      const x = width * (0.08 + Math.random() * 0.84);
      const y = height * (0.04 + Math.random() * 0.68);
      const scale = 0.55 + Math.random() * 0.9;
      addCloud(x, y, scale);
    }

    // A few larger, softer plumes near the upper waterline.
    addCloud(width * 0.20, height * 0.10, 1.35, { vx: 0.018, vy: 0 });
    addCloud(width * 0.72, height * 0.16, 1.55, { vx: -0.014, vy: 0 });
    addCloud(width * 0.48, height * 0.30, 1.10, { vx: 0.010, vy: 0 });
  }

  function drawLobe(lobe, cloud, time) {
    const pulse = 1 + Math.sin(time * 0.00034 + lobe.phase) * 0.055;
    const rx = lobe.size * pulse;
    const ry = lobe.size * lobe.stretch * (1 + Math.cos(time * 0.00028 + lobe.phase) * 0.04);

    const localX = lobe.ox + Math.sin(time * 0.00018 + lobe.phase) * 7 * cloud.scale;
    const localY = lobe.oy + Math.cos(time * 0.00020 + lobe.phase) * 5 * cloud.scale;

    ctx.save();
    ctx.translate(localX, localY);
    ctx.rotate(lobe.rotation + Math.sin(time * 0.00012 + lobe.phase) * 0.08);

    const radius = Math.max(rx, ry);
    const gradient = ctx.createRadialGradient(
      -rx * 0.12,
      -ry * 0.10,
      0,
      0,
      0,
      radius
    );

    gradient.addColorStop(0, `rgba(${lobe.tone},${lobe.alpha})`);
    gradient.addColorStop(0.34, `rgba(${lobe.tone},${lobe.alpha * 0.72})`);
    gradient.addColorStop(0.70, `rgba(${lobe.tone},${lobe.alpha * 0.28})`);
    gradient.addColorStop(1, `rgba(${lobe.tone},0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCloud(cloud, time) {
    const floatY = Math.sin(time * cloud.verticalSpeed + cloud.verticalPhase) * cloud.verticalAmp;
    const floatX = Math.sin(time * cloud.horizontalSpeed + cloud.horizontalPhase) * cloud.horizontalAmp;

    ctx.save();
    ctx.translate(cloud.x + floatX, cloud.y + floatY);
    ctx.rotate(cloud.rotation + Math.sin(time * 0.00011 + cloud.phase) * 0.06);

    // Soft outer body. No stroked paths, filaments, or scratch-like lines.
    for (const lobe of cloud.lobes) {
      drawLobe(lobe, cloud, time);
    }

    ctx.restore();
  }

  function updateCloud(cloud) {
    cloud.x += cloud.vx;
    cloud.y += cloud.vy;
    cloud.rotation += cloud.rotationSpeed;

    const marginX = 120 * cloud.scale;
    const marginY = 100 * cloud.scale;

    if (cloud.x < -marginX) cloud.x = width + marginX;
    if (cloud.x > width + marginX) cloud.x = -marginX;

    // Keep the ink suspended in the hero instead of letting it fall off the page.
    if (cloud.y < -marginY) {
      cloud.y = -marginY;
      cloud.vy = Math.abs(cloud.vy || 0.01);
    }
    if (cloud.y > height * 0.80) {
      cloud.y = height * 0.80;
      cloud.vy = -Math.abs(cloud.vy || 0.01);
    }
  }

  function drawStaticInk() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';
    clouds.forEach(cloud => drawCloud(cloud, 0));
    ctx.globalCompositeOperation = 'source-over';
  }

  function render(time) {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';

    for (const cloud of clouds) {
      updateCloud(cloud);
      drawCloud(cloud, time);
    }

    ctx.globalCompositeOperation = 'source-over';
    frameId = requestAnimationFrame(render);
  }

  function start() {
    cancelAnimationFrame(frameId);
    resize();
    seedInk();

    if (reducedMotion.matches) {
      running = false;
      drawStaticInk();
      return;
    }

    running = true;
    frameId = requestAnimationFrame(render);
  }

  canvas.addEventListener('pointerdown', event => {
    if (reducedMotion.matches) return;
    const box = canvas.getBoundingClientRect();
    addCloud(
      event.clientX - box.left,
      event.clientY - box.top,
      0.72 + Math.random() * 0.38
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
