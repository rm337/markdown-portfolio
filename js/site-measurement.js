(() => {
  const key = "inkspirations.discovery";
  const params = new URLSearchParams(location.search);
  const source = {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    referrer: document.referrer || "",
    landingPage: location.pathname
  };

  try {
    const previous = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!previous) sessionStorage.setItem(key, JSON.stringify(source));
  } catch { /* Measurement must never interrupt the visitor experience. */ }

  function send(name, details = {}) {
    const payload = { event: name, ...details };
    window.dispatchEvent(new CustomEvent("inkspirations:measurement", { detail: payload }));
    if (typeof window.gtag === "function") window.gtag("event", name, details);
    if (typeof window.plausible === "function") window.plausible(name, { props: details });
  }

  function fixHomepagePhotographyRoute() {
    const path = location.pathname.replace(/\/index\.html$/i, "/");
    const isHome = path === "/" || path.endsWith("/markdown-portfolio/");
    if (!isHome) return;

    document.querySelectorAll(".work-card").forEach((card) => {
      const title = card.querySelector("h3");
      if (!title || !/artwork\s*&\s*photography/i.test(title.textContent || "")) return;

      card.href = "photography.html";
      card.style.setProperty("--scene", "linear-gradient(180deg,rgba(1,14,26,.12),rgba(1,14,26,.86)),url('assets/images/portfolio/coasters/blue-wave-wood-panel-functional-art.jpg') center / cover no-repeat");
      title.textContent = "Photography";

      const kicker = card.querySelector(".kicker");
      const description = card.querySelector("p");
      const enter = card.querySelector(".enter");
      if (kicker) kicker.textContent = "PHOTOGRAPHY";
      if (description) description.textContent = "Studio photographs, object studies, surfaces, details, and visual moments presented in their own gallery.";
      if (enter) enter.textContent = "View Photography";
    });
  }

  function installBubbleField() {
    if (document.querySelector(".studio-bubble-field")) return;

    const style = document.createElement("style");
    style.id = "studio-bubble-styles-local";
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
  }

  function installPricingAtmosphere() {
    if (!/\/pricing\.html$/i.test(location.pathname)) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;

    hero.style.position = "relative";
    hero.style.overflow = "hidden";
    hero.style.isolation = "isolate";

    let canvas = document.getElementById("ink-injection-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "ink-injection-canvas";
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        zIndex: "0",
        pointerEvents: "none",
        opacity: ".96"
      });
      hero.prepend(canvas);
    }

    [...hero.children].forEach((child) => {
      if (child === canvas) return;
      child.style.position = "relative";
      child.style.zIndex = "2";
    });

    if (!document.querySelector('script[data-fluid-ink="true"]')) {
      const script = document.createElement("script");
      script.src = "js/ink-injection.js?v=20260821-fluid";
      script.defer = true;
      script.dataset.fluidInk = "true";
      document.body.appendChild(script);
    }

    installBubbleField();
  }

  function initializeVisualFixes() {
    fixHomepagePhotographyRoute();
    installPricingAtmosphere();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeVisualFixes, { once: true });
  else initializeVisualFixes();

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (href.startsWith("mailto:")) send("contact_click", { page_path: location.pathname });
    else if (/^https?:/i.test(href) && new URL(href, location.href).origin !== location.origin) send("outbound_click", { destination: href, page_path: location.pathname });
    else if (href.includes("/artwork/") || href.startsWith("artwork/")) send("artwork_view", { destination: href, page_path: location.pathname });
  });
})();
