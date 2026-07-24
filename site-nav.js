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

  const scrollToTarget = (target, updateHistory = true) => {
    if (!target) return false;

    if (updateHistory && target.id) {
      history.pushState(null, "", `#${encodeURIComponent(target.id)}`);
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });

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
    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    const samePage = url.origin === window.location.origin &&
      url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "") &&
      url.search === window.location.search;

    if (!samePage || !url.hash) return;

    const id = decodeURIComponent(url.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    scrollToTarget(target, true);
  });

  window.addEventListener("popstate", () => {
    if (!window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    scrollToTarget(target, false);
  });

  window.addEventListener("load", () => {
    if (!window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) window.setTimeout(() => scrollToTarget(target, false), 100);
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