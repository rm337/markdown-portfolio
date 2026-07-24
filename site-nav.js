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

  const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const targetTop = (target) => {
    const scrollMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    return Math.max(0, target.getBoundingClientRect().top + window.scrollY - scrollMargin);
  };

  const scrollToTarget = (target, updateHistory = true, behavior = "smooth") => {
    if (!target) return false;

    if (updateHistory && target.id) {
      history.pushState(null, "", `#${encodeURIComponent(target.id)}`);
    }

    window.scrollTo({
      top: targetTop(target),
      left: 0,
      behavior: prefersReducedMotion() ? "auto" : behavior
    });

    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
      target.dataset.temporaryScrollFocus = "true";
    }

    window.setTimeout(() => {
      target.focus({ preventScroll: true });
      if (target.dataset.temporaryScrollFocus === "true") {
        target.addEventListener("blur", () => {
          target.removeAttribute("tabindex");
          delete target.dataset.temporaryScrollFocus;
        }, { once: true });
      }
    }, behavior === "auto" ? 80 : 450);

    return true;
  };

  const stabilizeHashPosition = () => {
    const target = findTarget(window.location.hash);
    if (!target) return;

    let previousTop = null;
    let stablePasses = 0;
    let attempts = 0;

    const settle = () => {
      attempts += 1;
      const nextTop = targetTop(target);
      const drift = previousTop === null ? Infinity : Math.abs(nextTop - previousTop);

      if (drift < 2) stablePasses += 1;
      else stablePasses = 0;

      previousTop = nextTop;
      window.scrollTo({ top: nextTop, left: 0, behavior: "auto" });

      if (stablePasses < 2 && attempts < 10) {
        window.setTimeout(settle, attempts < 4 ? 90 : 180);
      }
    };

    requestAnimationFrame(settle);
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
    window.setTimeout(stabilizeHashPosition, 500);
  });

  const restoreHashPosition = () => {
    const target = findTarget(window.location.hash);
    if (!target) return;
    scrollToTarget(target, false, "auto");
    stabilizeHashPosition();
  };

  window.addEventListener("popstate", restoreHashPosition);
  window.addEventListener("hashchange", restoreHashPosition);
  window.addEventListener("load", restoreHashPosition);
  document.addEventListener("DOMContentLoaded", restoreHashPosition, { once: true });

  const layoutObserver = new MutationObserver(() => {
    if (!window.location.hash) return;
    window.clearTimeout(layoutObserver.timer);
    layoutObserver.timer = window.setTimeout(stabilizeHashPosition, 60);
  });

  layoutObserver.observe(document.body, { childList: true, subtree: true });
})();