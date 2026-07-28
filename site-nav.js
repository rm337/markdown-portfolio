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
    removePublicSalesOptions();
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

(() => {
  "use strict";

  const initializeHomepageOcean = () => {
    const hero = document.querySelector(".hero#top");
    if (!hero || hero.dataset.oceanAtmosphere === "ready") return;
    hero.dataset.oceanAtmosphere = "ready";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const style = document.createElement("style");
    style.textContent = `
      .hero#top {
        background:
          radial-gradient(ellipse at 86% 5%, rgba(167,225,238,.18) 0%, rgba(69,154,181,.08) 18%, transparent 43%),
          radial-gradient(ellipse at 68% 62%, rgba(20,91,119,.18), transparent 46%),
          linear-gradient(145deg,#01070d 0%,#03131f 38%,#06283a 69%,#020a10 100%) !important;
      }
      .hero#top::before {
        background:
          linear-gradient(102deg,rgba(1,7,12,.97) 0%,rgba(2,11,18,.82) 38%,rgba(2,12,19,.35) 70%,rgba(2,9,14,.13) 100%),
          linear-gradient(180deg,rgba(2,9,14,.08) 0%,rgba(2,9,14,.18) 48%,rgba(1,6,10,.88) 100%) !important;
      }
      .hero#top::after {
        inset: 0 !important;
        border: 0 !important;
        background:
          repeating-linear-gradient(118deg,transparent 0 8%,rgba(174,226,238,.025) 10%,transparent 13% 24%),
          radial-gradient(ellipse at 82% 11%,rgba(194,235,244,.08),transparent 34%) !important;
        box-shadow: inset 0 -120px 180px rgba(0,0,0,.34) !important;
        mix-blend-mode: screen;
        pointer-events: none;
      }
      #homepage-ocean-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: -2;
        pointer-events: none;
        opacity: .9;
      }
      .hero#top .hero-copy { position: relative; z-index: 2; }
      @media (prefers-reduced-motion: reduce) {
        #homepage-ocean-canvas { display: none; }
      }
    `;
    document.head.appendChild(style);

    if (reduceMotion) return;

    const canvas = document.createElement("canvas");
    canvas.id = "homepage-ocean-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hero.prepend(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let start = performance.now();
    let animationFrame = 0;
    const particles = [];
    const particleCount = Math.min(72, Math.max(34, Math.round(window.innerWidth / 22)));

    const resetParticle = (particle, initial = false) => {
      particle.x = initial ? Math.random() * width : width + Math.random() * 120;
      particle.y = height * (.14 + Math.random() * .76);
      particle.size = .35 + Math.random() * 1.45;
      particle.speed = .08 + Math.random() * .18;
      particle.phase = Math.random() * Math.PI * 2;
      particle.alpha = .035 + Math.random() * .11;
      particle.depth = .5 + Math.random() * 1.2;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particles.length) {
        for (let i = 0; i < particleCount; i += 1) {
          const particle = {};
          resetParticle(particle, true);
          particles.push(particle);
        }
      }
    };

    const drawLight = (time) => {
      const sway = Math.sin(time * .00011) * width * .018;
      const beam = ctx.createLinearGradient(width * .93 + sway, 0, width * .18, height);
      beam.addColorStop(0, "rgba(201,238,246,.13)");
      beam.addColorStop(.22, "rgba(106,190,211,.055)");
      beam.addColorStop(1, "rgba(31,101,128,0)");
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.beginPath();
      ctx.moveTo(width * .76 + sway, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width * .45, height);
      ctx.lineTo(width * .13, height);
      ctx.closePath();
      ctx.fillStyle = beam;
      ctx.fill();
      ctx.restore();
    };

    const drawCurrent = (time, offset, amplitude, thickness, alpha, speed, phase) => {
      ctx.save();
      ctx.beginPath();
      const step = Math.max(12, width / 95);
      for (let x = -80; x <= width + 80; x += step) {
        const travel = time * speed;
        const y = height * offset
          + Math.sin(x * .0042 + travel + phase) * amplitude
          + Math.sin(x * .00165 - travel * .58 + phase * .7) * amplitude * .48
          + Math.cos(x * .0073 + travel * .31) * amplitude * .16;
        if (x === -80) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(18,84,111,0)");
      gradient.addColorStop(.25, `rgba(49,128,153,${alpha * .55})`);
      gradient.addColorStop(.68, `rgba(105,184,202,${alpha})`);
      gradient.addColorStop(1, "rgba(116,197,215,0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.shadowBlur = thickness * 7;
      ctx.shadowColor = `rgba(47,139,169,${alpha * .7})`;
      ctx.stroke();
      ctx.restore();
    };

    const drawParticles = (time) => {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      particles.forEach((particle) => {
        particle.x -= particle.speed * particle.depth;
        particle.y += Math.sin(time * .00028 + particle.phase + particle.x * .008) * .035 * particle.depth;
        if (particle.x < -20) resetParticle(particle);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.depth, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(142,210,225,${particle.alpha})`;
        ctx.fill();
      });
      ctx.restore();
    };

    const render = (time) => {
      ctx.clearRect(0, 0, width, height);
      drawLight(time);
      drawCurrent(time, .28, Math.min(27, height * .035), 1.15, .14, .00019, .3);
      drawCurrent(time, .43, Math.min(42, height * .052), 1.7, .12, .00014, 1.7);
      drawCurrent(time, .59, Math.min(54, height * .068), 2.2, .095, .000105, 3.1);
      drawCurrent(time, .73, Math.min(36, height * .046), 1.35, .07, .00016, 4.6);
      drawParticles(time);
      animationFrame = requestAnimationFrame(render);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrame);
      } else {
        start = performance.now();
        animationFrame = requestAnimationFrame(render);
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    animationFrame = requestAnimationFrame(render);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeHomepageOcean, { once: true });
  } else {
    initializeHomepageOcean();
  }
})();