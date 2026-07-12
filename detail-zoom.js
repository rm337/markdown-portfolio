(() => {
  "use strict";

  const style = document.createElement("style");
  style.textContent = `
    .gallery-card img,
    .featured-panel img {
      object-fit: contain !important;
      background: #07131f !important;
    }

    #modalImg,
    #lightbox-image {
      width: 100% !important;
      height: 100% !important;
      max-width: 100vw !important;
      max-height: 100dvh !important;
      object-fit: contain !important;
      transform: translate(var(--detail-x, 0px), var(--detail-y, 0px)) scale(var(--detail-scale, 1)) !important;
      transform-origin: center center;
      transition: transform .22s ease;
      cursor: zoom-in;
      touch-action: none;
      user-select: none;
    }

    #modalImg.is-detail-zoomed,
    #lightbox-image.is-detail-zoomed {
      cursor: grab;
      max-width: none !important;
      max-height: none !important;
    }

    #modalImg.is-dragging,
    #lightbox-image.is-dragging {
      cursor: grabbing;
      transition: none;
    }

    .gallery-lightbox,
    .lightbox figure {
      overflow: hidden !important;
    }

    .gallery-lightbox.has-detail-zoom .modal-bar,
    .lightbox.has-detail-zoom figcaption {
      opacity: .08;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  const images = [
    document.getElementById("modalImg"),
    document.getElementById("lightbox-image")
  ].filter(Boolean);

  const zoomLevels = [1, 1.5, 2, 2.75];

  function getControls(image) {
    return {
      zoomIn: [...document.querySelectorAll(`[data-detail-zoom-in="${image.id}"]`)],
      zoomOut: [...document.querySelectorAll(`[data-detail-zoom-out="${image.id}"]`)],
      reset: [...document.querySelectorAll(`[data-detail-zoom-reset="${image.id}"]`)],
      legacy: [...document.querySelectorAll(`[data-detail-zoom="${image.id}"]`)]
    };
  }

  function resetPan(image) {
    image.dataset.panX = "0";
    image.dataset.panY = "0";
    image.style.setProperty("--detail-x", "0px");
    image.style.setProperty("--detail-y", "0px");
    image.style.transformOrigin = "center center";
  }

  function syncControls(image, levelIndex) {
    const controls = getControls(image);
    const atMinimum = levelIndex === 0;
    const atMaximum = levelIndex === zoomLevels.length - 1;

    controls.zoomOut.forEach((control) => {
      control.disabled = atMinimum;
      control.setAttribute("aria-disabled", String(atMinimum));
    });

    controls.zoomIn.forEach((control) => {
      control.disabled = atMaximum;
      control.setAttribute("aria-disabled", String(atMaximum));
    });

    controls.reset.forEach((control) => {
      control.disabled = atMinimum;
      control.setAttribute("aria-disabled", String(atMinimum));
    });

    controls.legacy.forEach((control) => {
      control.textContent = atMaximum ? "Fit to Screen" : levelIndex > 0 ? "Zoom More" : "Zoom In";
      control.setAttribute("aria-pressed", String(levelIndex > 0));
    });
  }

  function applyState(image, levelIndex = 0) {
    const safeIndex = Math.max(0, Math.min(levelIndex, zoomLevels.length - 1));
    const scale = zoomLevels[safeIndex];

    image.dataset.zoomLevel = String(safeIndex);
    image.style.setProperty("--detail-scale", String(scale));
    image.classList.toggle("is-detail-zoomed", safeIndex > 0);
    image.setAttribute("aria-pressed", String(safeIndex > 0));
    image.setAttribute("aria-label", safeIndex > 0 ? "Zoomed artwork. Drag to inspect details." : "Magnify artwork");
    image.closest(".gallery-lightbox, .lightbox")?.classList.toggle("has-detail-zoom", safeIndex > 0);
    syncControls(image, safeIndex);
  }

  function setZoom(image, levelIndex, event) {
    if (event && typeof event.clientX === "number") {
      const rect = image.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      image.style.transformOrigin = `${x}% ${y}%`;
    }

    const current = Number(image.dataset.zoomLevel || 0);
    const next = Math.max(0, Math.min(levelIndex, zoomLevels.length - 1));
    if (next === 0 || next < current) resetPan(image);
    applyState(image, next);
    return next;
  }

  function attachDrag(image) {
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;

    image.addEventListener("pointerdown", (event) => {
      if (Number(image.dataset.zoomLevel || 0) === 0) return;
      dragging = true;
      moved = false;
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
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      const x = baseX + dx;
      const y = baseY + dy;
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
      image.dataset.justDragged = moved ? "true" : "false";
      window.setTimeout(() => { image.dataset.justDragged = "false"; }, 0);
    };

    image.addEventListener("pointerup", endDrag);
    image.addEventListener("pointercancel", endDrag);
  }

  images.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    resetPan(image);
    applyState(image, 0);
    attachDrag(image);

    image.addEventListener("click", (event) => {
      if (image.dataset.justDragged === "true") return;
      const current = Number(image.dataset.zoomLevel || 0);
      setZoom(image, current + 1, event);
    });

    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const current = Number(image.dataset.zoomLevel || 0);
        setZoom(image, current + 1);
      }
    });

    const controls = getControls(image);

    controls.zoomIn.forEach((control) => {
      control.addEventListener("click", () => {
        const current = Number(image.dataset.zoomLevel || 0);
        setZoom(image, current + 1);
      });
    });

    controls.zoomOut.forEach((control) => {
      control.addEventListener("click", () => {
        const current = Number(image.dataset.zoomLevel || 0);
        setZoom(image, current - 1);
      });
    });

    controls.reset.forEach((control) => {
      control.addEventListener("click", () => setZoom(image, 0));
    });

    controls.legacy.forEach((control) => {
      control.addEventListener("click", () => {
        const current = Number(image.dataset.zoomLevel || 0);
        setZoom(image, current === zoomLevels.length - 1 ? 0 : current + 1);
      });
    });

    const container = image.closest(".modal, dialog") || image;
    new MutationObserver(() => {
      if (!image.closest(".open, [open]")) {
        resetPan(image);
        applyState(image, 0);
      }
    }).observe(container, { attributes: true, attributeFilter: ["class", "open"] });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      images.forEach((image) => {
        resetPan(image);
        applyState(image, 0);
      });
    }
  });
})();