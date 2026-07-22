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
      subtitle: "Words, reflection, and Robertisms.",
      description: "A quieter room for poetry, phrases, case files, and the studio’s written voice.",
      url: "rooms.html#writing-room",
      accent: "#ffe6ad",
      category: "Writing",
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
      url: "portfolio.html",
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

  window.InkRooms = {
    all: () => rooms.map((room) => ({ ...room })),
    byId: (id) => rooms.find((room) => room.id === id) || null
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderRooms, { once: true });
  else renderRooms();
})();
