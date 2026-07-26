(() => {
  "use strict";

  const departmentDetails = {
    "AI Systems": {
      title: "AI Systems Director",
      callSign: "TIDE",
      purpose: "Coordinates the studio's AI ecosystem without allowing tools, prompts, or automation to become hidden policy.",
      protects: ["Founder authority", "Prompt governance", "Role boundaries", "Human review", "Future AI onboarding"],
      worksWith: "Software architecture, curatorial direction, brand, legal review, and the archive.",
      principle: "AI assists. Robert decides."
    },
    "Software Architecture": {
      title: "Chief Software Architect",
      callSign: "COMPASS",
      purpose: "Keeps the website and backstage systems stable, accessible, maintainable, secure, portable, and reversible.",
      protects: ["Visitor experience", "Accessibility", "Performance", "Security", "Rollback paths"],
      worksWith: "Every department whose decisions eventually become software, pages, integrations, or workflows.",
      principle: "Improve before rebuilding."
    },
    "Museum & Curatorial": {
      title: "Museum Director & Creative Curator",
      callSign: "REEF",
      purpose: "Protects the visitor's encounter with the work, from collection rhythm and page sequence to atmosphere and interpretation.",
      protects: ["Artwork centrality", "Emotional pacing", "Collection meaning", "Image presentation", "Visitor dignity"],
      worksWith: "Brand, software architecture, legal review, archive records, and Robert's final creative direction.",
      principle: "The artwork is never secondary to the system displaying it."
    },
    "Brand & Identity": {
      title: "Brand & Identity Director",
      callSign: "HORIZON",
      purpose: "Keeps every public touchpoint unmistakably connected to Inkspirations Studios without becoming generic or trend-led.",
      protects: ["Naming", "Typography", "Color language", "Public voice", "Recognition and coherence"],
      worksWith: "Curatorial direction, website implementation, legal safeguards, marketing, and the brand archive.",
      principle: "The frame should deepen the work, not compete with it."
    },
    "Legal & IP": {
      title: "Chief Legal & Intellectual Property Counsel",
      callSign: "LIGHTHOUSE",
      purpose: "Protects Robert's rights, the studio's obligations, and public trust around contracts, licensing, copyright, privacy, and policy.",
      protects: ["Copyright", "Licensing boundaries", "Contracts", "Privacy", "Supportable public claims"],
      worksWith: "Founder review, brand language, commerce, collaborators, curatorial context, and archival provenance.",
      principle: "Rights remain with the work unless Robert deliberately grants them."
    },
    "Archive & Knowledge": {
      title: "Chief Archivist & Knowledge Librarian",
      callSign: "SHELL",
      purpose: "Turns decisions, source files, prompts, versions, and historical context into durable institutional memory.",
      protects: ["Authoritative versions", "Decision history", "Provenance", "Prompt records", "Future continuity"],
      worksWith: "Every department, because every meaningful change eventually becomes part of the studio's memory.",
      principle: "Archive before forgetting."
    }
  };

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .gus-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
      .gus-reveal.gus-visible{opacity:1;transform:none}
      .gus-department-card{cursor:pointer;position:relative;overflow:hidden;transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}
      .gus-department-card::after{content:"Open department";position:absolute;right:1.15rem;bottom:1rem;color:var(--cyan);font-size:.7rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;opacity:.78}
      .gus-department-card:hover,.gus-department-card:focus-visible{transform:translateY(-5px);border-color:rgba(86,217,255,.58);box-shadow:0 22px 60px rgba(0,0,0,.35),0 0 32px rgba(86,217,255,.1);outline:none}
      .gus-flow-active{border-color:rgba(86,217,255,.75)!important;background:linear-gradient(145deg,rgba(1,116,243,.4),rgba(86,217,255,.13))!important;box-shadow:0 0 34px rgba(86,217,255,.18)}
      .gus-dialog{width:min(760px,calc(100vw - 2rem));border:1px solid rgba(126,205,255,.35);border-radius:26px;padding:0;background:#06182d;color:#f5fbff;box-shadow:0 40px 120px rgba(0,0,0,.7)}
      .gus-dialog::backdrop{background:rgba(0,4,10,.82);backdrop-filter:blur(8px)}
      .gus-dialog-inner{padding:clamp(1.5rem,5vw,3rem);position:relative;background:radial-gradient(circle at 85% 5%,rgba(86,217,255,.14),transparent 32%)}
      .gus-dialog-close{position:absolute;right:1rem;top:1rem;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:white;font-size:1.35rem;cursor:pointer}
      .gus-dialog .gus-call{color:var(--cyan);font-size:.75rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
      .gus-dialog h2{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.6rem);line-height:1.02;margin:.45rem 3rem 1rem 0}
      .gus-dialog .gus-purpose{font-size:1.12rem;color:#d7e8f6}
      .gus-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1.5rem}
      .gus-dialog-panel{border:1px solid rgba(126,205,255,.18);border-radius:18px;padding:1.1rem;background:rgba(255,255,255,.035)}
      .gus-dialog-panel h3{margin:0 0 .55rem;font-size:1rem;color:var(--cyan)}
      .gus-dialog-panel ul{margin:.2rem 0 0;padding-left:1.15rem;color:#b8cade}
      .gus-principle{margin-top:1rem;padding:1rem 1.2rem;border-left:3px solid var(--cyan);background:rgba(86,217,255,.06);font-family:Georgia,serif;font-size:1.18rem}
      .gus-progress{position:fixed;left:0;top:0;height:3px;background:linear-gradient(90deg,#0174f3,#56d9ff);z-index:50;width:0;box-shadow:0 0 14px #56d9ff;pointer-events:none}
      @media(max-width:650px){.gus-dialog-grid{grid-template-columns:1fr}.gus-department-card::after{position:static;display:block;margin-top:1rem}}
      @media(prefers-reduced-motion:reduce){.gus-reveal{opacity:1;transform:none;transition:none}.gus-department-card{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function createProgressBar() {
    const bar = document.createElement("div");
    bar.className = "gus-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  function addRevealMotion() {
    const items = document.querySelectorAll(".manifesto-panel,.section-head,.card,.principle,.node,.quote-band,.cta-panel");
    items.forEach((item) => item.classList.add("gus-reveal"));
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("gus-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("gus-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    items.forEach((item) => observer.observe(item));
  }

  function createDepartmentDialog() {
    const dialog = document.createElement("dialog");
    dialog.className = "gus-dialog";
    dialog.setAttribute("aria-labelledby", "gusDialogTitle");
    dialog.innerHTML = `<div class="gus-dialog-inner">
      <button class="gus-dialog-close" type="button" aria-label="Close department">×</button>
      <div class="gus-call" id="gusDialogCall"></div>
      <h2 id="gusDialogTitle"></h2>
      <p class="gus-purpose" id="gusDialogPurpose"></p>
      <div class="gus-dialog-grid">
        <section class="gus-dialog-panel"><h3>What this department protects</h3><ul id="gusDialogProtects"></ul></section>
        <section class="gus-dialog-panel"><h3>How it collaborates</h3><p id="gusDialogWorks"></p></section>
      </div>
      <div class="gus-principle" id="gusDialogPrinciple"></div>
    </div>`;
    document.body.appendChild(dialog);
    dialog.querySelector(".gus-dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    return dialog;
  }

  function activateDepartments(dialog) {
    const heading = [...document.querySelectorAll("h2")].find((item) => item.id === "departments-title");
    const section = heading?.closest("section");
    if (!section) return;
    section.querySelectorAll(".card").forEach((card) => {
      const key = card.querySelector("small")?.textContent.trim();
      const detail = departmentDetails[key];
      if (!detail) return;
      card.classList.add("gus-department-card");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Open ${detail.title}`);
      const open = () => {
        dialog.querySelector("#gusDialogCall").textContent = `${detail.callSign} / Studio Department`;
        dialog.querySelector("#gusDialogTitle").textContent = detail.title;
        dialog.querySelector("#gusDialogPurpose").textContent = detail.purpose;
        dialog.querySelector("#gusDialogProtects").innerHTML = detail.protects.map((item) => `<li>${item}</li>`).join("");
        dialog.querySelector("#gusDialogWorks").textContent = detail.worksWith;
        dialog.querySelector("#gusDialogPrinciple").textContent = detail.principle;
        dialog.showModal();
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });
  }

  function animateAuthorityFlow() {
    const nodes = [...document.querySelectorAll(".flow .node")];
    if (!nodes.length) return;
    let index = 0;
    const advance = () => {
      nodes.forEach((node) => node.classList.remove("gus-flow-active"));
      nodes[index].classList.add("gus-flow-active");
      index = (index + 1) % nodes.length;
    };
    advance();
    const timer = setInterval(advance, 1400);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) nodes.forEach((node) => node.classList.remove("gus-flow-active"));
      else advance();
    });
    addEventListener("pagehide", () => clearInterval(timer), { once: true });
  }

  function init() {
    addStyles();
    createProgressBar();
    addRevealMotion();
    const dialog = createDepartmentDialog();
    activateDepartments(dialog);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) animateAuthorityFlow();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();