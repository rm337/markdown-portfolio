(() => {
  "use strict";

  const originalScrollTo = window.scrollTo.bind(window);
  const ROBERT_PIXELS_PROFILE = "https://pixels.com/profiles/robert-marleton";

  const enforceRobertPixelsLinks = (root = document) => {
    root.querySelectorAll?.('a[href*="pixels.com"], a[href*="fineartamerica.com"]').forEach((link) => {
      link.href = ROBERT_PIXELS_PROFILE;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  };

  const watchPixelsLinks = () => {
    enforceRobertPixelsLinks();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.('a[href*="pixels.com"], a[href*="fineartamerica.com"]')) {
            node.href = ROBERT_PIXELS_PROFILE;
            node.target = "_blank";
            node.rel = "noopener noreferrer";
          }
          enforceRobertPixelsLinks(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  window.scrollTo = (...args) => {
    const options = args.length === 1 && typeof args[0] === "object" ? args[0] : null;
    const active = document.activeElement;
    const galleryControlActive = active instanceof Element && Boolean(active.closest("#filterRow, #gallerySearch, #gallerySort, #galleryFloatNav"));
    if (galleryControlActive && options?.behavior === "smooth") return;
    originalScrollTo(...args);
  };

  const installStudioBubbles = () => {
    if (document.querySelector(".studio-bubble-field")) return;

    const style = document.createElement("style");
    style.id = "studio-bubble-styles";
    style.textContent = `
      .studio-bubble-field{position:fixed;inset:0;z-index:9990;pointer-events:none;overflow:hidden;mix-blend-mode:screen;opacity:.58}
      .studio-bubble{position:absolute;bottom:-12vh;border-radius:50%;border:1px solid rgba(220,250,255,.48);background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.48),rgba(164,232,245,.12) 38%,rgba(77,174,207,.03) 70%,transparent 72%);box-shadow:inset -2px -3px 8px rgba(40,138,175,.15),0 0 10px rgba(174,239,249,.08);animation:studioBubbleRise var(--bubble-speed) linear infinite;animation-delay:var(--bubble-delay);transform:translate3d(0,0,0)}
      @keyframes studioBubbleRise{0%{transform:translate3d(0,10vh,0) scale(.76);opacity:0}12%{opacity:.42}52%{transform:translate3d(var(--bubble-drift),-52vh,0) scale(1)}88%{opacity:.34}100%{transform:translate3d(calc(var(--bubble-drift) * -.55),-118vh,0) scale(1.16);opacity:0}}
      @media(prefers-reduced-motion:reduce){.studio-bubble-field{display:none!important}}
    `;
    document.head.appendChild(style);

    const field = document.createElement("div");
    field.className = "studio-bubble-field";
    field.setAttribute("aria-hidden", "true");

    const bubbleCount = window.innerWidth < 760 ? 9 : 15;
    for (let i = 0; i < bubbleCount; i += 1) {
      const bubble = document.createElement("i");
      bubble.className = "studio-bubble";
      const size = 5 + ((i * 13) % 21);
      const left = 3 + ((i * 17) % 94);
      const speed = 18 + ((i * 7) % 22);
      const delay = -((i * 4.3) % 31);
      const drift = `${-28 + ((i * 11) % 57)}px`;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.setProperty("--bubble-speed", `${speed}s`);
      bubble.style.setProperty("--bubble-delay", `${delay}s`);
      bubble.style.setProperty("--bubble-drift", drift);
      field.appendChild(bubble);
    }

    document.body.appendChild(field);
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
    watchPixelsLinks();
    installStudioBubbles();
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
    const link = event.target.closest?.("a[href]");
    if (!link) return;

    let clickedUrl;
    try {
      clickedUrl = new URL(link.getAttribute("href"), window.location.href);
    } catch {
      clickedUrl = null;
    }

    if (clickedUrl && /(^|\.)pixels\.com$/i.test(clickedUrl.hostname) || clickedUrl && /(^|\.)fineartamerica\.com$/i.test(clickedUrl.hostname)) {
      link.href = ROBERT_PIXELS_PROFILE;
      return;
    }

    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

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
