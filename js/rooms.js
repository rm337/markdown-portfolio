(() => {
  "use strict";

  const rooms = [
    {
      id: "idea-fabricator",
      title: "Idea Fabricator",
      subtitle: "The thought engine behind the studio.",
      description: "Feed it a word, phrase, observation, problem, or accidental expression and follow the connections somewhere less obvious.",
      url: "https://robert-marleton.lovable.app/workshop",
      accent: "#0174f3",
      category: "Creative Machine",
      status: "Live Interactive"
    },
    {
      id: "t-shirt-design-lab",
      title: "T-Shirt Design Lab",
      subtitle: "Where wearable ideas get developed.",
      description: "Take shirt sparks, Robert's Puns, strange phrases, and Fabricator discoveries into a dedicated concept-development room.",
      url: "t-shirt-design-lab.html",
      accent: "#83f3ba",
      category: "Apparel Lab",
      status: "Interactive"
    },
    {
      id: "roberts-puns",
      title: "Robert's Puns",
      subtitle: "The phrase archive with a pulse.",
      description: "Original wordplay, invented language, story threads, humor, and phrases that can feed artwork, shirts, objects, and the Idea Fabricator.",
      url: "robertisms.html",
      accent: "#f5efe5",
      category: "Wordplay",
      status: "Interactive"
    },
    {
      id: "ocean-of-ink",
      title: "Ocean of Ink",
      subtitle: "The atmospheric center of the studio.",
      description: "A living blue environment of drifting pigment, layered light, and selected visual work. Move slowly, look closely, and follow the current.",
      url: "ocean-of-ink.html",
      accent: "#56d9ff",
      category: "Atmosphere",
      status: "Open"
    },
    {
      id: "water-room",
      title: "The Water Room",
      subtitle: "Water, reflection, current, and moving light.",
      description: "An immersive room built from flowing light, refracted color, drifting forms, and a quieter sense of motion around the visitor.",
      url: "water-room.html",
      accent: "#a7edf3",
      category: "Immersive Room",
      status: "Interactive"
    },
    {
      id: "grand-unified-studio",
      title: "The Grand Unified Studio",
      subtitle: "The living blueprint beneath every room.",
      description: "Explore the creative architecture that connects studio departments, experiments, and repeatable systems.",
      url: "grand-unified-studio.html",
      accent: "#69cfff",
      category: "Creative Systems",
      status: "Interactive"
    },
    {
      id: "systems-i-built",
      title: "How Robert Builds",
      subtitle: "Creative process made visible.",
      description: "An interactive systems room showing how ideas move from chaos to decisions, rooms, artifacts, and repeatable creative form.",
      url: "systems-i-built.html",
      accent: "#56d9ff",
      category: "Process",
      status: "Interactive"
    },
    {
      id: "merch-foundry",
      title: "Studio Artifact Foundry",
      subtitle: "Where studio ideas become physical possibilities.",
      description: "Coasters, prints, shirt concepts, Robert's Puns, Ocean of Ink artifacts, and other ideas connected back to their creative source.",
      url: "merch-foundry.html",
      accent: "#ffb45c",
      category: "Artifact Lab",
      status: "Interactive"
    },
    {
      id: "coasters-tiles",
      title: "Coasters & Decorative Tiles",
      subtitle: "Functional art with its own room.",
      description: "Usable art studies in wood, blue-current movement, texture, and handmade surfaces, with full-screen image viewing.",
      url: "coasters-tiles.html",
      accent: "#d8aa54",
      category: "Functional Art",
      status: "Open"
    },
    {
      id: "photography",
      title: "Photography",
      subtitle: "The photographic wall.",
      description: "Photographic studies, studio details, objects, surfaces, and visual moments presented separately from the artwork gallery.",
      url: "photography.html",
      accent: "#72c8dd",
      category: "Photography",
      status: "Open"
    },
    {
      id: "writing-room",
      title: "Writing Room",
      subtitle: "Words, expressions, and reflective studio writing.",
      description: "A dedicated room for original writing, poetry, and word-based creative work.",
      url: "rooms.html#writing-room",
      accent: "#ffe6ad",
      category: "Writing",
      status: "Open"
    },
    {
      id: "portfolio",
      title: "Artwork Gallery",
      subtitle: "The main visual collection.",
      description: "Browse selected artwork, open images full screen, and move through the portfolio without dead ends.",
      url: "portfolio.html#portfolio",
      accent: "#0174f3",
      category: "Gallery",
      status: "Open"
    }
  ];

  const foundryPuns = [
    { title: "Water you waiting for?", label: "Water Wordplay", description: "A question that got wet on the way out and immediately became machine food." },
    { title: "Tide up for a second", label: "Water Wordplay", description: "A small phonetic turn that keeps the meaning recognizable while letting the water take over." },
    { title: "Shore as hell ready", label: "Water Wordplay", description: "A coastal mutation with enough attitude to survive outside the aquarium." },
    { title: "My Code Turned Into $pagetti", label: "Tech Wordplay", description: "A debugging joke built from the familiar moment when clean logic becomes tangled code." },
    { title: "All My PUPS Are on a Leash", label: "Controlled Chaos", description: "A playful line about keeping processes, programs, or unpredictable little systems under control." },
    { title: "Browser Wars", label: "Digital Culture", description: "A technology satire about compatibility battles, competing platforms, endless tabs, and daily web diplomacy." },
    { title: "Cheese Burglar", label: "Absurdist Humor", description: "A compact character concept that treats a tiny ridiculous offense with the gravity of a full criminal case." },
    { title: "FLITLE Deck", label: "Studio Oddity", description: "An intentional near-miss preserved as part of the studio voice, where an almost-right phrase becomes memorable." },
    { title: "Very Polite Dictionary", label: "Gentle Wordplay", description: "A quiet linguistic joke built around the idea of definitions with manners." }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]);
  }

  function roomCard(room) {
    const external = /^https?:\/\//.test(room.url);
    return `<a class="room-card" href="${escapeHtml(room.url)}"${external ? ' target="_blank" rel="noopener"' : ""} style="--room-accent:${escapeHtml(room.accent)}">
      <small>${escapeHtml(room.category)}</small>
      <h2>${escapeHtml(room.title)}</h2>
      <p>${escapeHtml(room.description)}</p>
      <span class="room-card-footer"><span class="room-tag">${escapeHtml(room.status)}</span><span class="room-tag">Enter room</span></span>
    </a>`;
  }

  function renderRooms() {
    document.querySelectorAll("[data-room-cards]").forEach((container) => {
      container.innerHTML = rooms.map(roomCard).join("");
    });
  }

  function normalizePublicPunTerminology() {
    const root = document.querySelector("main") || document.body;
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (node.nodeValue && /Robertisms/i.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue
          .replace(/Robertisms/g, "Robert's Puns")
          .replace(/Robertism-style/g, "Robert's-Puns-style")
          .replace(/Robertism/g, "Robert's Pun");
      }
    });
  }

  function addFoundryPunGallery() {
    if (document.body?.dataset.roomId !== "merch-concept-foundry") return;
    if (document.getElementById("punsAndDescriptions")) return;
    const foundryGrid = document.querySelector(".foundry-grid");
    if (!foundryGrid) return;

    const style = document.createElement("style");
    style.textContent = `.pun-gallery{margin:1rem 0;border:1px solid var(--line);background:rgba(6,14,28,.72);box-shadow:var(--shadow);backdrop-filter:blur(16px)}.pun-gallery-head{padding:1rem;border-bottom:1px solid var(--line)}.pun-gallery-head h2{margin:0;font-size:1.75rem}.pun-gallery-head p:last-child{margin:.45rem 0 0;color:var(--soft);max-width:820px}.pun-gallery-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.85rem;padding:1rem}.pun-entry{border:1px solid var(--line);background:linear-gradient(145deg,rgba(1,116,243,.12),rgba(86,217,255,.035));padding:1rem;min-height:205px}.pun-entry small{display:block;color:var(--cyan);font-family:Arial,sans-serif;font-size:.62rem;font-weight:900;letter-spacing:.13em;text-transform:uppercase;margin-bottom:.65rem}.pun-entry h3{font-size:1.45rem;line-height:1.05;color:var(--paper);margin:0 0 .65rem}.pun-entry p{color:var(--soft);margin:0}@media(max-width:700px){.pun-gallery-grid{grid-template-columns:1fr}.pun-entry{min-height:auto}}`;
    document.head.appendChild(style);

    const section = document.createElement("section");
    section.className = "pun-gallery";
    section.id = "punsAndDescriptions";
    section.innerHTML = `<div class="pun-gallery-head"><p class="kicker">Robert's Puns</p><h2>The phrases that escaped before anyone could stop them.</h2><p>Original technical wordplay, surreal one-liners, waterlogged language, and studio oddities.</p></div><div class="pun-gallery-grid">${foundryPuns.map((pun) => `<article class="pun-entry"><small>${escapeHtml(pun.label)}</small><h3>${escapeHtml(pun.title)}</h3><p>${escapeHtml(pun.description)}</p></article>`).join("")}</div>`;
    foundryGrid.parentNode.insertBefore(section, foundryGrid);
  }

  function enhanceTshirtLab() {
    if (document.body?.dataset.roomId !== "t-shirt-design-lab") return;
    if (document.getElementById("fabricatorCahoots")) return;

    const FABRICATOR = "https://robert-marleton.lovable.app/fabricator";
    const params = new URLSearchParams(window.location.search);
    const incomingSeed = (params.get("seed") || "").trim();
    const incomingWhy = (params.get("why") || params.get("context") || "").trim();
    const incomingVisual = (params.get("visual") || "").trim();
    const incomingSource = (params.get("source") || "").trim();

    const style = document.createElement("style");
    style.textContent = `.cahoots-bridge{margin:0 0 1rem;border-color:rgba(86,217,255,.3);background:linear-gradient(135deg,rgba(1,116,243,.16),rgba(6,14,28,.78))}.cahoots-inner{padding:1rem;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:center}.cahoots-inner h2{margin:.2rem 0 .35rem;font-size:clamp(1.5rem,3vw,2.2rem)}.cahoots-inner p{margin:0;color:var(--soft);max-width:760px}.cahoots-actions{display:flex;gap:.55rem;flex-wrap:wrap;justify-content:flex-end}.cahoots-actions a,.cahoots-actions button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none}.incoming-seed{margin:0 0 1rem;padding:1rem;border:1px solid rgba(131,243,186,.35);background:rgba(131,243,186,.07)}.incoming-seed strong{display:block;color:var(--mint);font-size:1.25rem;margin:.25rem 0 .45rem}.incoming-seed p{margin:.35rem 0;color:var(--soft)}@media(max-width:820px){.cahoots-inner{grid-template-columns:1fr}.cahoots-actions{justify-content:flex-start}}`;
    document.head.appendChild(style);

    const header = document.querySelector(".lab-hero");
    if (!header) return;

    const bridge = document.createElement("section");
    bridge.id = "fabricatorCahoots";
    bridge.className = "panel cahoots-bridge";
    bridge.innerHTML = `<div class="cahoots-inner"><div><p class="kicker">Idea Fabricator × T-Shirt Design Lab</p><h2>Fabricate the thought here. Develop the wearable there.</h2><p>The Idea Fabricator can knock a phrase around, collide meanings, and find new directions. This lab takes the strongest wearable sparks and develops them into shirt concepts.</p></div><div class="cahoots-actions"><a class="btn primary" id="fabricateSelected" href="${FABRICATOR}">Fabricate Selected Idea</a><a class="btn" href="${FABRICATOR}" target="_blank" rel="noopener">Open Idea Fabricator</a><a class="btn" href="robertisms.html">Robert's Puns</a></div></div>`;
    header.insertAdjacentElement("afterend", bridge);

    function selectedSeed() {
      return (document.getElementById("frontIdea")?.textContent || document.getElementById("detailTitle")?.textContent || "").trim();
    }

    function fabricatorUrl(seed, extra = {}) {
      const url = new URL(FABRICATOR);
      if (seed) url.searchParams.set("seed", seed);
      url.searchParams.set("source", "tshirt-lab");
      Object.entries(extra).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, String(value));
      });
      return url.toString();
    }

    const fabricateSelected = document.getElementById("fabricateSelected");
    if (fabricateSelected) {
      fabricateSelected.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = fabricatorUrl(selectedSeed(), {
          context: document.getElementById("detailNotes")?.textContent || ""
        });
      });
    }

    const detailActions = document.querySelector(".detail .actions");
    if (detailActions) {
      const button = document.createElement("button");
      button.className = "btn";
      button.type = "button";
      button.textContent = "Fabricate This";
      button.addEventListener("click", () => {
        window.location.href = fabricatorUrl(selectedSeed(), {
          context: document.getElementById("detailNotes")?.textContent || ""
        });
      });
      detailActions.appendChild(button);
    }

    if (incomingSeed) {
      const incoming = document.createElement("section");
      incoming.className = "incoming-seed";
      incoming.innerHTML = `<p class="kicker">Incoming from ${escapeHtml(incomingSource === "idea-fabricator" ? "Idea Fabricator" : "the creative machine")}</p><strong>${escapeHtml(incomingSeed)}</strong>${incomingWhy ? `<p><b>Connection:</b> ${escapeHtml(incomingWhy)}</p>` : ""}${incomingVisual ? `<p><b>Visual direction:</b> ${escapeHtml(incomingVisual)}</p>` : ""}<div class="actions"><button class="btn primary" type="button" id="keepIncomingSeed">Save to Lab Notes</button><a class="btn" href="${fabricatorUrl(incomingSeed)}">Send Back to Fabricator</a></div>`;
      bridge.insertAdjacentElement("afterend", incoming);
      document.getElementById("keepIncomingSeed")?.addEventListener("click", () => {
        const key = "inkTshirtLabIncoming";
        const saved = JSON.parse(localStorage.getItem(key) || "[]");
        saved.unshift({
          seed: incomingSeed,
          why: incomingWhy,
          visual: incomingVisual,
          source: incomingSource || "idea-fabricator",
          date: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(saved.slice(0, 40)));
        const message = document.getElementById("actionMessage");
        if (message) message.textContent = `Saved Fabricator seed: ${incomingSeed}`;
      });
    }
  }

  function init() {
    renderRooms();
    normalizePublicPunTerminology();
    addFoundryPunGallery();
    enhanceTshirtLab();
  }

  window.InkRooms = {
    all: () => rooms.map((room) => ({ ...room })),
    byId: (id) => rooms.find((room) => room.id === id) || null
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();