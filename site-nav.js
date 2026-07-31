(() => {
  "use strict";

  const originalScrollTo = window.scrollTo.bind(window);

  window.scrollTo = (...args) => {
    const options = args.length === 1 && typeof args[0] === "object" ? args[0] : null;
    const active = document.activeElement;
    const galleryControlActive = active instanceof Element && Boolean(active.closest("#filterRow, #gallerySearch, #gallerySort, #galleryFloatNav"));
    if (galleryControlActive && options?.behavior === "smooth") return;
    originalScrollTo(...args);
  };

  const removePublicSalesOptions = () => {
    const salesSelectors = [
      'a[href*="pricing.html"]',
      'a[href*="coasters-tiles.html"]',
      'a[href*="merch-foundry.html"]',
      'a[href*="#functional-art"]',
      '#functional'
    ];

    document.querySelectorAll(salesSelectors.join(",")).forEach((element) => {
      const removableCard = element.closest(".world-card, .room-card, .work-card, .asset-slot");
      (removableCard || element).remove();
    });

    document.querySelectorAll("section, article, div").forEach((element) => {
      const text = element.textContent?.trim().toLowerCase() || "";
      const isProductBlock =
        text.includes("coaster sets") ||
        text.includes("blue current coasters") ||
        text.includes("pricing & orders") ||
        text.includes("purchase options for shades of blue");
      if (isProductBlock && element.closest("main")) {
        const specific = element.closest("section, article, .world-card, .room-card, .asset-slot");
        if (specific && specific !== document.querySelector("main")) specific.remove();
      }
    });

    const replacements = new Map([
      ["A focused public portfolio for artwork, creative direction, brand presentation, and functional art concepts.", "A focused public portfolio for artwork, creative direction, brand presentation, photography, and visual storytelling."],
      ["The visitor sees the artwork first, then the studio identity, creative direction, writing, functional art, and ways to order.", "The visitor sees the artwork first, followed by studio identity, creative direction, writing, and atmospheric experiences."],
      ["Open a card to see the piece larger, read the portfolio note, and use Pricing & Orders for available formats.", "Open a card to see the piece larger and read the portfolio note."],
      ["Studio rooms, writing paths, atmosphere, and acquisition routes are gathered here after the main portfolio.", "Studio rooms, writing paths, and atmosphere are gathered here after the main portfolio."],
      ["Original Poetry · Available for Purchase", "Original Poetry"]
    ]);

    document.querySelectorAll("p, span, h1, h2, h3, strong, small").forEach((element) => {
      const current = element.textContent?.trim();
      if (replacements.has(current)) element.textContent = replacements.get(current);
    });
  };

  const cleanPublicGallery = () => {
    document.getElementById("galleryFloatNav")?.remove();
    document.getElementById("pageReturnNav")?.remove();
    document.body.classList.remove("gallery-nav-active", "page-return-active");

    document.querySelectorAll("#galleryGrid .gallery-card").forEach((card) => {
      const title = card.querySelector(".gallery-card-title")?.textContent?.trim().toLowerCase() || "";
      if (title === "studio blue identity card" || title === "inkspirations studios identity card") {
        card.remove();
      }
    });
  };

  const fixGalleryFilters = () => {
    const filterRow = document.getElementById("filterRow");
    const search = document.getElementById("gallerySearch");
    const grid = document.getElementById("galleryGrid");
    if (!filterRow) return;

    filterRow.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;

      const label = button.textContent?.trim().toLowerCase() || "";

      if (label.includes("writing") || label.includes("poem")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.href = "rooms.html#writing-room";
        return;
      }

      if (search && search.value) {
        search.value = "";
        search.dispatchEvent(new Event("input", { bubbles: true }));
      }

      window.setTimeout(cleanPublicGallery, 80);
    }, true);

    if (grid) {
      new MutationObserver(cleanPublicGallery).observe(grid, { childList: true, subtree: true });
    }
  };

  const initializePageFixes = () => {
    cleanPublicGallery();
    fixGalleryFilters();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePageFixes, { once: true });
  } else {
    initializePageFixes();
  }

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

  const normalizedPath = (pathname) => {
    const decoded = decodeURIComponent(pathname || "/");
    return decoded.replace(/\/index\.html$/i, "/").replace(/\/$/, "") || "/";
  };

  const findTarget = (hash) => {
    if (!hash || hash === "#") return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return document.getElementById(hash.slice(1));
    }
  };

  const targetTop = (target) => {
    const scrollMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    return Math.max(0, target.getBoundingClientRect().top + window.scrollY - scrollMargin);
  };

  const scrollToTarget = (target, updateHistory = true) => {
    if (!target) return false;

    if (updateHistory && target.id) {
      history.pushState(null, "", `#${encodeURIComponent(target.id)}`);
    }

    originalScrollTo({ top: targetTop(target), left: 0, behavior: "auto" });
    return true;
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    let url;
    try {
      url = new URL(link.getAttribute("href"), window.location.href);
    } catch {
      return;
    }

    const samePage = url.origin === window.location.origin &&
      normalizedPath(url.pathname) === normalizedPath(window.location.pathname) &&
      url.search === window.location.search;

    if (!samePage || !url.hash) return;

    const target = findTarget(url.hash);
    if (!target) return;

    event.preventDefault();
    scrollToTarget(target, true);
  });

  const restoreHashPosition = () => {
    const target = findTarget(window.location.hash);
    if (!target) return;
    requestAnimationFrame(() => scrollToTarget(target, false));
  };

  window.addEventListener("popstate", restoreHashPosition);
  window.addEventListener("hashchange", restoreHashPosition);
  window.addEventListener("load", restoreHashPosition);
  document.addEventListener("DOMContentLoaded", restoreHashPosition, { once: true });
})();
