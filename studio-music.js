(() => {
  "use strict";

  const refresh = () => window.InkspirationsAudioEngine?.refresh();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
})();
