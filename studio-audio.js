(() => {
  const buttons = [...document.querySelectorAll("[data-audio-toggle]")];
  if (!buttons.length) return;

  const media = document.createElement("video");
  media.src = "assets/audio/rain-studio.mov";
  media.loop = true;
  media.preload = "metadata";
  media.playsInline = true;
  media.muted = false;
  media.volume = 0.32;
  media.setAttribute("aria-hidden", "true");
  media.style.position = "fixed";
  media.style.width = "1px";
  media.style.height = "1px";
  media.style.opacity = "0";
  media.style.pointerEvents = "none";
  media.style.left = "-9999px";
  document.body.appendChild(media);

  let playing = false;

  function sync(label) {
    buttons.forEach((button) => {
      button.textContent = label || (playing ? "Audio On" : "Studio Audio");
      button.setAttribute("aria-pressed", String(playing));
    });
  }

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", async () => {
      try {
        if (playing) {
          media.pause();
          playing = false;
          sync("Studio Audio");
          return;
        }
        sync("Audio Starting...");
        await media.play();
        playing = true;
        sync("Audio On");
      } catch (error) {
        playing = false;
        sync("Audio Unavailable");
        console.warn("Inkspirations studio audio could not start", error);
      }
    });
  });
})();