(() => {
  const canvas = document.getElementById('ink-injection-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, dpr = 1, lastRelease = 0;
  const ink = [];

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width); height = Math.max(1, box.height);
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function release(x, y, strength = 1) {
    for (let i = 0; i < Math.round(34 * strength); i += 1) {
      ink.push({
        x: x + (Math.random() - .5) * 28,
        y: y + Math.random() * 12,
        vx: (Math.random() - .5) * .42,
        vy: .16 + Math.random() * .42,
        radius: 15 + Math.random() * 34,
        stretch: .55 + Math.random() * .85,
        twist: Math.random() * Math.PI,
        curl: (Math.random() - .5) * .018,
        age: 0,
        life: 300 + Math.random() * 260,
        alpha: .055 + Math.random() * .09,
        color: Math.random() > .38 ? '7,35,75' : '24,45,104'
      });
    }
  }

  function render(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';
    for (let i = ink.length - 1; i >= 0; i -= 1) {
      const p = ink[i];
      p.age += 1;
      p.vx += Math.sin(p.age * .025 + p.twist) * p.curl;
      p.vx *= .994; p.vy *= .999;
      p.x += p.vx; p.y += p.vy;
      p.radius += .055;
      const life = Math.max(0, 1 - p.age / p.life);
      const fadeIn = Math.min(1, p.age / 28);
      const alpha = p.alpha * life * fadeIn;
      const radius = p.radius;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      gradient.addColorStop(0, `rgba(${p.color},${alpha * 1.3})`);
      gradient.addColorStop(.38, `rgba(${p.color},${alpha})`);
      gradient.addColorStop(.76, `rgba(${p.color},${alpha * .28})`);
      gradient.addColorStop(1, `rgba(${p.color},0)`);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.twist + Math.sin(p.age * .012) * .12);
      ctx.scale(p.stretch, 1.45);
      ctx.translate(-p.x, -p.y);
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (p.age >= p.life || p.y - radius > height) ink.splice(i, 1);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (!reduced.matches && time - lastRelease > 6200) {
      release(width * (.58 + Math.random() * .22), height * .035, .9);
      lastRelease = time;
    }
    requestAnimationFrame(render);
  }

  canvas.addEventListener('pointerdown', (event) => {
    const box = canvas.getBoundingClientRect();
    release(event.clientX - box.left, Math.max(8, event.clientY - box.top), 1.08);
  });
  addEventListener('resize', resize, { passive: true });
  resize(); release(width * .7, height * .025, 1); requestAnimationFrame(render);
})();
