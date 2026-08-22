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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fixHomepagePhotographyRoute, { once: true });
  else fixHomepagePhotographyRoute();

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (href.startsWith("mailto:")) send("contact_click", { page_path: location.pathname });
    else if (/^https?:/i.test(href) && new URL(href, location.href).origin !== location.origin) send("outbound_click", { destination: href, page_path: location.pathname });
    else if (href.includes("/artwork/") || href.startsWith("artwork/")) send("artwork_view", { destination: href, page_path: location.pathname });
  });
})();
