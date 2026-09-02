(() => {
  "use strict";

  const FORMATS = [
    ["html-single", "Single-file HTML", ".html", "Portable HTML with CSS and JS embedded"],
    ["html-css-js", "HTML + CSS + JS", ".html/.css/.js", "Classic three-file web build"],
    ["html", "HTML", ".html", "Semantic markup only"],
    ["css", "CSS", ".css", "Reusable visual treatment"],
    ["javascript", "JavaScript", ".js", "Vanilla browser implementation"],
    ["typescript", "TypeScript", ".ts", "Typed browser implementation"],
    ["svg", "SVG", ".svg", "Scalable vector artwork / print-friendly output"],
    ["canvas", "Canvas 2D", ".html", "Procedural 2D browser rendering"],
    ["react-jsx", "React / JSX", ".jsx", "Reusable React component"],
    ["react-tsx", "React / TSX", ".tsx", "Typed reusable React component"],
    ["vue", "Vue", ".vue", "Vue single-file component"],
    ["svelte", "Svelte", ".svelte", "Svelte component"],
    ["web-component", "Web Component", ".js", "Framework-free custom element"],
    ["tailwind", "Tailwind", ".html", "Utility-class implementation"],
    ["p5", "p5.js", ".js", "Creative-coding sketch"],
    ["three", "Three.js", ".js", "3D/WebGL-ready starting point"],
    ["json-spec", "JSON Design Spec", ".json", "Portable machine-readable design recipe"],
    ["mdx", "MDX", ".mdx", "Design/content component for documentation or publishing"],
  ];

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]);
  }

  function js(value) {
    return JSON.stringify(String(value ?? ""));
  }

  function slug(value) {
    return String(value || "design").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "design";
  }

  function baseData(context) {
    const raw = typeof context === "function" ? context() : context || {};
    return {
      title: String(raw.title || raw.phrase || raw.reading || "Untitled design"),
      phrase: String(raw.phrase || raw.reading || raw.title || "Untitled design"),
      explanation: String(raw.explanation || raw.route || ""),
      visual: String(raw.visual || raw.direction || "High-contrast Inkspirations Studios treatment"),
      product: String(raw.product || "digital concept"),
      price: raw.price == null ? "" : String(raw.price),
      direction: String(raw.directionMode || raw.direction || "Machine gives the direction"),
      source: String(raw.source || document.title || "Inkspirations Studios Creative Lab"),
    };
  }

  function htmlShell(d) {
    return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${esc(d.title)}</title>\n<style>\n:root{--ink:#030812;--panel:#081526;--blue:#0174F3;--paper:#f7fbff}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--ink);color:var(--paper);font-family:Inter,system-ui,sans-serif}.design{width:min(92vw,900px);padding:clamp(2rem,7vw,5rem);border:1px solid rgba(255,255,255,.16);background:linear-gradient(145deg,#081526,#030812);text-align:center}.phrase{font-size:clamp(2.5rem,9vw,7rem);line-height:.9;letter-spacing:-.055em}.meta{margin-top:1rem;color:#9fc8ff}\n</style>\n</head>\n<body>\n<main class="design" data-product="${esc(d.product)}">\n<div class="phrase">${esc(d.phrase)}</div>\n<div class="meta">${esc(d.visual)}${d.price ? ` · ${esc(d.price)}` : ""}</div>\n</main>\n</body>\n</html>`;
  }

  function generate(format, context) {
    const d = baseData(context);
    const className = slug(d.phrase).replace(/-/g, "_");
    switch (format) {
      case "html-single": return htmlShell(d);
      case "html-css-js": return `<!-- index.html -->\n<main class="design"><h1>${esc(d.phrase)}</h1><p>${esc(d.visual)}</p></main>\n<link rel="stylesheet" href="design.css"><script src="design.js"><\/script>\n\n/* design.css */\n.design{background:#030812;color:#f7fbff;border:1px solid #0174F3;padding:3rem;text-align:center}.design h1{font-size:clamp(2.5rem,8vw,6rem)}\n\n// design.js\ndocument.querySelector('.design')?.setAttribute('data-source', ${js(d.source)});`;
      case "html": return `<main class="design" data-product="${esc(d.product)}">\n  <h1>${esc(d.phrase)}</h1>\n  <p>${esc(d.explanation)}</p>\n  <p>${esc(d.visual)}</p>\n</main>`;
      case "css": return `.design-${className}{background:#030812;color:#f7fbff;border:1px solid #0174F3;padding:clamp(2rem,6vw,5rem);text-align:center}.design-${className} .phrase{font-size:clamp(2.5rem,9vw,7rem);line-height:.9;letter-spacing:-.05em}`;
      case "javascript": return `const design=${JSON.stringify(d, null, 2)};\nconst el=document.createElement('section');\nel.className='inkspirations-design';\nel.textContent=design.phrase;\ndocument.body.appendChild(el);`;
      case "typescript": return `type Design={phrase:string;visual:string;product:string;price:string;direction:string;source:string};\nconst design:Design=${JSON.stringify(d, null, 2)};\nexport default design;`;
      case "svg": return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" role="img" aria-label="${esc(d.phrase)}"><rect width="1200" height="1200" fill="#030812"/><text x="600" y="600" fill="#f7fbff" font-family="Arial,sans-serif" font-size="92" font-weight="800" text-anchor="middle">${esc(d.phrase)}</text><text x="600" y="690" fill="#0174F3" font-size="30" text-anchor="middle">${esc(d.product)}${d.price ? ` · ${esc(d.price)}` : ""}</text></svg>`;
      case "canvas": return `<!doctype html><canvas id="art" width="1200" height="1200"></canvas><script>const c=document.querySelector('#art'),x=c.getContext('2d');x.fillStyle='#030812';x.fillRect(0,0,c.width,c.height);x.fillStyle='#f7fbff';x.font='800 88px Arial';x.textAlign='center';x.fillText(${js(d.phrase)},600,600);x.fillStyle='#0174F3';x.font='30px Arial';x.fillText(${js(d.product + (d.price ? ' · '+d.price : ''))},600,680);<\/script>`;
      case "react-jsx": return `export default function Design(){return <section style={{background:'#030812',color:'#f7fbff',padding:'4rem',textAlign:'center',border:'1px solid #0174F3'}}><h1>${esc(d.phrase)}</h1><p>${esc(d.visual)}</p></section>}`;
      case "react-tsx": return `type Props={product?:string;price?:string};\nexport default function Design({product=${js(d.product)},price=${js(d.price)}}:Props){return <section data-product={product} style={{background:'#030812',color:'#f7fbff',padding:'4rem',textAlign:'center',border:'1px solid #0174F3'}}><h1>${esc(d.phrase)}</h1><p>${esc(d.visual)}</p>{price&&<strong>{price}</strong>}</section>}`;
      case "vue": return `<template><section class="design"><h1>${esc(d.phrase)}</h1><p>${esc(d.visual)}</p></section></template>\n<style scoped>.design{background:#030812;color:#f7fbff;padding:4rem;text-align:center;border:1px solid #0174F3}</style>`;
      case "svelte": return `<script>let product=${js(d.product)};let price=${js(d.price)};<\/script>\n<section class="design"><h1>${esc(d.phrase)}</h1><p>${esc(d.visual)}</p>{#if price}<strong>{price}</strong>{/if}</section>\n<style>.design{background:#030812;color:#f7fbff;padding:4rem;text-align:center;border:1px solid #0174F3}</style>`;
      case "web-component": return `class InkDesign extends HTMLElement{connectedCallback(){this.innerHTML=\`<section style="background:#030812;color:#f7fbff;padding:4rem;text-align:center;border:1px solid #0174F3"><h1>${esc(d.phrase)}</h1><p>${esc(d.visual)}</p></section>\`;}}customElements.define('ink-design',InkDesign);`;
      case "tailwind": return `<section class="bg-slate-950 text-white border border-blue-500 p-12 text-center"><h1 class="text-6xl font-black tracking-tight">${esc(d.phrase)}</h1><p class="mt-4 text-blue-300">${esc(d.visual)}</p></section>`;
      case "p5": return `function setup(){createCanvas(1200,1200);textAlign(CENTER,CENTER);textFont('Arial');}function draw(){background('#030812');fill('#f7fbff');textSize(88);textStyle(BOLD);text(${js(d.phrase)},width/2,height/2);fill('#0174F3');textSize(30);text(${js(d.product + (d.price ? ' · '+d.price : ''))},width/2,height/2+90);noLoop();}`;
      case "three": return `import * as THREE from 'three';\nconst scene=new THREE.Scene();scene.background=new THREE.Color('#030812');\n// Phrase: ${d.phrase.replace(/\n/g, " ")}\n// Visual direction: ${d.visual.replace(/\n/g, " ")}\n// Product: ${d.product}${d.price ? ` · ${d.price}` : ""}\nexport {scene};`;
      case "json-spec": return JSON.stringify({studio:"Inkspirations Studios",...d}, null, 2);
      case "mdx": return `---\ntitle: ${JSON.stringify(d.title)}\nproduct: ${JSON.stringify(d.product)}\nprice: ${JSON.stringify(d.price)}\nsource: ${JSON.stringify(d.source)}\n---\n\n# ${d.phrase}\n\n${d.explanation}\n\n**Visual direction:** ${d.visual}\n\n**Direction mode:** ${d.direction}`;
      default: return htmlShell(d);
    }
  }

  function mount(target, context, options = {}) {
    const host = typeof target === "string" ? document.querySelector(target) : target;
    if (!host || host.dataset.gadgetCodeMounted === "true") return;
    host.dataset.gadgetCodeMounted = "true";

    const wrap = document.createElement("section");
    wrap.className = "gadget-code-options";
    wrap.innerHTML = `<style>
      .gadget-code-options{margin-top:18px;padding:18px;border:1px solid rgba(1,116,243,.45);border-radius:18px;background:#050d19;color:#f7fbff;text-align:left}.gco-head{display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap}.gco-head h3{margin:0;font:800 1.05rem/1.1 Inter,system-ui,sans-serif}.gco-head p{margin:4px 0 0;color:#9eb2c9;font-size:.85rem}.gco-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.gco-btn,.gco-copy{border:1px solid rgba(255,255,255,.16);background:#0a1728;color:#dce8f6;border-radius:999px;padding:8px 11px;font:700 .78rem/1 Inter,system-ui,sans-serif;cursor:pointer}.gco-btn[aria-pressed="true"]{border-color:#0174F3;background:rgba(1,116,243,.22);color:white}.gco-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.gco-generate{border:0;background:#0174F3;color:white;border-radius:999px;padding:10px 14px;font-weight:850;cursor:pointer}.gco-output{display:none;margin:12px 0 0;max-height:360px;overflow:auto;background:#02060c;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:14px;color:#dce8f6;white-space:pre;font:12px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}.gco-output.open{display:block}
    </style><div class="gco-head"><div><h3>${esc(options.heading || "MAKE THIS DESIGN INTO CODE")}</h3><p>Choose the implementation you want. The current machine result travels with it.</p></div><span style="color:#5ed6c4;font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Shared across gadget machines</span></div><div class="gco-grid"></div><div class="gco-actions"><button class="gco-generate" type="button">Generate selected code</button><button class="gco-copy" type="button" hidden>Copy code</button></div><pre class="gco-output"><code></code></pre>`;
    host.appendChild(wrap);

    const grid = wrap.querySelector('.gco-grid');
    const output = wrap.querySelector('.gco-output');
    const code = output.querySelector('code');
    const copy = wrap.querySelector('.gco-copy');
    let selected = options.defaultFormat || "html-single";

    FORMATS.forEach(([id,label,ext,hint]) => {
      const b=document.createElement('button');
      b.type='button';b.className='gco-btn';b.dataset.format=id;b.textContent=label;b.title=`${hint} · ${ext}`;b.setAttribute('aria-pressed',String(id===selected));
      b.addEventListener('click',()=>{selected=id;grid.querySelectorAll('.gco-btn').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
      grid.appendChild(b);
    });

    wrap.querySelector('.gco-generate').addEventListener('click',()=>{
      code.textContent=generate(selected,context);output.classList.add('open');copy.hidden=false;
    });
    copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code.textContent||'');copy.textContent='Copied';setTimeout(()=>copy.textContent='Copy code',1400);}catch{copy.textContent='Select and copy below';}});
  }

  window.InkspirationsGadgetCode = { FORMATS, generate, mount };
})();
