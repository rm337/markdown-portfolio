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

  function init() {
    renderRooms();
    addFoundryPunGallery();
  }

  window.InkRooms = {
    all: () => rooms.map((room) => ({ ...room })),
    byId: (id) => rooms.find((room) => room.id === id) || null
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();