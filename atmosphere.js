(() => {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  if (!body || document.querySelector('.atmosphere')) return;
  const layer = document.createElement('div');
  layer.className = 'atmosphere';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML = '<canvas id="inkAtmosphere"></canvas><div class="rain-layer"></div><div class="light-layer"></div>';
  body.prepend(layer);
  const canvas = layer.querySelector('canvas');
  const ctx = canvas.getContext('2d',{alpha:true});
  if (!ctx) return;
  let width=0,height=0,dpr=1,particles=[],frame=0;
  function makeParticle(scatter=false){
    const depth=Math.random();
    return {x:Math.random()*width,y:scatter?Math.random()*height:height+40+Math.random()*120,r:18+Math.random()*58,depth,drift:.06+depth*.26,rise:.035+depth*.18,phase:Math.random()*Math.PI*2,hue:Math.random()>.58?'52, 223, 208':'3, 116, 210',alpha:.018+depth*.032,stretch:1.8+Math.random()*3.8,spin:Math.random()*Math.PI};
  }
  function seed(){const count=reduceMotion?18:Math.min(46,Math.max(24,Math.floor(width/26)));particles=Array.from({length:count},()=>makeParticle(true));}
  function resize(){dpr=Math.min(window.devicePixelRatio||1,2);width=Math.max(1,innerWidth);height=Math.max(1,innerHeight);canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);seed();}
  function draw(p,time){const wobble=Math.sin(time*p.drift+p.phase)*(18+p.depth*42),x=p.x+wobble,y=p.y+Math.cos(time*.18+p.phase)*12,radius=p.r*(1+Math.sin(time*.11+p.phase)*.08),gradient=ctx.createRadialGradient(x,y,0,x,y,radius);gradient.addColorStop(0,`rgba(${p.hue},${p.alpha*2.2})`);gradient.addColorStop(.35,`rgba(${p.hue},${p.alpha})`);gradient.addColorStop(1,`rgba(${p.hue},0)`);ctx.save();ctx.translate(x,y);ctx.rotate(p.spin+Math.sin(time*.08+p.phase)*.35);ctx.scale(p.stretch,.62+p.depth*.42);ctx.translate(-x,-y);ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();ctx.restore();}
  function render(){frame+=reduceMotion?.25:1;const time=frame/60;ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='lighter';for(const p of particles){p.y-=p.rise;p.x+=Math.sin(time*p.drift+p.phase)*.045;if(p.y<-160||p.x<-220||p.x>width+220)Object.assign(p,makeParticle(false));draw(p,time);}ctx.globalCompositeOperation='source-over';if(!reduceMotion)requestAnimationFrame(render);}
  addEventListener('resize',resize,{passive:true});resize();render();
})();