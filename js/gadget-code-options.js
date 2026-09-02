(() => {
  "use strict";

  const VERSION = "2026-09-02-1030";
  const FORMATS = [
    ["html-single","Single-file HTML",".html"],
    ["html-css-js","HTML + CSS + JS",".html/.css/.js"],
    ["html","HTML",".html"],
    ["css","CSS",".css"],
    ["javascript","JavaScript",".js"],
    ["typescript","TypeScript",".ts"],
    ["react-jsx","React / JSX",".jsx"],
    ["react-tsx","React / TSX",".tsx"],
    ["vue","Vue",".vue"],
    ["svelte","Svelte",".svelte"],
    ["web-component","Web Component",".js"],
    ["svg","SVG",".svg"],
    ["canvas","Canvas 2D",".html"],
    ["tailwind","Tailwind",".html"],
    ["p5","p5.js",".js"],
    ["three","Three.js",".js"],
    ["json-spec","JSON Design Spec",".json"],
    ["mdx","MDX",".mdx"]
  ];

  const METHODS = ["Vinyl","Screen Print","Embroidery","Patch","DTG","Sublimation","Custom Wrap"];
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]);

  function data(context){
    const r = typeof context === "function" ? context() : context || {};
    return {
      title:String(r.title || r.phrase || "Untitled design"),
      phrase:String(r.phrase || r.reading || r.title || "Untitled design"),
      back:String(r.back || r.secondary || r.explanation || r.route || ""),
      explanation:String(r.explanation || r.route || ""),
      visual:String(r.visual || r.direction || "Inkspirations Studios treatment"),
      product:String(r.product || "T-Shirt"),
      price:r.price == null ? "" : String(r.price),
      direction:String(r.directionMode || "Robert gives the direction"),
      source:String(r.source || document.title)
    };
  }

  function generate(format,context,method){ return {format,method,...data(context)}; }

  function productClass(name){
    const p=String(name||"").toLowerCase();
    if(p.includes("hood")||p.includes("sweat")) return "hoodie";
    if(p.includes("hat")||p.includes("cap")) return "hat";
    if(p.includes("mug")) return "mug";
    if(p.includes("tote")) return "tote";
    if(p.includes("poster")||p.includes("print")) return "poster";
    return "shirt";
  }

  function surfacesFor(product){
    const pc=productClass(product);
    if(pc==="hat") return ["FRONT","LEFT SIDE","RIGHT SIDE","BACK","TOP","3/4 VIEW"];
    if(pc==="mug") return ["FRONT","LEFT SIDE","RIGHT SIDE","BACK","WRAP","HANDLE VIEW"];
    if(pc==="poster") return ["FRONT","DETAIL","FRAMED VIEW"];
    if(pc==="tote") return ["FRONT","BACK","LEFT SIDE","RIGHT SIDE","3/4 VIEW"];
    return ["FRONT","BACK","LEFT SIDE","RIGHT SIDE","3/4 FRONT","3/4 BACK"];
  }

  function surfaceText(surface,d){
    if(surface==="FRONT"||surface==="3/4 FRONT"||surface==="FRAMED VIEW") return d.phrase;
    if(surface==="BACK"||surface==="3/4 BACK") return d.back || d.phrase;
    if(surface==="LEFT SIDE"||surface==="RIGHT SIDE") return d.phrase.split(/\s+/).slice(0,2).join(" ") || d.phrase;
    if(surface==="TOP") return d.phrase.split(/\s+/)[0] || d.phrase;
    if(surface==="WRAP") return `${d.phrase} • ${d.back || d.phrase}`;
    if(surface==="HANDLE VIEW") return d.back || d.phrase;
    return d.phrase;
  }

  function mount(target,context,options={}){
    const host = typeof target === "string" ? document.querySelector(target) : target;
    if(!host || host.dataset.gadgetCodeMounted === "true") return;
    if(typeof target === "string" && target === "#doubleTakerCode" && document.querySelector("#shirtCode")) return;
    host.dataset.gadgetCodeMounted = "true";

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
      .gco-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}.gco-side{text-align:center}.gco-side>span{display:block;margin-bottom:7px;color:#9eb2c9;font-size:.72rem;font-weight:800;letter-spacing:.12em}
      .gco-object{min-height:250px;display:grid;place-items:center;overflow:hidden;border-radius:18px;background:radial-gradient(circle at 50% 35%,#26364a,#09111d 68%);border:1px solid rgba(255,255,255,.12)}
      .gco-product{position:relative;display:grid;place-items:center;background:#f4ebdd;filter:drop-shadow(0 12px 16px rgba(0,0,0,.35));overflow:hidden;transition:.2s ease}
      .gco-product.shirt{width:76%;height:190px;clip-path:polygon(24% 0,38% 8%,62% 8%,76% 0,100% 18%,85% 39%,77% 32%,77% 100%,23% 100%,23% 32%,15% 39%,0 18%)}
      .gco-product.hoodie{width:76%;height:205px;clip-path:polygon(30% 10%,40% 0,60% 0,70% 10%,88% 18%,100% 48%,86% 58%,78% 38%,78% 100%,22% 100%,22% 38%,14% 58%,0 48%,12% 18%)}
      .gco-product.hat{width:72%;height:105px;border-radius:55% 55% 18% 18% / 75% 75% 25% 25%;margin-top:25px}
      .gco-product.mug{width:58%;height:160px;border-radius:8px 8px 28px 28px}
      .gco-product.tote{width:64%;height:180px;border-radius:5px}.gco-product.poster{width:60%;height:210px;border-radius:3px}
      .gco-art{position:relative;z-index:2;width:58%;text-align:center;color:#07111f;font:900 clamp(12px,1.8vw,22px)/.95 Inter,Arial,sans-serif;overflow-wrap:anywhere}
      .gco-product.hat .gco-art{font-size:clamp(9px,1.2vw,14px)}.gco-product.mug .gco-art{font-size:clamp(10px,1.4vw,17px)}
      .gco-art.embroidery{font-size:clamp(10px,1.45vw,17px);letter-spacing:.05em;text-shadow:.5px .5px 0 #0174F3}
      .gco-art.patch{padding:9px;border:3px solid #0174F3;border-radius:10px;background:#f4ebdd}.gco-art.sublimation{background:linear-gradient(90deg,#0174F3,#07111f);-webkit-background-clip:text;background-clip:text;color:transparent}
      .gco-art.custom-wrap{width:92%;font-size:clamp(10px,1.55vw,19px);letter-spacing:.035em;background:linear-gradient(90deg,#0174F3 0 48%,#07111f 48% 52%,#0174F3 52% 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
      .gco-product.left-side{transform:perspective(500px) rotateY(58deg)}.gco-product.right-side{transform:perspective(500px) rotateY(-58deg)}.gco-product._3-4-front{transform:perspective(500px) rotateY(-28deg)}.gco-product._3-4-back{transform:perspective(500px) rotateY(28deg)}.gco-product._3-4-view{transform:perspective(500px) rotateY(-28deg)}.gco-product.top{transform:perspective(500px) rotateX(62deg)}
      @media(max-width:650px){.gco-object{min-height:230px}}
    </style>
    <div class="gco-head"><h3>${esc(options.heading||"MAKE THIS DESIGN INTO CODE")}</h3><p>Choose how it is built and applied. The customer sees the finished product, not the source code.</p></div>
    <div class="gco-sub">Code method</div><div class="gco-grid"></div>
    <div class="gco-sub">Application</div><div class="gco-methods"></div>
    <div class="gco-stage" aria-live="polite"><div class="gco-stage-head"><strong class="gco-render-label">ALL VIEWS</strong></div><div class="gco-products"></div></div>`;
    host.appendChild(wrap);

    const grid=wrap.querySelector('.gco-grid'),methods=wrap.querySelector('.gco-methods'),stage=wrap.querySelector('.gco-stage'),products=wrap.querySelector('.gco-products'),label=wrap.querySelector('.gco-render-label');
    let selected=options.defaultFormat||"html-single", application="Vinyl";
    const viewClass=s=>s.toLowerCase().replace(/\//g,'-').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').replace(/^3-4/,'_3-4');

    function render(){
      const rendered=generate(selected,context,application),pc=productClass(rendered.product),surfaces=surfacesFor(rendered.product);
      products.innerHTML=surfaces.map(surface=>`<div class="gco-side"><span>${surface}</span><div class="gco-object"><div class="gco-product ${pc} ${viewClass(surface)}"><div class="gco-art ${application.toLowerCase().replace(/\s+/g,'-')}">${esc(surfaceText(surface,rendered))}</div></div></div></div>`).join('');
      label.textContent=`ALL VIEWS · ${rendered.product} · ${application}`;
      stage.classList.add('open');
    }

    FORMATS.forEach(([id,name,ext])=>{
      const b=document.createElement('button');b.type='button';b.className='gco-btn';b.textContent=name;b.title=ext;b.setAttribute('aria-pressed',String(id===selected));
      b.addEventListener('click',()=>{selected=id;grid.querySelectorAll('.gco-btn').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()});grid.appendChild(b);
    });

    METHODS.forEach(name=>{
      const b=document.createElement('button');b.type='button';b.className='gco-method';b.textContent=name;b.setAttribute('aria-pressed',String(name===application));
      b.addEventListener('click',()=>{application=name;methods.querySelectorAll('.gco-method').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()});methods.appendChild(b);
    });

    const productSelect=document.querySelector('#shirtProduct');
    if(productSelect){ productSelect.addEventListener('change',()=>{ if(stage.classList.contains('open')) render(); }); }
    wrap._gcoRender=render;
  }

  window.InkspirationsGadgetCode={VERSION,FORMATS,METHODS,generate,mount};
})();