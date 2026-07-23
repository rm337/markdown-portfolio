(() => {
  "use strict";

  const CONTROL_SELECTOR = "button[data-audio-mode], button[data-audio-toggle], button#soundBtn, .studio-music-toggle";

  function stopEverything() {
    document.querySelectorAll("audio, video").forEach((media) => {
      try {
        media.pause();
        media.currentTime = 0;
      } catch (error) {
        console.warn("Could not stop media element.", error);
      }
    });

    document.querySelectorAll(CONTROL_SELECTOR).forEach((control) => {
      control.setAttribute("aria-pressed", "false");
      control.classList.remove("is-playing");
      if (control.classList.contains("studio-music-toggle")) control.remove();
      else {
        control.disabled = true;
        control.textContent = "Ambient Sound Off";
        control.title = "The repetitive background loop has been disabled.";
      }
    });

    document.documentElement.dataset.audioPlaying = "false";
    document.documentElement.dataset.audioMode = "";

    const soundStatus = document.getElementById("soundStatus");
    if (soundStatus) soundStatus.textContent = "Ambient sound off";
  }

  window.InkspirationsAudioEngine = {
    play: async () => false,
    pause: stopEverything,
    stopAll: stopEverything,
    refresh: stopEverything,
    tracks: {},
    getState: () => ({ playing: false, mode: null, contextState: "disabled" })
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", stopEverything, { once: true });
  } else {
    stopEverything();
  }

  window.addEventListener("pageshow", stopEverything);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopEverything();
  });
})();