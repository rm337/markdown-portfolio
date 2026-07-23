(() => {
  "use strict";

  const navs = document.querySelectorAll("[data-site-nav], .nav, .top-nav, .room-hub-nav");

  navs.forEach((nav, index) => {
    if (nav.dataset.siteNavReady === "true") return;
    const links = nav.querySelector(":scope > .links, :scope > .nav-links, :scope > .room-hub-links, :scope > nav.links");
    if (!links || links.querySelectorAll("a").length < 2) return;

    const linksId = links.id || `site-nav-links-${index + 1}`;
    links.id = linksId;
    links.classList.add("site-nav-links");
    nav.classList.add("site-nav-shell");
    nav.dataset.siteNavReady = "true";
    nav.dataset.menuOpen = "false";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "site-nav-toggle";
    toggle.setAttribute("aria-controls", linksId);
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
    nav.insertBefore(toggle, links);

    const setOpen = (open) => {
      nav.dataset.menuOpen = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    };

    toggle.addEventListener("click", () => setOpen(nav.dataset.menuOpen !== "true"));
    links.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    nav.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || nav.dataset.menuOpen !== "true") return;
      setOpen(false);
      toggle.focus();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) setOpen(false);
    });
  });

  const removeUnapprovedPortfolioContent = () => {
    if (window.InkspirationsBringHomeData) {
      delete window.InkspirationsBringHomeData["roberts-poem"];
    }

    document.querySelectorAll("#writing, a[href*='writing-room'], [data-id='roberts-poem'], [data-work-id='roberts-poem']").forEach((element) => {
      const card = element.closest(".world-card, .room-card, .gallery-card, .feature-section") || element;
      card.remove();
    });

    document.querySelectorAll(".gallery-card").forEach((card) => {
      const text = card.textContent.toLowerCase();
      const image = card.querySelector("img");
      const isPoem = text.includes("robert's poem") || text.includes("writing piece") || text.includes("rain at the studio window");
      const isPlaceholder = !image || image.src.startsWith("data:image/svg+xml");
      if (isPoem || isPlaceholder) card.remove();
    });
  };

  removeUnapprovedPortfolioContent();
  const observer = new MutationObserver(removeUnapprovedPortfolioContent);
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 10000);
})();