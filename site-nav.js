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
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return document.getElementById(hash.slice(1)); }
  };

  const scrollToTarget = (target, updateHistory = true) => {
    if (!target) return false;
    if (updateHistory && target.id) history.pushState(null, "", `#${encodeURIComponent(target.id)}`);
    target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
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
    }, 450);
    return true;
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href") || "";
    if (href.startsWith("mailto:") && /inquiry about|ask about|interested in/i.test(decodeURIComponent(href))) {
      event.preventDefault();
      const cardTitle = link.closest(".gallery-card")?.querySelector(".gallery-card-title")?.textContent?.trim() || "Artwork inquiry";
      const source = `${location.pathname.split("/").pop() || "portfolio.html"}${location.hash || "#portfolio"}`;
      location.href = `lead-intake.html?type=${encodeURIComponent("Artwork Inquiry")}&item=${encodeURIComponent(cardTitle)}&source=${encodeURIComponent(source)}`;
      return;
    }

    let url;
    try { url = new URL(href, window.location.href); } catch { return; }
    const samePage = url.origin === window.location.origin && normalizedPath(url.pathname) === normalizedPath(window.location.pathname) && url.search === window.location.search;
    if (!samePage || !url.hash) return;
    const target = findTarget(url.hash);
    if (!target) return;
    event.preventDefault();
    scrollToTarget(target, true);
  });

  const backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.textContent = "Top ↑";
  document.body.appendChild(backToTop);
  const updateBackToTop = () => backToTop.classList.toggle("is-visible", window.scrollY > 520);
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  const restoreHashPosition = () => {
    const target = findTarget(window.location.hash);
    if (!target) return;
    window.setTimeout(() => scrollToTarget(target, false), 100);
  };
  window.addEventListener("popstate", restoreHashPosition);
  window.addEventListener("hashchange", restoreHashPosition);
  window.addEventListener("load", restoreHashPosition);
})();