(() => {
  "use strict";

  const images = [
    document.getElementById("modalImg"),
    document.getElementById("lightbox-image")
  ].filter(Boolean);

  const zoomLevels = [1, 1.8, 2.6];

  function applyState(image, levelIndex = 0) {
    const scale = zoomLevels[levelIndex] || 1;
    image.dataset.zoomLevel = String(levelIndex);
    image.style.setProperty("--detail-scale", String(scale));
    image.style.setProperty("--detail-x", "0px");
    image.style.setProperty("--detail-y", "0px");
    image.classList.toggle("is-detail-zoomed", levelIndex > 0);
    image.setAttribute("aria-pressed", String(levelIndex > 0));
    image.setAttribute(
      "aria-label",
      levelIndex === 0
        ? "Magnify artwork"
        : levelIndex === zoomLevels.length - 1
          ? "Return artwork to full view"
          : "Magnify artwork more"
    );
    image.closest(".gallery-lightbox, .lightbox")?.classList.toggle("has-detail-zoom", levelIndex > 0);
  }

  function cycleZoom(image, event) {
    if (event && typeof event.clientX === "number") {
      const rect = image.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      image.style.transformOrigin = `${x}% ${y}%`;
    }

    const current = Number(image.dataset.zoomLevel || 0);
    const next = (current + 1) % zoomLevels.length;
    applyState(image, next);
    return next;
  }

  function attachDrag(image) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;

    image.addEventListener("pointerdown", (event) => {
      if (Number(image.dataset.zoomLevel || 0) === 0) return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      baseX = Number(image.dataset.panX || 0);
      baseY = Number(image.dataset.panY || 0);
      image.setPointerCapture?.(event.pointerId);
      image.classList.add("is-dragging");
      event.preventDefault();
    });

    image.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const x = baseX + (event.clientX - startX);
      const y = baseY + (event.clientY - startY);
      image.dataset.panX = String(x);
      image.dataset.panY = String(y);
      image.style.setProperty("--detail-x", `${x}px`);
      image.style.setProperty("--detail-y", `${y}px`);
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      image.releasePointerCapture?.(event.pointerId);
      image.classList.remove("is-dragging");
    };

    image.addEventListener("pointerup", endDrag);
    image.addEventListener("pointercancel", endDrag);
  }

  images.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.dataset.panX = "0";
    image.dataset.panY = "0";
    applyState(image, 0);
    attachDrag(image);

    image.addEventListener("click", (event) => {
      if (image.classList.contains("is-dragging")) return;
      image.dataset.panX = "0";
      image.dataset.panY = "0";
      cycleZoom(image, event);
    });

    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        image.dataset.panX = "0";
        image.dataset.panY = "0";
        cycleZoom(image);
      }
    });

    const container = image.closest(".modal, dialog") || image;
    new MutationObserver(() => {
      if (!image.closest(".open, [open]")) {
        image.dataset.panX = "0";
        image.dataset.panY = "0";
        applyState(image, 0);
      }
    }).observe(container, { attributes: true, attributeFilter: ["class", "open"] });
  });

  document.querySelectorAll("[data-detail-zoom]").forEach((control) => {
    const image = document.getElementById(control.dataset.detailZoom);
    if (!image) return;

    control.addEventListener("click", () => {
      const next = cycleZoom(image);
      control.textContent = next === 0 ? "Zoom In" : next === 1 ? "Zoom More" : "Fit to Screen";
      control.setAttribute("aria-pressed", String(next > 0));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      images.forEach((image) => {
        image.dataset.panX = "0";
        image.dataset.panY = "0";
        applyState(image, 0);
      });
    }
  });
})();