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

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (href.startsWith("mailto:")) send("contact_click", { page_path: location.pathname });
    else if (/^https?:/i.test(href) && new URL(href, location.href).origin !== location.origin) send("outbound_click", { destination: href, page_path: location.pathname });
    else if (href.includes("/artwork/") || href.startsWith("artwork/")) send("artwork_view", { destination: href, page_path: location.pathname });
  });
})();
