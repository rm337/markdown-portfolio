(() => {
  "use strict";

  const departmentDetails = {
    "AI Systems": { title: "AI Systems Director", callSign: "TIDE", purpose: "Coordinates the studio's AI ecosystem without allowing tools, prompts, or automation to become hidden policy.", protects: ["Founder authority", "Prompt governance", "Role boundaries", "Human review", "Future AI onboarding"], worksWith: "Software architecture, curatorial direction, brand, legal review, and the archive.", principle: "AI assists. Robert decides." },
    "Software Architecture": { title: "Chief Software Architect", callSign: "COMPASS", purpose: "Keeps the website and backstage systems stable, accessible, maintainable, secure, portable, and reversible.", protects: ["Visitor experience", "Accessibility", "Performance", "Security", "Rollback paths"], worksWith: "Every department whose decisions eventually become software, pages, integrations, or workflows.", principle: "Improve before rebuilding." },
    "Museum & Curatorial": { title: "Museum Director & Creative Curator", callSign: "REEF", purpose: "Protects the visitor's encounter with the work, from collection rhythm and page sequence to atmosphere and interpretation.", protects: ["Artwork centrality", "Emotional pacing", "Collection meaning", "Image presentation", "Visitor dignity"], worksWith: "Brand, software architecture, legal review, archive records, and Robert's final creative direction.", principle: "The artwork is never secondary to the system displaying it." },
    "Brand & Identity": { title: "Brand & Identity Director", callSign: "HORIZON", purpose: "Keeps every public touchpoint unmistakably connected to Inkspirations Studios without becoming generic or trend-led.", protects: ["Naming", "Typography", "Color language", "Public voice", "Recognition and coherence"], worksWith: "Curatorial direction, website implementation, legal safeguards, marketing, and the brand archive.", principle: "The frame should deepen the work, not compete with it." },
    "Legal & IP": { title: "Chief Legal & Intellectual Property Counsel", callSign: "LIGHTHOUSE", purpose: "Protects Robert's rights, the studio's obligations, and public trust around contracts, licensing, copyright, privacy, and policy.", protects: ["Copyright", "Licensing boundaries", "Contracts", "Privacy", "Supportable public claims"], worksWith: "Founder review, brand language, commerce, collaborators, curatorial context, and archival provenance.", principle: "Rights remain with the work unless Robert deliberately grants them." },
    "Archive & Knowledge": { title: "Chief Archivist & Knowledge Librarian", callSign: "SHELL", purpose: "Turns decisions, source files, prompts, versions, and historical context into durable institutional memory.", protects: ["Authoritative versions", "Decision history", "Provenance", "Prompt records", "Future continuity"], worksWith: "Every department, because every meaningful change eventually becomes part of the studio's memory.", principle: "Archive before forgetting." }
  };

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .gus-reveal{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s ease}.gus-reveal.gus-visible{opacity:1;transform:none}
      .gus-progress{position:fixed;left:0;top:0;height:3px;background:linear-gradient(90deg,#0174f3,#56d9ff);z-index:50;width:0;box-shadow:0 0 14px #56d9ff;pointer-events:none}
      .gus-jumpbar{max-width:1180px;margin:0 auto 1rem;padding:0 clamp(1.2rem,5vw,4rem);display:flex;gap:.6rem;overflow-x:auto;scrollbar-width:thin;position:sticky;top:72px;z-index:8}
      .gus-jumpbar button{flex:0 0 auto;border:1px solid rgba(126,205,255,.28);background:rgba(2,9,20,.88);color:#dff8ff;border-radius:999px;padding:.65rem .9rem;font-weight:800;backdrop-filter:blur(12px);cursor:pointer}
      .gus-jumpbar button:hover,.gus-jumpbar button:focus-visible{border-color:#56d9ff;outline:none;background:rgba(1,116,243,.28)}
      .gus-collapsible{padding-top:1.15rem!important;padding-bottom:1.15rem!important;border-top:1px solid rgba(126,205,255,.12)}
      .gus-collapsible .section-head{margin:0;max-width:none}
      .gus-collapsible .section-head>p:last-child{display:none}
      .gus-section-toggle{width:100%;display:grid;grid-template-columns:1fr auto;gap:1rem;align-items:center;text-align:left;border:0;background:transparent;color:inherit;padding:.4rem 0;cursor:pointer}
      .gus-section-toggle h2{margin:.15rem 0!important;font-size:clamp(1.65rem,4vw,2.8rem)!important}
      .gus-toggle-icon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(86,217,255,.38);background:rgba(86,217,255,.07);font-size:1.35rem;transition:transform .2s ease}
      .gus-collapsible.gus-open .gus-toggle-icon{transform:rotate(45deg)}
      .gus-section-body{display:none;padding-top:1.35rem}.gus-collapsible.gus-open .gus-section-body{display:block}
      .gus-collapsible.gus-open .section-head>p:last-child{display:block;margin-top:.6rem}
      .gus-department-card{cursor:pointer;position:relative;overflow:hidden;transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}.gus-department-card::after{content:"Open department";position:absolute;right:1.15rem;bottom:1rem;color:var(--cyan);font-size:.7rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;opacity:.78}.gus-department-card:hover,.gus-department-card:focus-visible{transform:translateY(-5px);border-color:rgba(86,217,255,.58);box-shadow:0 22px 60px rgba(0,0,0,.35);outline:none}
      .gus-flow-active{border-color:rgba(86,217,255,.75)!important;background:linear-gradient(145deg,rgba(1,116,243,.4),rgba(86,217,255,.13))!important;box-shadow:0 0 34px rgba(86,217,255,.18)}
      .gus-dialog{width:min(760px,calc(100vw - 2rem));border:1px solid rgba(126,205,255,.35);border-radius:26px;padding:0;background:#06182d;color:#f5fbff;box-shadow:0 40px 120px rgba(0,0,0,.7)}.gus-dialog::backdrop{background:rgba(0,4,10,.82);backdrop-filter:blur(8px)}.gus-dialog-inner{padding:clamp(1.5rem,5vw,3rem);position:relative}.gus-dialog-close{position:absolute;right:1rem;top:1rem;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:white;font-size:1.35rem;cursor:pointer}.gus-dialog .gus-call{color:var(--cyan);font-size:.75rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.gus-dialog h2{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.6rem);line-height:1.02;margin:.45rem 3rem 1rem 0}.gus-dialog .gus-purpose{font-size:1.12rem;color:#d7e8f6}.gus-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1.5rem}.gus-dialog-panel{border:1px solid rgba(126,205,255,.18);border-radius:18px;padding:1.1rem;background:rgba(255,255,255,.035)}.gus-dialog-panel h3{margin:0 0 .55rem;font-size:1rem;color:var(--cyan)}.gus-dialog-panel ul{margin:.2rem 0 0;padding-left:1.15rem;color:#b8cade}.gus-principle{margin-top:1rem;padding:1rem 1.2rem;border-left:3px solid var(--cyan);background:rgba(86,217,255,.06);font-family:Georgia,serif;font-size:1.18rem}
      @media(max-width:650px){.gus-jumpbar{top:108px}.gus-dialog-grid{grid-template-columns:1fr}.gus-department-card::after{position:static;display:block;margin-top:1rem}}
      @media(prefers-reduced-motion:reduce){.gus-reveal{opacity:1;transform:none;transition:none}.gus-toggle-icon{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function createProgressBar() {
    const bar = document.createElement("div"); bar.className = "gus-progress"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
    const update = () => { const max = document.documentElement.scrollHeight - innerHeight; bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`; };
    addEventListener("scroll", update, { passive: true }); addEventListener("resize", update); update();
  }

  function compactSections() {
    const sections = [...document.querySelectorAll("main > section.section")];
    if (!sections.length) return;
    const jumpbar = document.createElement("nav"); jumpbar.className = "gus-jumpbar"; jumpbar.setAttribute("aria-label", "Grand Unified Studio sections");
    sections.forEach((section, index) => {
      const head = section.querySelector(":scope > .section-head");
      const title = head?.querySelector("h2");
      if (!head || !title) return;
      const body = document.createElement("div"); body.className = "gus-section-body";
      [...section.children].filter((child) => child !== head).forEach((child) => body.appendChild(child)); section.appendChild(body);
      section.classList.add("gus-collapsible");
      const button = document.createElement("button"); button.className = "gus-section-toggle"; button.type = "button"; button.setAttribute("aria-expanded", "false"); button.innerHTML = `<span>${title.outerHTML}</span><span class="gus-toggle-icon" aria-hidden="true">+</span>`;
      title.remove(); head.insertBefore(button, head.querySelector("p:last-child"));
      const openSection = (open = !section.classList.contains("gus-open")) => { section.classList.toggle("gus-open", open); button.setAttribute("aria-expanded", String(open)); };
      button.addEventListener("click", () => openSection());
      const jump = document.createElement("button"); jump.type = "button"; jump.textContent = button.querySelector("h2").textContent.replace(/\.$/, ""); jump.addEventListener("click", () => { openSection(true); section.scrollIntoView({ behavior: "smooth", block: "start" }); }); jumpbar.appendChild(jump);
      if (index === sections.length - 2 || title.id === "agents-title") openSection(true);
    });
    const manifesto = document.querySelector(".manifesto"); manifesto?.after(jumpbar);
  }

  function addRevealMotion() {
    const items = document.querySelectorAll(".manifesto-panel,.section-head,.card,.principle,.node,.quote-band,.cta-panel"); items.forEach((item) => item.classList.add("gus-reveal"));
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach((item) => item.classList.add("gus-visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("gus-visible"); observer.unobserve(entry.target); } }), { threshold: .1 }); items.forEach((item) => observer.observe(item));
  }

  function createDepartmentDialog() {
    const dialog = document.createElement("dialog"); dialog.className = "gus-dialog"; dialog.setAttribute("aria-labelledby", "gusDialogTitle");
    dialog.innerHTML = `<div class="gus-dialog-inner"><button class="gus-dialog-close" type="button" aria-label="Close department">×</button><div class="gus-call" id="gusDialogCall"></div><h2 id="gusDialogTitle"></h2><p class="gus-purpose" id="gusDialogPurpose"></p><div class="gus-dialog-grid"><section class="gus-dialog-panel"><h3>What this department protects</h3><ul id="gusDialogProtects"></ul></section><section class="gus-dialog-panel"><h3>How it collaborates</h3><p id="gusDialogWorks"></p></section></div><div class="gus-principle" id="gusDialogPrinciple"></div></div>`;
    document.body.appendChild(dialog); dialog.querySelector(".gus-dialog-close").addEventListener("click", () => dialog.close()); dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }); return dialog;
  }

  function activateDepartments(dialog) {
    const section = document.querySelector("#departments-title")?.closest("section"); if (!section) return;
    section.querySelectorAll(".card").forEach((card) => { const detail = departmentDetails[card.querySelector("small")?.textContent.trim()]; if (!detail) return; card.classList.add("gus-department-card"); card.tabIndex = 0; card.setAttribute("role", "button");
      const open = () => { dialog.querySelector("#gusDialogCall").textContent = `${detail.callSign} / Studio Department`; dialog.querySelector("#gusDialogTitle").textContent = detail.title; dialog.querySelector("#gusDialogPurpose").textContent = detail.purpose; dialog.querySelector("#gusDialogProtects").innerHTML = detail.protects.map((item) => `<li>${item}</li>`).join(""); dialog.querySelector("#gusDialogWorks").textContent = detail.worksWith; dialog.querySelector("#gusDialogPrinciple").textContent = detail.principle; dialog.showModal(); };
      card.addEventListener("click", open); card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
    });
  }

  function activateGehuTerminal() {
    const screen = document.querySelector("#gehuScreen"); if (!screen) return;
    const lines = {
      ring: ["SALES: The phone is still quiet.", "GEHU: Initiating highly advanced ringing procedure...", "GEHU: I called our own office. Technically, it rang."],
      lead: ["GEHU: Lead scan complete.", "GEHU: Best next move: contact a real prospect, record the follow-up, and stop admiring the spreadsheet."],
      shop: ["PERSONAL SHOPPER: Tell me the mood, room, occasion, and budget.", "GEHU: I have reduced 4,827 possibilities to three sensible choices."],
      report: ["GEHU: Office report ready.", "GEHU: Systems stable. Sales needs leads. Personal Shopper is prepared. Robert retains final authority."]
    };
    document.querySelectorAll("[data-gehu-action]").forEach((button) => button.addEventListener("click", () => { screen.innerHTML = lines[button.dataset.gehuAction].map((line) => `<p class="terminal-line ${line.startsWith("GEHU") ? "gehu" : "sales"}">${line}</p>`).join(""); }));
  }

  function animateAuthorityFlow() {
    const nodes = [...document.querySelectorAll(".flow .node")]; if (!nodes.length) return; let index = 0;
    const advance = () => { nodes.forEach((node) => node.classList.remove("gus-flow-active")); nodes[index].classList.add("gus-flow-active"); index = (index + 1) % nodes.length; };
    advance(); const timer = setInterval(advance, 1400); addEventListener("pagehide", () => clearInterval(timer), { once: true });
  }

  function init() {
    addStyles(); createProgressBar(); compactSections(); addRevealMotion(); const dialog = createDepartmentDialog(); activateDepartments(dialog); activateGehuTerminal(); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) animateAuthorityFlow();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();