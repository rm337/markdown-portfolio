(() => {
  "use strict";

  const rooms = [
    {
      id: "ocean-of-ink",
      title: "Ocean of Ink",
      subtitle: "The atmospheric center of the studio.",
      description: "Blue current, floating pigment, and a slower visual room for looking closely.",
      url: "rooms.html#ocean-of-ink",
      accent: "#56d9ff",
      category: "Atmosphere",
      status: "Open"
    },
    {
      id: "writing-room",
      title: "Writing Room",
      subtitle: "Words, expressions, and reflective studio writing.",
      description: "A dedicated room for the language side of Inkspirations Studios, including original writing and word-based creative work.",
      url: "rooms.html#writing-room",
      accent: "#ffe6ad",
      category: "Writing / Words & Expressions",
      status: "Open"
    },
    {
      id: "music-room",
      title: "Music Room",
      subtitle: "Original studio signals and listening paths.",
      description: "Play an Inkspirations browser session or continue to official artist platforms.",
      url: "music.html",
      accent: "#8ff3e8",
      category: "Sound",
      status: "Playing"
    },
    {
      id: "flight-deck",
      title: "Flight Deck DJ",
      subtitle: "C4 Territory is online.",
      description: "A cinematic resident-DJ room with original playback and official listening paths.",
      url: "flight-deck.html",
      accent: "#ff6b9d",
      category: "Performance",
      status: "Live"
    },
    {
      id: "coasters-tiles",
      title: "Coasters & Decorative Tiles",
      subtitle: "Functional art made to live with.",
      description: "Recovered coaster, wood-panel, and round functional-art studies with full-screen viewing.",
      url: "coasters-tiles.html",
      accent: "#d8aa54",
      category: "Functional Art",
      status: "Open"
    },
    {
      id: "portfolio",
      title: "Artwork Gallery",
      subtitle: "The main collection.",
      description: "Browse selected artwork, open images full screen, and ask directly about a piece.",
      url: "portfolio.html#portfolio",
      accent: "#0174f3",
      category: "Gallery",
      status: "Open"
    }
  ];

  const foundryPuns = [
    {
      title: "My Code Turned Into $pagetti",
      label: "Tech Wordplay",
      description: "A debugging joke built from the familiar moment when clean logic becomes tangled code. The dollar sign turns the phrase into a compact visual pun with strong appeal for developers, designers, and anyone who has survived a stubborn refactor."
    },
    {
      title: "All My PUPS Are on a Leash",
      label: "Controlled Chaos",
      description: "A playful line about keeping processes, programs, or unpredictable little systems under control. The joke works because it sounds domestic and orderly while quietly nodding to the unruly energy of technical work."
    },
    {
      title: "Browser Wars",
      label: "Digital Culture",
      description: "A broad technology satire about compatibility battles, competing platforms, endless tabs, and the daily diplomacy of building for the web. It is concise, recognizable, and flexible enough for apparel, posters, or editorial-style artwork."
    },
    {
      title: "Cheese Burglar",
      label: "Absurdist Humor",
      description: "A compact character concept with immediate visual personality. The humor comes from treating a tiny, ridiculous offense with the gravity of a full criminal case, making it ideal for restrained illustration, stickers, or a deliberately serious case-file treatment."
    },
    {
      title: "FLITLE Deck",
      label: "Studio Oddity",
      description: "An intentional near-miss that turns a familiar phrase into a strange little artifact. Rather than correcting the oddity, the concept preserves it as part of the studio voice, where an almost-right phrase becomes more memorable than the ordinary version."
    },
    {
      title: "Very Polite Dictionary",
      label: "Gentle Wordplay",
      description: "A quiet linguistic joke built around the idea of definitions with manners. Its charm comes from restraint: formal typography, understated humor, and the imagined courtesy of words that wait their turn before explaining themselves."
    }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function roomCard(room) {
    return `<a class="room-card" href="${escapeHtml(room.url)}" style="--room-accent:${escapeHtml(room.accent)}">
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
    style.textContent = `
      .pun-gallery{margin:1rem 0;border:1px solid var(--line);background:rgba(6,14,28,.72);box-shadow:var(--shadow);backdrop-filter:blur(16px)}
      .pun-gallery-head{padding:1rem;border-bottom:1px solid var(--line)}
      .pun-gallery-head h2{margin:0;font-size:1.75rem}
      .pun-gallery-head p:last-child{margin:.45rem 0 0;color:var(--soft);max-width:820px}
      .pun-gallery-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.85rem;padding:1rem}
      .pun-entry{border:1px solid var(--line);background:linear-gradient(145deg,rgba(1,116,243,.12),rgba(86,217,255,.035));padding:1rem;min-height:205px}
      .pun-entry small{display:block;color:var(--cyan);font-family:Arial,sans-serif;font-size:.62rem;font-weight:900;letter-spacing:.13em;text-transform:uppercase;margin-bottom:.65rem}
      .pun-entry h3{font-size:1.45rem;line-height:1.05;color:var(--paper);margin:0 0 .65rem}
      .pun-entry p{color:var(--soft);margin:0}
      @media(max-width:700px){.pun-gallery-grid{grid-template-columns:1fr}.pun-entry{min-height:auto}}
    `;
    document.head.appendChild(style);

    const section = document.createElement("section");
    section.className = "pun-gallery";
    section.id = "punsAndDescriptions";
    section.setAttribute("aria-labelledby", "punsAndDescriptionsTitle");
    section.innerHTML = `
      <div class="pun-gallery-head">
        <p class="kicker">Puns and Descriptions</p>
        <h2 id="punsAndDescriptionsTitle">Wordplay with a reason for being here.</h2>
        <p>Each phrase is treated as a creative artifact, with its humor, meaning, audience, and visual possibilities explained in the same polished spirit as the Robertisms case files.</p>
      </div>
      <div class="pun-gallery-grid">
        ${foundryPuns.map((pun) => `
          <article class="pun-entry">
            <small>${escapeHtml(pun.label)}</small>
            <h3>${escapeHtml(pun.title)}</h3>
            <p>${escapeHtml(pun.description)}</p>
          </article>
        `).join("")}
      </div>
    `;

    foundryGrid.parentNode.insertBefore(section, foundryGrid);
  }

  function enhanceMerchFoundryNotes() {
    if (document.body?.dataset.roomId !== "merch-concept-foundry") return;

    const ideaWall = document.getElementById("ideaWall");
    const detail = document.querySelector(".panel.detail");
    if (!ideaWall || !detail) return;

    detail.id = detail.id || "artifact-note-detail";
    detail.setAttribute("tabindex", "-1");

    let returnButton = document.getElementById("returnToFoundryNotes");
    if (!returnButton) {
      returnButton = document.createElement("button");
      returnButton.type = "button";
      returnButton.id = "returnToFoundryNotes";
      returnButton.className = "btn";
      returnButton.textContent = "Back to Notes";
      returnButton.setAttribute("aria-label", "Return to the selected Foundry note");
      const actions = detail.querySelector(".actions");
      if (actions) actions.prepend(returnButton);
    }

    let lastCard = null;

    ideaWall.addEventListener("click", (event) => {
      const card = event.target.closest(".idea-card");
      if (!card) return;
      lastCard = card;
      window.setTimeout(() => {
        detail.scrollIntoView({ behavior: "smooth", block: "start" });
        detail.focus({ preventScroll: true });
      }, 40);
    });

    returnButton.addEventListener("click", () => {
      const activeCard = ideaWall.querySelector(".idea-card.active") || lastCard;
      if (!activeCard) {
        ideaWall.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      activeCard.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => activeCard.focus({ preventScroll: true }), 350);
    });
  }

  function init() {
    renderRooms();
    addFoundryPunGallery();
    enhanceMerchFoundryNotes();
  }

  window.InkRooms = {
    all: () => rooms.map((room) => ({ ...room })),
    byId: (id) => rooms.find((room) => room.id === id) || null
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();