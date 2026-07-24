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
    enhanceMerchFoundryNotes();
  }

  window.InkRooms = {
    all: () => rooms.map((room) => ({ ...room })),
    byId: (id) => rooms.find((room) => room.id === id) || null
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();