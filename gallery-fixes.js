(() => {
  "use strict";

  const UNWANTED_TITLES = new Set([
    "Robert's Poem / Writing Piece",
    "Studio Poem"
  ]);

  function cleanGallery() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    grid.querySelectorAll(".gallery-card").forEach((card) => {
      const title = card.querySelector(".gallery-card-title")?.textContent?.trim() || "";
      const category = card.querySelector(".gallery-card-kicker")?.textContent?.trim() || "";

      if (UNWANTED_TITLES.has(title) || category === "Writing / Poem") {
        card.remove();
        return;
      }

      if (category === "Functional Art") {
        card.classList.add("gallery-card-contain");
      }
    });

    document.querySelectorAll("#filterRow .filter-chip").forEach((button) => {
      if ((button.textContent || "").trim() === "Writing / Poem") button.remove();
    });

    const visibleCards = grid.querySelectorAll(".gallery-card").length;
    const count = document.getElementById("galleryCount");
    if (count) {
      const total = Math.max(visibleCards, 0);
      count.textContent = `${visibleCards} / ${total} Entries`;
    }
  }

  function start() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    cleanGallery();
    const observer = new MutationObserver(cleanGallery);
    observer.observe(grid, { childList: true, subtree: true });

    const filters = document.getElementById("filterRow");
    if (filters) observer.observe(filters, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();