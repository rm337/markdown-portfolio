(() => {
  "use strict";

  const room = document.querySelector(".water-room");
  if (!room || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const style = document.createElement("style");
  style.id = "water-room-mood-styles";
  style.textContent = `
    .mood-canvas{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;opacity:.92}
    .water-room[data-mood-depth]{transition:filter 1.8s ease,background-color 2.2s ease}
    .water-room[data-mood-depth="1"] .caustics{opacity:.76}
    .water-room[data-mood-depth="2"] .caustics{opacity:.82}
    .water-room[data-mood-depth="3"] .caustics{opacity:.88}
    .water-room[data-mood-depth="4"] .caustics{opacity:.94}
    .water-room[data-mood-depth="3"],.water-room[data-mood-depth="4"]{filter:saturate(1.045)}
    .water-room[data-mood-state="still"] .flow-layer{animation-duration:26s!important}
    .water-room[data-mood-state="flow"] .flow-layer{animation-duration:18s!important}
    .water-room[data-mood-state="kinetic"] .flow-layer{animation-duration:12s!important}
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
  const formations = [];
  const memory = {
    engagement: 0,
    slowBias: 0,
    fastBias: 0,
    paletteVisits: new Array(5).fill(0),
    rareSeen: new Set()
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let focus = 0;
  let depth = 0;
  let state = "still";
  let lastFrame = performance.now();
  let rareCooldown = 0;
  let hidden = document.hidden;

  const palette = [
    [101, 232, 255],
    [88, 239, 186],
    [155, 123, 255],
    [255, 111, 181],
    [255, 211, 110]
  ];

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const clamp01 = value => Math.max(0, Math.min(1, value));

  const resize = () => {
    const rect = room.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
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
        x: width * (.08 + ((i * .073) % .82)),
        y: height * (.12 + ((i * .117) % .72)),
        r: 3 + (i % 4) * 1.4,
        phase: i * .73,
        drift: .55 + (i % 5) * .12,
        colorIndex: i % 3
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
  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
    lastFrame = performance.now();
  });

  const choosePaletteIndex = () => {
    const minimum = Math.min(...memory.paletteVisits);
    const candidates = memory.paletteVisits
      .map((visits, index) => ({ visits, index }))
      .filter(item => item.visits <= minimum + 1);
    return candidates[Math.floor(Math.random() * candidates.length)].index;
  };

  const addTrail = (x, y, colorIndex, strength) => {
    trails.push({
      x,
      y,
      px: x,
      py: y,
      colorIndex,
      life: 1,
      strength,
      wobble: Math.random() * Math.PI * 2,
      curl: (Math.random() - .5) * .9
    });
    const maxTrails = window.innerWidth < 760 ? 110 : 210;
    if (trails.length > maxTrails) trails.splice(0, trails.length - maxTrails);
  };

  const availableRareTypes = () => {
    const all = ["bloom", "constellation", "aurora", "golden-current", "mirror"];
    const unseen = all.filter(type => !memory.rareSeen.has(type));
    return unseen.length ? unseen : all;
  };

  const spawnFormation = (x, y) => {
    if (focus < .74 || memory.engagement < 8 || rareCooldown > 0) return;
    if (Math.random() > .0055) return;

    const types = availableRareTypes();
    const type = types[Math.floor(Math.random() * types.length)];
    const colorIndex = type === "golden-current" ? 4 : choosePaletteIndex();
    memory.paletteVisits[colorIndex] += 1;
    memory.rareSeen.add(type);
    formations.push({
      type,
      x,
      y,
      colorIndex,
      life: 1,
      radius: 10,
      spin: Math.random() * Math.PI * 2,
      seed: Math.random() * 1000
    });
    rareCooldown = 13;
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

      if (depth >= 3 && Math.floor(time / 8500 + index) % 4 === 0) {
        drop.colorIndex = (drop.colorIndex + 1) % palette.length;
      }
      const color = palette[drop.colorIndex];
      const glow = .16 + near * .6 + focus * .18;
      const gradient = ctx.createRadialGradient(x - drop.r * .25, y - drop.r * .35, 0, x, y, drop.r * (2.4 + near * 1.2));
      gradient.addColorStop(0, `rgba(255,255,255,${.7 + near * .25})`);
      gradient.addColorStop(.28, rgba(color, glow));
      gradient.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, drop.r * (2.4 + near * .8), 0, Math.PI * 2);
      ctx.fill();

      if (near > .24 && focus > .12 && Math.random() < .45) {
        addTrail(x, y, drop.colorIndex, .25 + near * .75);
        spawnFormation(x, y);
      }
    });

    const steadiness = pointer.active ? 1 - pointer.speed : 0;
    const target = pointer.active ? Math.min(1, proximity * .7 + steadiness * .2) : 0;
    focus += (target - focus) * Math.min(1, dt * .003);

    if (pointer.active && proximity > .25) {
      memory.engagement += dt / 1000;
      memory.slowBias += steadiness * dt / 1000;
      memory.fastBias += pointer.speed * dt / 1000;
    }
  };

  const drawTrails = (time, dt) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = trails.length - 1; i >= 0; i -= 1) {
      const trail = trails[i];
      trail.life -= dt * (.00042 + (1 - focus) * .0005);
      trail.wobble += dt * (.001 + Math.abs(trail.curl) * .0005);
      trail.px = trail.x;
      trail.py = trail.y;
      trail.x += Math.sin(trail.wobble) * (.16 + focus * .72) + trail.curl;
      trail.y -= dt * (.0028 + focus * .0032);
      const alpha = Math.max(0, trail.life) * (.08 + trail.strength * .2) * (.4 + focus);
      ctx.strokeStyle = rgba(palette[trail.colorIndex], alpha);
      ctx.lineWidth = 1 + trail.strength * 3.4 + focus * 2.1;
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

  const drawBloom = formation => {
    const petals = 10;
    for (let p = 0; p < petals; p += 1) {
      const angle = (p / petals) * Math.PI * 2;
      ctx.strokeStyle = rgba(palette[formation.colorIndex], formation.life * .085);
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle) * formation.radius * .3, Math.sin(angle) * formation.radius * .3, formation.radius * .72, formation.radius * .18, angle, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawConstellation = formation => {
    const points = 7;
    ctx.strokeStyle = rgba(palette[formation.colorIndex], formation.life * .12);
    ctx.fillStyle = rgba([235, 255, 255], formation.life * .42);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < points; i += 1) {
      const angle = formation.spin + i * 2.17;
      const radius = formation.radius * (.35 + (i % 3) * .22);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle * 1.13) * radius * .65;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    for (let i = 0; i < points; i += 1) {
      const angle = formation.spin + i * 2.17;
      const radius = formation.radius * (.35 + (i % 3) * .22);
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * radius, Math.sin(angle * 1.13) * radius * .65, 1.8 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawAurora = formation => {
    for (let band = 0; band < 4; band += 1) {
      const colorIndex = (formation.colorIndex + band) % 4;
      ctx.strokeStyle = rgba(palette[colorIndex], formation.life * (.055 + band * .012));
      ctx.lineWidth = 8 - band * 1.4;
      ctx.beginPath();
      for (let x = -formation.radius; x <= formation.radius; x += 10) {
        const y = Math.sin(x * .024 + formation.seed + band * .7) * (10 + band * 4) + band * 6;
        if (x === -formation.radius) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const drawGoldenCurrent = formation => {
    const gold = palette[4];
    ctx.strokeStyle = rgba(gold, formation.life * .18);
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let x = -formation.radius * 1.5; x <= formation.radius * 1.5; x += 8) {
      const y = Math.sin(x * .03 + formation.seed) * 14;
      if (x === -formation.radius * 1.5) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const drawMirror = formation => {
    ctx.strokeStyle = rgba(palette[formation.colorIndex], formation.life * .1);
    ctx.lineWidth = 2;
    for (const direction of [-1, 1]) {
      ctx.save();
      ctx.scale(direction, 1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(formation.radius * .25, -formation.radius * .55, formation.radius * .7, formation.radius * .35, formation.radius, 0);
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawFormations = dt => {
    for (let i = formations.length - 1; i >= 0; i -= 1) {
      const formation = formations[i];
      formation.life -= dt * .00012;
      formation.radius += dt * (formation.type === "aurora" ? .035 : .024);
      formation.spin += dt * .00016;

      ctx.save();
      ctx.translate(formation.x, formation.y);
      ctx.rotate(formation.type === "mirror" ? 0 : formation.spin * .2);
      ctx.globalCompositeOperation = "lighter";

      if (formation.type === "bloom") drawBloom(formation);
      if (formation.type === "constellation") drawConstellation(formation);
      if (formation.type === "aurora") drawAurora(formation);
      if (formation.type === "golden-current") drawGoldenCurrent(formation);
      if (formation.type === "mirror") drawMirror(formation);

      ctx.restore();
      if (formation.life <= 0) formations.splice(i, 1);
    }
  };

  const updateAtmosphere = () => {
    const nextDepth = focus > .78 ? 4 : focus > .56 ? 3 : focus > .34 ? 2 : focus > .14 ? 1 : 0;
    if (nextDepth !== depth) {
      depth = nextDepth;
      room.dataset.moodDepth = String(depth);
    }

    const slowRatio = memory.engagement ? memory.slowBias / memory.engagement : 0;
    const fastRatio = memory.engagement ? memory.fastBias / memory.engagement : 0;
    const nextState = focus < .18 ? "still" : fastRatio > .42 && pointer.speed > .35 ? "kinetic" : slowRatio > .52 ? "flow" : "still";
    if (nextState !== state) {
      state = nextState;
      room.dataset.moodState = state;
    }
  };

  const render = now => {
    if (hidden) {
      requestAnimationFrame(render);
      return;
    }

    const dt = Math.min(40, now - lastFrame || 16);
    lastFrame = now;
    rareCooldown = Math.max(0, rareCooldown - dt / 1000);

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    drawTrails(now, dt);
    drawDroplets(now, dt);
    drawFormations(dt);
    ctx.globalCompositeOperation = "source-over";
    updateAtmosphere();

    requestAnimationFrame(render);
  };

  resize();
  seedDroplets();
  room.dataset.moodDepth = "0";
  room.dataset.moodState = "still";
  requestAnimationFrame(render);
})();
