(() => {
  "use strict";

  const FORMATS = [
    ["html-single","Single-file HTML",".html"],["html-css-js","HTML + CSS + JS",".html/.css/.js"],["javascript","JavaScript",".js"],["typescript","TypeScript",".ts"],["react-jsx","React / JSX",".jsx"],["react-tsx","React / TSX",".tsx"],["vue","Vue",".vue"],["svelte","Svelte",".svelte"],["svg","SVG",".svg"],["canvas","Canvas 2D",".html"],["tailwind","Tailwind",".html"],["p5","p5.js",".js"],["three","Three.js",".js"],["json-spec","JSON Design Spec",".json"],["mdx","MDX",".mdx"]
  ];

  const METHODS = ["Vinyl","Screen Print","Embroidery","Patch","DTG","Sublimation"];
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]);

  function data(context){
    const r=typeof context==="function"?context():context||{};
    return {
      title:String(r.title||r.phrase||"Untitled design"),
      phrase:String(r.phrase||r.reading||r.title||"Untitled design"),
      explanation:String(r.explanation||r.route||""),
      visual:String(r.visual||r.direction||"Inkspirations Studios treatment"),
      product:String(r.product||"T-Shirt"),
      price:r.price==null?"":String(r.price),
      direction:String(r.directionMode||"Robert gives the direction"),
      source:String(r.source||document.title)
    };
  }

  function generate(format,context,method){ return {format,method,...data(context)}; }

  function productClass(name){
    const p=String(name||"").toLowerCase();
    if(p.includes("hood")||p.includes("sweat"))return"hoodie";
    if(p.includes("hat")||p.includes("cap"))return"hat";
    if(p.includes("mug"))return"mug";
    if(p.includes("tote"))return"tote";
    if(p.includes("poster")||p.includes("print"))return"poster";
    return"shirt";
  }

  function surfacesFor(product){
    const pc=productClass(product);
    if(pc==="hat")return ["FRONT","SIDE","BACK","TOP"];
    if(pc==="mug")return ["FRONT","BACK","WRAP"];
    if(pc==="poster")return ["FRONT"];
    return ["FRONT","BACK"];
  }

  function surfaceText(surface,d){
    if(surface==="FRONT") return d.phrase;
    if(surface==="BACK") return d.explanation || "SECOND READ";
    if(surface==="SIDE") return d.phrase.split(/\s+/).slice(0,2).join(" ") || d.phrase;
    if(surface==="TOP") return d.phrase.split(/\s+/)[0] || d.phrase;
    if(surface==="WRAP") return `${d.phrase} • ${d.explanation||d.phrase}`;
    return d.phrase;
  }

  function mount(target,context,options={}){
    const host=typeof target==="string"?document.querySelector(target):target;
    if(!host||host.dataset.gadgetCodeMounted==="true")return;
    if(typeof target==="string"&&target==="#doubleTakerCode"&&document.querySelector("#shirtCode"))return;
    host.dataset.gadgetCodeMounted="true";

    const wrap=document.createElement("section");
    wrap.className="gadget-code-options";
    wrap.innerHTML=`<style>
      .gadget-code-options{margin-top:18px;padding:18px;border:1px solid rgba(1,116,243,.45);border-radius:18px;background:#050d19;color:#f7fbff;text-align:left}
      .gco-head h3{margin:0;font:800 1.05rem Inter,system-ui}.gco-head p{margin:5px 0;color:#9eb2c9;font-size:.86rem}
      .gco-sub{margin-top:14px;color:#83f3ba;font-size:.7rem;font-weight:850;letter-spacing:.13em;text-transform:uppercase}
      .gco-grid,.gco-methods{display:flex;flex-wrap:wrap;gap:8px;margin-top:9px}
      .gco-btn,.gco-method{border:1px solid rgba(255,255,255,.16);background:#0a1728;color:#dce8f6;border-radius:999px;padding:9px 12px;font:750 .78rem Inter,system-ui;cursor:pointer}
      .gco-btn[aria-pressed=true],.gco-method[aria-pressed=true]{background:#0174F3;color:white;border-color:#0174F3}
      .gco-stage{display:none;margin-top:18px}.gco-stage.open{display:block}.gco-stage-head{margin-bottom:10px}.gco-stage-head strong{font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:#83f3ba}
      .gco-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}
      .gco-side{text-align:center}.gco-side>span{display:block;margin-bottom:7px;color:#9eb2c9;font-size:.72rem;font-weight:800;letter-spacing:.12em}
      .gco-object{min-height:250px;display:grid;place-items:center;overflow:hidden;border-radius:18px;background:radial-gradient(circle at 50% 35%,#26364a,#09111d 68%);border:1px solid rgba(255,255,255,.12)}
      .gco-product{position:relative;display:grid;place-items:center;background:#f4ebdd;filter:drop-shadow(0 12px 16px rgba(0,0,0,.35));overflow:hidden}
      .gco-product.shirt{width:76%;height:190px;clip-path:polygon(24% 0,38% 8%,62% 8%,76% 0,100% 18%,85% 39%,77% 32%,77% 100%,23% 100%,23% 32%,15% 39%,0 18%)}
      .gco-product.hoodie{width:76%;height:205px;clip-path:polygon(30% 10%,40% 0,60% 0,70% 10%,88% 18%,100% 48%,86% 58%,78% 38%,78% 100%,22% 100%,22% 38%,14% 58%,0 48%,12% 18%)}
      .gco-product.hat{width:72%;height:105px;border-radius:55% 55% 18% 18% / 75% 75% 25% 25%;margin-top:25px;overflow:visible}.gco-product.hat:after{content:"";position:absolute;right:-24%;bottom:-8px;width:46%;height:22px;background:#f4ebdd;border-radius:0 100% 40% 0;transform:skewX(-18deg);z-index:-1}
      .gco-product.mug{width:58%;height:160px;border-radius:8px 8px 28px 28px;overflow:visible}.gco-product.mug:after{content:"";position:absolute;right:-46px;top:34px;width:62px;height:78px;border:18px solid #f4ebdd;border-left:0;border-radius:0 55px 55px 0;z-index:-1}
      .gco-product.tote{width:64%;height:180px;border-radius:5px;overflow:visible}.gco-product.tote:before{content:"";position:absolute;left:25%;top:-50px;width:50%;height:62px;border:14px solid #f4ebdd;border-bottom:0;border-radius:48px 48px 0 0;z-index:-1}
      .gco-product.poster{width:60%;height:210px;border-radius:3px}
      .gco-art{position:relative;z-index:2;width:58%;text-align:center;color:#07111f;font:900 clamp(12px,1.8vw,22px)/.95 Inter,Arial,sans-serif;overflow-wrap:anywhere}
      .gco-product.hat .gco-art{width:66%;font-size:clamp(9px,1.2vw,14px)}
      .gco-product.mug .gco-art{width:72%;font-size:clamp(10px,1.4vw,17px)}
      .gco-art.vinyl{text-shadow:0 1px 0 rgba(255,255,255,.4)}
      .gco-art.screen-print{letter-spacing:.01em}
      .gco-art.embroidery{font-size:clamp(10px,1.45vw,17px);letter-spacing:.05em;text-shadow:.5px .5px 0 #0174F3}
      .gco-art.patch{padding:9px;border:3px solid #0174F3;border-radius:10px;background:#f4ebdd}
      .gco-art.dtg{font-weight:850}
      .gco-art.sublimation{background:linear-gradient(90deg,#0174F3,#07111f);-webkit-background-clip:text;background-clip:text;color:transparent}
      @media(max-width:650px){.gco-object{min-height:230px}}
    </style>
    <div class="gco-head"><h3>${esc(options.heading||"MAKE THIS DESIGN INTO CODE")}</h3><p>Choose how it is built, then how it is physically applied. The rendered design appears inside the actual product surface.</p></div>
    <div class="gco-sub">Code method</div><div class="gco-grid"></div>
    <div class="gco-sub">Application</div><div class="gco-methods"></div>
    <div class="gco-stage" aria-live="polite"><div class="gco-stage-head"><strong class="gco-render-label">Rendered product</strong></div><div class="gco-products"></div></div>`;
    host.appendChild(wrap);

    const grid=wrap.querySelector('.gco-grid');
    const methods=wrap.querySelector('.gco-methods');
    const stage=wrap.querySelector('.gco-stage');
    const products=wrap.querySelector('.gco-products');
    const label=wrap.querySelector('.gco-render-label');
    let selected=options.defaultFormat||"html-single";
    let application="Vinyl";

    function render(){
      const rendered=generate(selected,context,application);
      const pc=productClass(rendered.product),surfaces=surfacesFor(rendered.product);
      products.innerHTML=surfaces.map(surface=>`<div class="gco-side"><span>${surface}</span><div class="gco-object"><div class="gco-product ${pc} ${surface.toLowerCase()}"><div class="gco-art ${application.toLowerCase().replace(/\s+/g,'-')}">${esc(surfaceText(surface,rendered))}</div></div></div></div>`).join('');
      label.textContent=`${rendered.product} · ${application}`;
      stage.classList.add('open');
    }

    FORMATS.forEach(([id,name,ext])=>{
      const b=document.createElement('button');b.type='button';b.className='gco-btn';b.textContent=name;b.title=ext;b.setAttribute('aria-pressed',String(id===selected));
      b.addEventListener('click',()=>{selected=id;grid.querySelectorAll('.gco-btn').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()});
      grid.appendChild(b);
    });

    METHODS.forEach(name=>{
      const b=document.createElement('button');b.type='button';b.className='gco-method';b.textContent=name;b.setAttribute('aria-pressed',String(name===application));
      b.addEventListener('click',()=>{application=name;methods.querySelectorAll('.gco-method').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()});
      methods.appendChild(b);
    });
  }

  window.InkspirationsGadgetCode={FORMATS,METHODS,generate,mount};
})();