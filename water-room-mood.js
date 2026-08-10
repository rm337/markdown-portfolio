(() => {
  "use strict";

  const room = document.querySelector(".water-room");
  if (!room || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const style = document.createElement("style");
  style.id = "water-room-mood-styles";
  style.textContent = `
    .mood-canvas{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;opacity:.94}
    .water-room[data-mood-depth]{transition:filter 1.8s ease,background-color 2.2s ease}
    .water-room[data-mood-depth="1"] .caustics{opacity:.76}
    .water-room[data-mood-depth="2"] .caustics{opacity:.82}
    .water-room[data-mood-depth="3"] .caustics{opacity:.88}
    .water-room[data-mood-depth="4"] .caustics{opacity:.94}
    .water-room[data-mood-depth="3"],.water-room[data-mood-depth="4"]{filter:saturate(1.045)}
    .water-room[data-mood-state="still"] .flow-layer{animation-duration:26s!important}
    .water-room[data-mood-state="flow"] .flow-layer{animation-duration:18s!important}
    .water-room[data-mood-state="kinetic"] .flow-layer{animation-duration:12s!important}
    @media(max-width:780px){.mood-canvas{opacity:.82}}
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
  const inkSeeds = [];
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
  const bluePalette = [
    [28, 135, 184],
    [35, 170, 205],
    [78, 199, 221],
    [13, 101, 148]
  ];
  const inkPalette = [
    [36, 72, 132],
    [68, 56, 139],
    [28, 112, 143],
    [89, 52, 120]
  ];

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

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

  const seedInk = () => {
    inkSeeds.length = 0;
    const count = window.innerWidth < 760 ? 4 : 7;
    for (let i = 0; i < count; i += 1) {
      inkSeeds.push({
        x: width * (.12 + ((i * .137) % .76)),
        y: height * (.16 + ((i * .173) % .66)),
        phase: i * 1.19,
        scale: .72 + (i % 4) * .16,
        colorIndex: i % inkPalette.length
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
  window.addEventListener("resize", () => { resize(); seedDroplets(); seedInk(); }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
    lastFrame = performance.now();
  });

  const drawBlueField = time => {
    const t = time * .0001;
    const motionBoost = state === "kinetic" ? 1.45 : state === "flow" ? 1.1 : .78;
    const depthBoost = .85 + depth * .08;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (let band = 0; band < 5; band += 1) {
      const baseY = height * (.08 + band * .2);
      const amplitude = height * (.025 + band * .006) * motionBoost;
      const drift = Math.sin(t * (2.2 + band * .37) + band * 1.7) * width * .035;
      ctx.strokeStyle = rgba(bluePalette[band % bluePalette.length], (.032 + focus * .014) * depthBoost);
      ctx.lineWidth = height * (.055 + band * .008);
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = -80; x <= width + 80; x += 34) {
        const y = baseY
          + Math.sin(x * .008 + t * (5.2 + band * .55)) * amplitude
          + Math.cos(x * .0037 - t * (3.1 + band * .25)) * amplitude * .5;
        if (x === -80) ctx.moveTo(x + drift, y); else ctx.lineTo(x + drift, y);
      }
      ctx.stroke();
    }

    const glowX = width * (.5 + Math.sin(t * 2.3) * .22);
    const glowY = height * (.48 + Math.cos(t * 1.8) * .19);
    const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * .48);
    glow.addColorStop(0, `rgba(78,199,221,${.055 + focus * .035})`);
    glow.addColorStop(.45, `rgba(35,170,205,${.025 + depth * .006})`);
    glow.addColorStop(1, "rgba(13,101,148,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    if (pointer.active) {
      const radius = 150 + focus * 170;
      const pointerGlow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
      pointerGlow.addColorStop(0, `rgba(167,237,243,${.025 + focus * .055})`);
      pointerGlow.addColorStop(.5, `rgba(31,126,161,${.018 + focus * .025})`);
      pointerGlow.addColorStop(1, "rgba(31,126,161,0)");
      ctx.fillStyle = pointerGlow;
      ctx.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);
    }

    ctx.restore();
  };

  const drawInkField = time => {
    const t = time * .00012;
    const cycle = (Math.sin(time * .000055) + 1) * .5;
    const inkMix = .18 + cycle * .32 + focus * .16;
    const waterPull = state === "kinetic" ? 1.35 : state === "flow" ? 1.05 : .72;

    ctx.save();
    ctx.globalCompositeOperation = depth >= 3 ? "screen" : "soft-light";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    inkSeeds.forEach((seed, index) => {
      const originX = seed.x + Math.sin(t * (2.1 + index * .09) + seed.phase) * width * .055 * waterPull;
      const originY = seed.y + Math.cos(t * (1.35 + index * .11) + seed.phase) * height * .045;
      const length = width * (.18 + seed.scale * .09 + focus * .05);
      const color = inkPalette[seed.colorIndex];

      for (let strand = 0; strand < 3; strand += 1) {
        const offset = strand * 9 - 9;
        const alpha = inkMix * (.045 - strand * .008);
        ctx.strokeStyle = rgba(color, alpha);
        ctx.lineWidth = 14 - strand * 3 + focus * 3;
        ctx.beginPath();

        for (let s = 0; s <= 18; s += 1) {
          const p = s / 18;
          const x = originX + (p - .5) * length;
          const wave = Math.sin(p * Math.PI * (2.2 + strand * .35) + t * (5 + index * .32) + seed.phase) * height * (.025 + seed.scale * .008);
          const cross = Math.cos(p * Math.PI * 3.2 - t * (3.1 + strand * .2)) * height * .012 * waterPull;
          const y = originY + wave + cross + offset;
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      const plumeRadius = 55 + seed.scale * 42 + focus * 24;
      const plume = ctx.createRadialGradient(originX, originY, 0, originX, originY, plumeRadius);
      plume.addColorStop(0, rgba(color, inkMix * .055));
      plume.addColorStop(.45, rgba(color, inkMix * .025));
      plume.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = plume;
      ctx.fillRect(originX - plumeRadius, originY - plumeRadius, plumeRadius * 2, plumeRadius * 2);
    });

    if (depth >= 2) {
      const braidY = height * (.48 + Math.sin(t * 1.7) * .08);
      for (let braid = 0; braid < 2; braid += 1) {
        ctx.strokeStyle = rgba(palette[(braid + 1) % 4], .025 + focus * .035);
        ctx.lineWidth = 5 + braid * 3;
        ctx.beginPath();
        for (let x = -40; x <= width + 40; x += 24) {
          const y = braidY
            + Math.sin(x * .012 + t * (6.3 + braid)) * height * .035
            + Math.cos(x * .005 - t * 3.2) * height * .018;
          if (x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  const choosePaletteIndex = () => {
    const minimum = Math.min(...memory.paletteVisits);
    const candidates = memory.paletteVisits
      .map((visits, index) => ({ visits, index }))
      .filter(item => item.visits <= minimum + 1);
    return candidates[Math.floor(Math.random() * candidates.length)].index;
  };

  const addTrail = (x, y, colorIndex, strength) => {
    trails.push({ x, y, px: x, py: y, colorIndex, life: 1, strength, wobble: Math.random() * Math.PI * 2, curl: (Math.random() - .5) * .9 });
    const maxTrails = window.innerWidth < 760 ? 110 : 210;
    if (trails.length > maxTrails) trails.splice(0, trails.length - maxTrails);
  };

  const availableRareTypes = () => {
    const all = ["bloom", "constellation", "aurora", "golden-current", "mirror"];
    const unseen = all.filter(type => !memory.rareSeen.has(type));
    return unseen.length ? unseen : all;
  };

  const spawnFormation = (x, y) => {
    if (focus < .74 || memory.engagement < 8 || rareCooldown > 0 || Math.random() > .0055) return;
    const types = availableRareTypes();
    const type = types[Math.floor(Math.random() * types.length)];
    const colorIndex = type === "golden-current" ? 4 : choosePaletteIndex();
    memory.paletteVisits[colorIndex] += 1;
    memory.rareSeen.add(type);
    formations.push({ type, x, y, colorIndex, life: 1, radius: 10, spin: Math.random() * Math.PI * 2, seed: Math.random() * 1000 });
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

      if (depth >= 3 && Math.floor(time / 8500 + index) % 4 === 0) drop.colorIndex = (drop.colorIndex + 1) % palette.length;
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
      ctx.quadraticCurveTo((trail.px + trail.x) / 2 + Math.sin(time * .001 + trail.wobble) * 5, (trail.py + trail.y) / 2, trail.x, trail.y);
      ctx.stroke();
      if (trail.life <= 0) trails.splice(i, 1);
    }
  };

  const drawBloom = f => {
    for (let p = 0; p < 10; p += 1) {
      const angle = (p / 10) * Math.PI * 2;
      ctx.strokeStyle = rgba(palette[f.colorIndex], f.life * .085);
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.ellipse(Math.cos(angle) * f.radius * .3, Math.sin(angle) * f.radius * .3, f.radius * .72, f.radius * .18, angle, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawConstellation = f => {
    ctx.strokeStyle = rgba(palette[f.colorIndex], f.life * .12);
    ctx.fillStyle = rgba([235,255,255], f.life * .42);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 7; i += 1) {
      const angle = f.spin + i * 2.17;
      const radius = f.radius * (.35 + (i % 3) * .22);
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle * 1.13) * radius * .65;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    for (let i = 0; i < 7; i += 1) {
      const angle = f.spin + i * 2.17;
      const radius = f.radius * (.35 + (i % 3) * .22);
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * radius, Math.sin(angle * 1.13) * radius * .65, 1.8 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawAurora = f => {
    for (let band = 0; band < 4; band += 1) {
      ctx.strokeStyle = rgba(palette[(f.colorIndex + band) % 4], f.life * (.055 + band * .012));
      ctx.lineWidth = 8 - band * 1.4;
      ctx.beginPath();
      for (let x = -f.radius; x <= f.radius; x += 10) {
        const y = Math.sin(x * .024 + f.seed + band * .7) * (10 + band * 4) + band * 6;
        if (x === -f.radius) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const drawGoldenCurrent = f => {
    ctx.strokeStyle = rgba(palette[4], f.life * .18);
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let x = -f.radius * 1.5; x <= f.radius * 1.5; x += 8) {
      const y = Math.sin(x * .03 + f.seed) * 14;
      if (x === -f.radius * 1.5) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const drawMirror = f => {
    ctx.strokeStyle = rgba(palette[f.colorIndex], f.life * .1);
    ctx.lineWidth = 2;
    for (const direction of [-1, 1]) {
      ctx.save();
      ctx.scale(direction, 1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(f.radius * .25, -f.radius * .55, f.radius * .7, f.radius * .35, f.radius, 0);
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawFormations = dt => {
    for (let i = formations.length - 1; i >= 0; i -= 1) {
      const f = formations[i];
      f.life -= dt * .00012;
      f.radius += dt * (f.type === "aurora" ? .035 : .024);
      f.spin += dt * .00016;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.type === "mirror" ? 0 : f.spin * .2);
      ctx.globalCompositeOperation = "lighter";
      if (f.type === "bloom") drawBloom(f);
      if (f.type === "constellation") drawConstellation(f);
      if (f.type === "aurora") drawAurora(f);
      if (f.type === "golden-current") drawGoldenCurrent(f);
      if (f.type === "mirror") drawMirror(f);
      ctx.restore();
      if (f.life <= 0) formations.splice(i, 1);
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
    drawBlueField(now);
    drawInkField(now);
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
  seedInk();
  room.dataset.moodDepth = "0";
  room.dataset.moodState = "still";
  requestAnimationFrame(render);
})();
