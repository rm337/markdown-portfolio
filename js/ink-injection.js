(() => {
  const canvas = document.getElementById('ink-injection-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const plumes = [];
  let width = 1, height = 1, dpr = 1, lastRelease = 0;

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width); height = Math.max(1, box.height);
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function release(x, y, strength = 1) {
    for (let i = 0; i < 5; i += 1) {
      plumes.push({
        x: x + (i - 2) * 9 + (Math.random() - .5) * 10,
        y: y - i * 8,
        vx: (Math.random() - .5) * .16,
        vy: .12 + Math.random() * .14,
        w: (42 + Math.random() * 34) * strength,
        h: (52 + Math.random() * 46) * strength,
        age: -i * 16,
        life: 430 + Math.random() * 160,
        phase: Math.random() * Math.PI * 2,
        turn: (Math.random() - .5) * .0028,
        tone: i % 3 === 0 ? '18,28,88' : '4,38,83',
        alpha: .16 + Math.random() * .08
      });
    }
  }

  function blobPath(p, time) {
    const points = [];
    const count = 22;
    for (let i = 0; i < count; i += 1) {
      const a = i / count * Math.PI * 2;
      const wobble = 1 + Math.sin(a * 3 + p.phase + time * .00028) * .16 + Math.sin(a * 5 - p.phase * .7) * .08;
      points.push({ x: Math.cos(a) * p.w * wobble, y: Math.sin(a) * p.h * wobble });
    }
    ctx.beginPath();
    const firstMid = { x:(points[0].x + points[count-1].x)/2, y:(points[0].y + points[count-1].y)/2 };
    ctx.moveTo(firstMid.x, firstMid.y);
    for (let i = 0; i < count; i += 1) {
      const next = points[(i + 1) % count];
      ctx.quadraticCurveTo(points[i].x, points[i].y, (points[i].x + next.x)/2, (points[i].y + next.y)/2);
    }
    ctx.closePath();
  }

  function render(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';
    for (let i = plumes.length - 1; i >= 0; i -= 1) {
      const p = plumes[i];
      p.age += 1;
      if (p.age < 0) continue;
      p.x += p.vx + Math.sin(p.age * .014 + p.phase) * .045;
      p.y += p.vy;
      p.w += .055; p.h += .075;
      p.phase += p.turn;
      const fadeIn = Math.min(1, p.age / 35);
      const fadeOut = Math.max(0, 1 - p.age / p.life);
      const alpha = p.alpha * fadeIn * fadeOut;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.sin(p.age * .006 + p.phase) * .12);
      ctx.shadowBlur = 26;
      ctx.shadowColor = `rgba(${p.tone},${alpha * .75})`;
      blobPath(p, time);
      ctx.fillStyle = `rgba(${p.tone},${alpha})`;
      ctx.fill();
      ctx.clip();
      for (let wisp = -1; wisp <= 1; wisp += 1) {
        ctx.beginPath();
        ctx.moveTo(wisp * p.w * .22, -p.h * .66);
        ctx.bezierCurveTo(-p.w * .45, -p.h * .12, p.w * .45, p.h * .16, wisp * p.w * .28, p.h * .72);
        ctx.strokeStyle = `rgba(1,22,66,${alpha * .55})`;
        ctx.lineWidth = 5 + (wisp + 1) * 2;
        ctx.stroke();
      }
      ctx.restore();
      if (p.age > p.life || p.y - p.h > height) plumes.splice(i, 1);
    }
    ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over';
    if (!reduced.matches && time - lastRelease > 6800) {
      release(width * (.58 + Math.random() * .18), height * .035, .92);
      lastRelease = time;
    }
    requestAnimationFrame(render);
  }

  canvas.addEventListener('pointerdown', event => {
    const box = canvas.getBoundingClientRect();
    release(event.clientX - box.left, Math.max(14, event.clientY - box.top), 1.05);
  });
  addEventListener('resize', resize, { passive: true });
  resize(); release(width * .69, height * .035, 1); requestAnimationFrame(render);
})();
