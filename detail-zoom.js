(() => {
  const images = [
    document.getElementById("modalImg"),
    document.getElementById("lightbox-image")
  ].filter(Boolean);

  function reset(image) {
    image.classList.remove("is-detail-zoomed");
    image.setAttribute("aria-pressed", "false");
    image.setAttribute("aria-label", "Magnify artwork");
  }

  images.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-pressed", "false");
    image.setAttribute("aria-label", "Magnify artwork");

    const toggle = (event) => {\n      if (event && typeof event.clientX === "number") {\n        const rect = image.getBoundingClientRect();\n        const x = ((event.clientX - rect.left) / rect.width) * 100;\n        const y = ((event.clientY - rect.top) / rect.height) * 100;\n        image.style.transformOrigin = `${x}% ${y}%`;\n      }
      const zoomed = image.classList.toggle("is-detail-zoomed");
      image.setAttribute("aria-pressed", String(zoomed));
      image.setAttribute("aria-label", zoomed ? "Return artwork to full view" : "Magnify artwork");
      image.closest(".gallery-lightbox, .lightbox")?.classList.toggle("has-detail-zoom", zoomed);
    };

    image.addEventListener("click", (event) => toggle(event));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });

    new MutationObserver(() => {
      if (!image.closest(".open, [open]")) reset(image);
    }).observe(image.closest(".modal, dialog") || image, { attributes: true, attributeFilter: ["class", "open"] });
  });

  document.querySelectorAll("[data-detail-zoom]").forEach(control => {
    const image = document.getElementById(control.dataset.detailZoom);
    if (!image) return;
    control.addEventListener("click", () => {
      image.click();
      const zoomed = image.classList.contains("is-detail-zoomed");
      control.textContent = zoomed ? "Fit to Screen" : "Zoom In";
      control.setAttribute("aria-pressed", String(zoomed));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") images.forEach(reset);
  });
})();