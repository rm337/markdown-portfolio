(() => {
  "use strict";

  const room = document.querySelector(".water-room");
  if (!room || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const style = document.createElement("style");
  style.id = "water-room-mood-styles";
  style.textContent = `
    .mood-canvas{position:absolute;inset:0;z-index:2;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;opacity:.95}
    .water-room[data-mood-depth]{transition:filter 1.8s ease,background-color 2.2s ease}
    .water-room[data-mood-depth="1"] .caustics{opacity:.76}
    .water-room[data-mood-depth="2"] .caustics{opacity:.82}
    .water-room[data-mood-depth="3"] .caustics{opacity:.88}
    .water-room[data-mood-depth="4"] .caustics{opacity:.94}
    .water-room[data-mood-depth="3"],.water-room[data-mood-depth="4"]{filter:saturate(1.045)}
    .water-room[data-mood-state="still"] .flow-layer{animation-duration:26s!important}
    .water-room[data-mood-state="flow"] .flow-layer{animation-duration:18s!important}
    .water-room[data-mood-state="kinetic"] .flow-layer{animation-duration:12s!important}
    @media(max-width:780px){.mood-canvas{opacity:.84}}
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
  const ripples = [];
  const memory = { engagement: 0, slowBias: 0, fastBias: 0, paletteVisits: new Array(5).fill(0), rareSeen: new Set() };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let focus = 0;
  let depth = 0;
  let state = "still";
  let lastFrame = performance.now();
  let rareCooldown = 0;
  let hidden = document.hidden;
  let pondY = 0;

  const palette = [
    [101,232,255],
    [88,239,186],
    [155,123,255],
    [255,111,181],
    [255,211,110]
  ];
  const bluePalette = [[28,135,184],[35,170,205],[78,199,221],[13,101,148]];
  const inkPalette = [[36,72,132],[68,56,139],[28,112,143],[89,52,120]];
  const rgba = (c,a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const resize = () => {
    const rect = room.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    pondY = height * (window.innerWidth < 760 ? .57 : .54);
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };

  const seedDroplets = () => {
    droplets.length = 0;
    const count = window.innerWidth < 760 ? 7 : 11;
    for (let i = 0; i < count; i += 1) {
      droplets.push({
        x: width * (.08 + ((i * .083) % .84)),
        y: height * (.03 + ((i * .071) % .38)),
        r: 2.8 + (i % 4) * 1.2,
        phase: i * .73,
        fall: .024 + (i % 5) * .004,
        colorIndex: i % palette.length
      });
    }
  };

  const seedInk = () => {
    inkSeeds.length = 0;
    const count = window.innerWidth < 760 ? 4 : 7;
    for (let i = 0; i < count; i += 1) {
      inkSeeds.push({
        x: width * (.12 + ((i * .137) % .76)),
        y: pondY + height * (.06 + ((i * .087) % .25)),
        phase: i * 1.19,
        scale: .72 + (i % 4) * .16,
        colorIndex: i % inkPalette.length
      });
    }
  };

  const setPointer = (clientX,clientY,now=performance.now()) => {
    const rect = room.getBoundingClientRect();
    if (clientY < rect.top || clientY > rect.bottom || clientX < rect.left || clientX > rect.right) {
      pointer.active = false;
      return;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dt = Math.max(16,now-pointer.lastT);
    pointer.speed = Math.min(1,Math.hypot(x-pointer.lastX,y-pointer.lastY)/dt/.9);
    pointer.lastX = pointer.x = x;
    pointer.lastY = pointer.y = y;
    pointer.lastT = now;
    pointer.active = true;
  };

  window.addEventListener("pointermove",e=>setPointer(e.clientX,e.clientY),{passive:true});
  room.addEventListener("pointerleave",()=>{pointer.active=false;});
  room.addEventListener("pointerdown",e=>setPointer(e.clientX,e.clientY),{passive:true});
  window.addEventListener("resize",()=>{resize();seedDroplets();seedInk();},{passive:true});
  document.addEventListener("visibilitychange",()=>{hidden=document.hidden;lastFrame=performance.now();});

  const drawPond = time => {
    const t = time * .0001;
    const motionBoost = state === "kinetic" ? 1.35 : state === "flow" ? 1.08 : .78;

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const horizonGlow = ctx.createLinearGradient(0,pondY-55,0,pondY+55);
    horizonGlow.addColorStop(0,"rgba(178,241,249,0)");
    horizonGlow.addColorStop(.46,`rgba(130,226,239,${.08 + focus*.035})`);
    horizonGlow.addColorStop(.53,`rgba(72,186,215,${.14 + focus*.05})`);
    horizonGlow.addColorStop(1,"rgba(20,112,159,0)");
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0,pondY-60,width,120);

    const surface = ctx.createLinearGradient(0,pondY,0,height);
    surface.addColorStop(0,"rgba(63,174,211,.17)");
    surface.addColorStop(.22,"rgba(31,132,181,.12)");
    surface.addColorStop(.65,"rgba(18,92,145,.08)");
    surface.addColorStop(1,"rgba(7,61,112,.03)");
    ctx.fillStyle = surface;
    ctx.beginPath();
    ctx.moveTo(-width*.18,pondY);
    ctx.lineTo(width*1.18,pondY);
    ctx.lineTo(width*1.35,height*1.12);
    ctx.lineTo(-width*.35,height*1.12);
    ctx.closePath();
    ctx.fill();

    for (let band=0;band<6;band+=1) {
      const perspective = band/5;
      const baseY = pondY + perspective * (height-pondY) * .82;
      const amplitude = (5 + perspective*18) * motionBoost;
      ctx.strokeStyle = rgba(bluePalette[band%bluePalette.length],.035 + perspective*.018 + focus*.012);
      ctx.lineWidth = 2 + perspective*8;
      ctx.beginPath();
      for (let x=-80;x<=width+80;x+=30) {
        const y = baseY
          + Math.sin(x*.008 + t*(5.2+band*.55))*amplitude
          + Math.cos(x*.0037 - t*(3.1+band*.25))*amplitude*.45;
        if (x===-80) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = `rgba(197,247,250,${.14 + focus*.04})`;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(-20,pondY);
    ctx.lineTo(width+20,pondY);
    ctx.stroke();
    ctx.restore();
  };

  const drawInkField = time => {
    const t = time*.00012;
    const cycle = (Math.sin(time*.000055)+1)*.5;
    const inkMix = .18 + cycle*.32 + focus*.16;
    const waterPull = state === "kinetic" ? 1.35 : state === "flow" ? 1.05 : .72;

    ctx.save();
    ctx.globalCompositeOperation = depth >= 3 ? "screen" : "soft-light";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    inkSeeds.forEach((seed,index)=>{
      const originX = seed.x + Math.sin(t*(2.1+index*.09)+seed.phase)*width*.055*waterPull;
      const originY = seed.y + Math.cos(t*(1.35+index*.11)+seed.phase)*height*.035;
      const length = width*(.18+seed.scale*.09+focus*.05);
      const color = inkPalette[seed.colorIndex];
      for (let strand=0;strand<3;strand+=1) {
        const offset = strand*8-8;
        ctx.strokeStyle = rgba(color,inkMix*(.04-strand*.007));
        ctx.lineWidth = 13-strand*3+focus*3;
        ctx.beginPath();
        for (let s=0;s<=18;s+=1) {
          const p=s/18;
          const x=originX+(p-.5)*length;
          const y=originY
            + Math.sin(p*Math.PI*(2.2+strand*.35)+t*(5+index*.32)+seed.phase)*height*(.02+seed.scale*.006)
            + Math.cos(p*Math.PI*3.2-t*(3.1+strand*.2))*height*.009*waterPull
            + offset;
          if (s===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    });
    ctx.restore();
  };

  const addRipple = (x,colorIndex,strength=.7) => {
    ripples.push({x,y:pondY,colorIndex,life:1,radius:4,strength,phase:Math.random()*Math.PI*2});
    if (ripples.length > (window.innerWidth<760?20:32)) ripples.shift();
  };

  const drawRipples = dt => {
    for (let i=ripples.length-1;i>=0;i-=1) {
      const ripple=ripples[i];
      ripple.life -= dt*.0005;
      ripple.radius += dt*(.055 + ripple.strength*.035);
      const color=palette[ripple.colorIndex];
      const alpha=Math.max(0,ripple.life)*(.24+.18*ripple.strength);
      ctx.save();
      ctx.translate(ripple.x,ripple.y);
      ctx.scale(1,.22 + Math.min(.12,ripple.radius/900));
      ctx.lineWidth=1.3;
      for (let ring=0;ring<3;ring+=1) {
        const r=ripple.radius+ring*13;
        ctx.strokeStyle=rgba(color,alpha*(1-ring*.25));
        ctx.beginPath();
        ctx.ellipse(0,0,r,r*.88,0,0,Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();
      if (ripple.life<=0) ripples.splice(i,1);
    }
  };

  const choosePaletteIndex = () => {
    const minimum=Math.min(...memory.paletteVisits);
    const candidates=memory.paletteVisits.map((visits,index)=>({visits,index})).filter(item=>item.visits<=minimum+1);
    return candidates[Math.floor(Math.random()*candidates.length)].index;
  };

  const addTrail = (x,y,colorIndex,strength) => {
    trails.push({x,y,px:x,py:y,colorIndex,life:1,strength,wobble:Math.random()*Math.PI*2,curl:(Math.random()-.5)*.9});
    const maxTrails=window.innerWidth<760?90:170;
    if (trails.length>maxTrails) trails.splice(0,trails.length-maxTrails);
  };

  const availableRareTypes=()=>{
    const all=["bloom","constellation","aurora","golden-current","mirror"];
    const unseen=all.filter(type=>!memory.rareSeen.has(type));
    return unseen.length?unseen:all;
  };

  const spawnFormation=(x,y)=>{
    if (focus<.74||memory.engagement<8||rareCooldown>0||Math.random()>.0055) return;
    const types=availableRareTypes();
    const type=types[Math.floor(Math.random()*types.length)];
    const colorIndex=type==="golden-current"?4:choosePaletteIndex();
    memory.paletteVisits[colorIndex]+=1;
    memory.rareSeen.add(type);
    formations.push({type,x,y,colorIndex,life:1,radius:10,spin:Math.random()*Math.PI*2,seed:Math.random()*1000});
    rareCooldown=13;
  };

  const resetDrop = drop => {
    drop.x = width*(.06+Math.random()*.88);
    drop.y = -20-Math.random()*height*.3;
    drop.fall = .024+Math.random()*.018;
    drop.colorIndex = Math.floor(Math.random()*palette.length);
  };

  const drawDroplets = (time,dt) => {
    let proximity=0;
    droplets.forEach((drop,index)=>{
      const swayX=Math.sin(time*.0005+drop.phase)*(8+(index%3)*5);
      drop.y += dt*drop.fall;
      const x=drop.x+swayX;
      const y=drop.y;
      const distance=pointer.active?Math.hypot(pointer.x-x,pointer.y-y):9999;
      const near=Math.max(0,1-distance/150);
      proximity=Math.max(proximity,near);
      const color=palette[drop.colorIndex];
      const glow=.16+near*.55+focus*.18;
      const gradient=ctx.createRadialGradient(x-drop.r*.25,y-drop.r*.35,0,x,y,drop.r*(2.3+near));
      gradient.addColorStop(0,`rgba(255,255,255,${.72+near*.22})`);
      gradient.addColorStop(.28,rgba(color,glow));
      gradient.addColorStop(1,rgba(color,0));
      ctx.fillStyle=gradient;
      ctx.beginPath();
      ctx.arc(x,y,drop.r*(2.3+near*.7),0,Math.PI*2);
      ctx.fill();

      if (near>.24&&focus>.12&&Math.random()<.35) addTrail(x,y,drop.colorIndex,.25+near*.75);

      if (y>=pondY) {
        addRipple(x,drop.colorIndex,.45+near*.45+focus*.25);
        if (focus>.45) spawnFormation(x,pondY+18);
        resetDrop(drop);
      }
    });

    const steadiness=pointer.active?1-pointer.speed:0;
    const target=pointer.active?Math.min(1,proximity*.7+steadiness*.2):0;
    focus+=(target-focus)*Math.min(1,dt*.003);
    if (pointer.active&&proximity>.25) {
      memory.engagement+=dt/1000;
      memory.slowBias+=steadiness*dt/1000;
      memory.fastBias+=pointer.speed*dt/1000;
    }
  };

  const drawTrails=(time,dt)=>{
    ctx.lineCap="round";
    ctx.lineJoin="round";
    for(let i=trails.length-1;i>=0;i-=1){
      const trail=trails[i];
      trail.life-=dt*(.00042+(1-focus)*.0005);
      trail.wobble+=dt*(.001+Math.abs(trail.curl)*.0005);
      trail.px=trail.x;trail.py=trail.y;
      trail.x+=Math.sin(trail.wobble)*(.16+focus*.72)+trail.curl;
      trail.y+=dt*(.0018+focus*.0015);
      ctx.strokeStyle=rgba(palette[trail.colorIndex],Math.max(0,trail.life)*(.08+trail.strength*.2)*(.4+focus));
      ctx.lineWidth=1+trail.strength*3.4+focus*2.1;
      ctx.beginPath();ctx.moveTo(trail.px,trail.py);
      ctx.quadraticCurveTo((trail.px+trail.x)/2+Math.sin(time*.001+trail.wobble)*5,(trail.py+trail.y)/2,trail.x,trail.y);
      ctx.stroke();
      if(trail.life<=0) trails.splice(i,1);
    }
  };

  const drawBloom=f=>{for(let p=0;p<10;p+=1){const a=(p/10)*Math.PI*2;ctx.strokeStyle=rgba(palette[f.colorIndex],f.life*.085);ctx.lineWidth=2.1;ctx.beginPath();ctx.ellipse(Math.cos(a)*f.radius*.3,Math.sin(a)*f.radius*.3,f.radius*.72,f.radius*.18,a,0,Math.PI*2);ctx.stroke();}};
  const drawConstellation=f=>{ctx.strokeStyle=rgba(palette[f.colorIndex],f.life*.12);ctx.fillStyle=rgba([235,255,255],f.life*.42);ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<7;i+=1){const a=f.spin+i*2.17;const r=f.radius*(.35+(i%3)*.22);const px=Math.cos(a)*r;const py=Math.sin(a*1.13)*r*.65;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();};
  const drawAurora=f=>{for(let b=0;b<4;b+=1){ctx.strokeStyle=rgba(palette[(f.colorIndex+b)%4],f.life*(.055+b*.012));ctx.lineWidth=8-b*1.4;ctx.beginPath();for(let x=-f.radius;x<=f.radius;x+=10){const y=Math.sin(x*.024+f.seed+b*.7)*(10+b*4)+b*6;if(x===-f.radius)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}};
  const drawGoldenCurrent=f=>{ctx.strokeStyle=rgba(palette[4],f.life*.18);ctx.lineWidth=3.5;ctx.beginPath();for(let x=-f.radius*1.5;x<=f.radius*1.5;x+=8){const y=Math.sin(x*.03+f.seed)*14;if(x===-f.radius*1.5)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();};
  const drawMirror=f=>{ctx.strokeStyle=rgba(palette[f.colorIndex],f.life*.1);ctx.lineWidth=2;for(const d of[-1,1]){ctx.save();ctx.scale(d,1);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(f.radius*.25,-f.radius*.55,f.radius*.7,f.radius*.35,f.radius,0);ctx.stroke();ctx.restore();}};

  const drawFormations=dt=>{
    for(let i=formations.length-1;i>=0;i-=1){
      const f=formations[i];f.life-=dt*.00012;f.radius+=dt*(f.type==="aurora"?.035:.024);f.spin+=dt*.00016;
      ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,.45);ctx.rotate(f.type==="mirror"?0:f.spin*.2);ctx.globalCompositeOperation="lighter";
      if(f.type==="bloom")drawBloom(f);if(f.type==="constellation")drawConstellation(f);if(f.type==="aurora")drawAurora(f);if(f.type==="golden-current")drawGoldenCurrent(f);if(f.type==="mirror")drawMirror(f);
      ctx.restore();if(f.life<=0)formations.splice(i,1);
    }
  };

  const updateAtmosphere=()=>{
    const nextDepth=focus>.78?4:focus>.56?3:focus>.34?2:focus>.14?1:0;
    if(nextDepth!==depth){depth=nextDepth;room.dataset.moodDepth=String(depth);}
    const slowRatio=memory.engagement?memory.slowBias/memory.engagement:0;
    const fastRatio=memory.engagement?memory.fastBias/memory.engagement:0;
    const nextState=focus<.18?"still":fastRatio>.42&&pointer.speed>.35?"kinetic":slowRatio>.52?"flow":"still";
    if(nextState!==state){state=nextState;room.dataset.moodState=state;}
  };

  const render=now=>{
    if(hidden){requestAnimationFrame(render);return;}
    const dt=Math.min(40,now-lastFrame||16);lastFrame=now;rareCooldown=Math.max(0,rareCooldown-dt/1000);
    ctx.clearRect(0,0,width,height);
    drawPond(now);
    drawInkField(now);
    ctx.globalCompositeOperation="lighter";
    drawRipples(dt);
    drawTrails(now,dt);
    drawDroplets(now,dt);
    drawFormations(dt);
    ctx.globalCompositeOperation="source-over";
    updateAtmosphere();
    requestAnimationFrame(render);
  };

  resize();seedDroplets();seedInk();room.dataset.moodDepth="0";room.dataset.moodState="still";requestAnimationFrame(render);
})();
