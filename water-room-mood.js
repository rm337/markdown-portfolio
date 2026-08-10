(() => {
  "use strict";

  const room = document.querySelector(".water-room");
  if (!room || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const style = document.createElement("style");
  style.id = "water-room-mood-styles";
  style.textContent = `
    .mood-canvas{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;opacity:.92}
    .water-room[data-mood-depth="1"] .caustics{opacity:.76}
    .water-room[data-mood-depth="2"] .caustics{opacity:.82}
    .water-room[data-mood-depth="3"] .caustics{opacity:.88}
    .water-room[data-mood-depth="4"] .caustics{opacity:.94}
    .water-room[data-mood-depth]{transition:filter 1.8s ease}
    .water-room[data-mood-depth="3"],.water-room[data-mood-depth="4"]{filter:saturate(1.04)}
    @media(max-width:780px){.mood-canvas{opacity:.78}}
    @media(prefers-reduced-motion:reduce){.mood-canvas{display:none!important}}
  `;
  document.head.appendChild(style);

  const canvas = document.createElement("canvas");
  canvas.className = "mood-canvas";
  canvas.setAttribute("aria-hidden", "true");
  room.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const pointer = { x: 0, y: 0, active: false, lastX: 0, lastY: 0, lastT: performance.now(), speed: 0 };
  const droplets = [];
  const trails = [];
  const blooms = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let focus = 0;
  let depth = 0;
  let lastFrame = performance.now();
  let rareCooldown = 0;

  const palette = [
    [101, 232, 255],
    [88, 239, 186],
    [155, 123, 255],
    [255, 111, 181],
    [255, 211, 110]
  ];

  const resize = () => {
    const rect = room.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const seedDroplets = () => {
    droplets.length = 0;
    const count = window.innerWidth < 760 ? 8 : 13;
    for (let i = 0; i < count; i += 1) {
      droplets.push({
        x: width * (.08 + ((i * 0.073) % .82)),
        y: height * (.12 + ((i * 0.117) % .72)),
        r: 3 + (i % 4) * 1.4,
        phase: i * .73,
        drift: .55 + (i % 5) * .12,
        color: palette[i % 3]
      });
    }
  };

  const setPointer = (clientX, clientY, now = performance.now()) => {
    const rect = room.getBoundingClientRect();
    if (clientY < rect.top || clientY > rect.bottom || clientX < rect.left || clientX > rect.right) {
      pointer.active = false;
      return;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dt = Math.max(16, now - pointer.lastT);
    const dx = x - pointer.lastX;
    const dy = y - pointer.lastY;
    pointer.speed = Math.min(1, Math.hypot(dx, dy) / dt / .9);
    pointer.lastX = pointer.x = x;
    pointer.lastY = pointer.y = y;
    pointer.lastT = now;
    pointer.active = true;
  };

  window.addEventListener("pointermove", event => setPointer(event.clientX, event.clientY), { passive: true });
  room.addEventListener("pointerleave", () => { pointer.active = false; });
  room.addEventListener("pointerdown", event => setPointer(event.clientX, event.clientY), { passive: true });
  window.addEventListener("resize", () => { resize(); seedDroplets(); }, { passive: true });

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const addTrail = (x, y, color, strength) => {
    trails.push({ x, y, px: x, py: y, color, life: 1, strength, wobble: Math.random() * Math.PI * 2 });
    if (trails.length > (window.innerWidth < 760 ? 120 : 220)) trails.splice(0, trails.length - 180);
  };

  const maybeBloom = (x, y, color) => {
    if (focus < .72 || rareCooldown > 0 || Math.random() > .006) return;
    blooms.push({ x, y, color, life: 1, radius: 8, spin: Math.random() * Math.PI * 2 });
    rareCooldown = 9;
  };

  const drawDroplets = (time, dt) => {
    let proximity = 0;
    droplets.forEach((drop, index) => {
      const swayX = Math.sin(time * .00045 * drop.drift + drop.phase) * (14 + index % 3 * 7);
      const swayY = Math.cos(time * .00034 * drop.drift + drop.phase) * (9 + index % 4 * 4);
      drop.y -= dt * (.007 + drop.drift * .0025);
      if (drop.y < height * .08) drop.y = height * .82;
      const x = drop.x + swayX;
      const y = drop.y + swayY;
      const distance = pointer.active ? Math.hypot(pointer.x - x, pointer.y - y) : 9999;
      const near = Math.max(0, 1 - distance / 150);
      proximity = Math.max(proximity, near);

      const colorIndex = depth >= 3 ? (index + Math.floor(time / 9000)) % palette.length : index % 3;
      drop.color = palette[colorIndex];
      const glow = .16 + near * .6 + focus * .18;

      const gradient = ctx.createRadialGradient(x - drop.r * .25, y - drop.r * .35, 0, x, y, drop.r * (2.4 + near * 1.2));
      gradient.addColorStop(0, `rgba(255,255,255,${.7 + near * .25})`);
      gradient.addColorStop(.28, rgba(drop.color, glow));
      gradient.addColorStop(1, rgba(drop.color, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, drop.r * (2.4 + near * .8), 0, Math.PI * 2);
      ctx.fill();

      if (near > .24 && focus > .12 && Math.random() < .46) {
        addTrail(x, y, drop.color, .25 + near * .75);
        maybeBloom(x, y, drop.color);
      }
    });

    const target = pointer.active ? Math.min(1, proximity * .68 + (1 - pointer.speed) * .18) : 0;
    focus += (target - focus) * Math.min(1, dt * .0032);
  };

  const drawTrails = (time, dt) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = trails.length - 1; i >= 0; i -= 1) {
      const trail = trails[i];
      trail.life -= dt * (.00045 + (1 - focus) * .00045);
      trail.wobble += dt * .0012;
      trail.px = trail.x;
      trail.py = trail.y;
      trail.x += Math.sin(trail.wobble) * (.16 + focus * .7);
      trail.y -= dt * (.003 + focus * .003);
      const alpha = Math.max(0, trail.life) * (.09 + trail.strength * .18) * (0.45 + focus);
      ctx.strokeStyle = rgba(trail.color, alpha);
      ctx.lineWidth = 1 + trail.strength * 3.5 + focus * 2.2;
      ctx.beginPath();
      ctx.moveTo(trail.px, trail.py);
      ctx.quadraticCurveTo(
        (trail.px + trail.x) / 2 + Math.sin(time * .001 + trail.wobble) * 5,
        (trail.py + trail.y) / 2,
        trail.x,
        trail.y
      );
      ctx.stroke();
      if (trail.life <= 0) trails.splice(i, 1);
    }
  };

  const drawBlooms = (dt) => {
    for (let i = blooms.length - 1; i >= 0; i -= 1) {
      const bloom = blooms[i];
      bloom.life -= dt * .00016;
      bloom.radius += dt * .025;
      bloom.spin += dt * .00018;
      const petals = 9;
      ctx.save();
      ctx.translate(bloom.x, bloom.y);
      ctx.rotate(bloom.spin);
      ctx.globalCompositeOperation = "lighter";
      for (let p = 0; p < petals; p += 1) {
        const angle = (p / petals) * Math.PI * 2;
        ctx.strokeStyle = rgba(bloom.color, Math.max(0, bloom.life) * .08);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(angle) * bloom.radius * .3,
          Math.sin(angle) * bloom.radius * .3,
          bloom.radius * .72,
          bloom.radius * .18,
          angle,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
      ctx.restore();
      if (bloom.life <= 0) blooms.splice(i, 1);
    }
  };

  const updateDepth = () => {
    const next = focus > .78 ? 4 : focus > .56 ? 3 : focus > .34 ? 2 : focus > .14 ? 1 : 0;
    if (next === depth) return;
    depth = next;
    room.dataset.moodDepth = String(depth);
  };

  const render = now => {
    const dt = Math.min(40, now - lastFrame || 16);
    lastFrame = now;
    rareCooldown = Math.max(0, rareCooldown - dt / 1000);

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    drawTrails(now, dt);
    drawDroplets(now, dt);
    drawBlooms(dt);
    ctx.globalCompositeOperation = "source-over";
    updateDepth();

    requestAnimationFrame(render);
  };

  resize();
  seedDroplets();
  room.dataset.moodDepth = "0";
  requestAnimationFrame(render);
})();
