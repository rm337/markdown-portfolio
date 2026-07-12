(() => {
  if (window.InkspirationsAudioEngine) return;

  const SOURCES = {
    c4: {
      title: "C4 Flight Deck Session",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      volume: 0.88
    },
    studio: {
      title: "Inkspirations Studio Music",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      volume: 0.72
    },
    rain: {
      title: "Rainstorm Sound",
      url: "https://www.soundjay.com/nature/sounds/rain-01.mp3",
      volume: 0.82
    }
  };

  const players = {};
  let activeMode = null;

  function getStatusPanel() {
    let panel = document.getElementById("inkspirations-audio-status");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "inkspirations-audio-status";
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");
    panel.style.cssText = "position:fixed;left:1rem;bottom:1rem;z-index:10002;max-width:min(360px,calc(100vw - 2rem));padding:.75rem 1rem;border:1px solid rgba(86,217,255,.45);border-radius:12px;background:rgba(1,7,15,.94);color:#f5fbff;font:700 .82rem/1.4 Inter,Arial,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.4);";
    panel.textContent = "Audio ready. Tap a sound button to begin.";
    document.body.appendChild(panel);
    return panel;
  }

  function report(message, isError = false) {
    const panel = getStatusPanel();
    panel.textContent = message;
    panel.style.borderColor = isError ? "rgba(255,125,125,.8)" : "rgba(86,217,255,.45)";
    if (isError) console.error(`[Inkspirations Audio] ${message}`);
    else console.info(`[Inkspirations Audio] ${message}`);
  }

  function createPlayer(mode) {
    if (players[mode]) return players[mode];
    const source = SOURCES[mode];
    const audio = new Audio();
    audio.preload = "metadata";
    audio.loop = true;
    audio.muted = false;
    audio.volume = source.volume;
    audio.playsInline = true;
    audio.src = source.url;
    audio.dataset.mode = mode;

    audio.addEventListener("loadstart", () => report(`Loading: ${source.title}…`));
    audio.addEventListener("canplay", () => report(`Ready: ${source.title}. Tap play to listen.`));
    audio.addEventListener("playing", () => {
      activeMode = mode;
      report(`Now playing: ${source.title}`);
      syncButtons();
    });
    audio.addEventListener("pause", syncButtons);
    audio.addEventListener("waiting", () => report(`Buffering: ${source.title}…`));
    audio.addEventListener("stalled", () => report(`Audio stalled while loading ${source.title}.`, true));
    audio.addEventListener("error", () => {
      const code = audio.error ? audio.error.code : "unknown";
      report(`Could not load ${source.title}. Audio error code: ${code}.`, true);
      if (activeMode === mode) activeMode = null;
      syncButtons();
    });

    players[mode] = audio;
    return audio;
  }

  function stopAll(exceptMode = null) {
    Object.entries(players).forEach(([mode, audio]) => {
      if (mode === exceptMode) return;
      audio.pause();
      audio.currentTime = 0;
    });
    if (activeMode !== exceptMode) activeMode = exceptMode;
  }

  function buttonLabel(mode, playing) {
    if (mode === "c4") return playing ? "Pause C4" : "Play C4";
    if (mode === "studio") return playing ? "Pause Studio Music" : "Studio Music";
    return playing ? "Pause Rainstorm" : "Rainstorm Sound";
  }

  function syncButtons() {
    document.querySelectorAll("[data-ink-audio-mode]").forEach(button => {
      const mode = button.dataset.inkAudioMode;
      const audio = players[mode];
      const isPlaying = Boolean(audio && !audio.paused && !audio.ended);
      const labelNode = button.querySelector("span:last-child");
      if (labelNode) labelNode.textContent = buttonLabel(mode, isPlaying);
      else button.textContent = buttonLabel(mode, isPlaying);
      button.setAttribute("aria-pressed", String(isPlaying));
      button.disabled = false;
    });

    const deckButton = document.getElementById("soundBtn");
    if (deckButton) {
      const audio = players.c4;
      const isPlaying = Boolean(audio && !audio.paused && !audio.ended);
      deckButton.textContent = buttonLabel("c4", isPlaying);
      deckButton.setAttribute("aria-pressed", String(isPlaying));
      deckButton.disabled = false;
    }

    const deckStatus = document.getElementById("soundStatus");
    if (deckStatus) deckStatus.textContent = activeMode ? `Playing ${SOURCES[activeMode].title}` : "Audio ready";
    const trackStatus = document.getElementById("trackStatus");
    if (trackStatus) trackStatus.textContent = activeMode ? `Now playing: ${SOURCES[activeMode].title}` : "Choose a sound to begin.";
  }

  function playFromTap(mode) {
    const audio = createPlayer(mode);

    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      activeMode = null;
      report(`${SOURCES[mode].title} paused.`);
      syncButtons();
      return;
    }

    stopAll(mode);
    audio.muted = false;
    audio.volume = SOURCES[mode].volume;

    // iPhone requires play() to be called directly inside this tap handler.
    const playPromise = audio.play();
    report(`Starting: ${SOURCES[mode].title}…`);
    syncButtons();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(error => {
        activeMode = null;
        report(`Playback failed for ${SOURCES[mode].title}: ${error.name || "Error"} ${error.message || ""}`.trim(), true);
        syncButtons();
      });
    }
  }

  function makeFloatingButton(mode, className, icon, label) {
    let button = document.querySelector(`[data-ink-audio-mode="${mode}"]`);
    if (button) return button;
    button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.inkAudioMode = mode;
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `<span aria-hidden="true">${icon}</span><span>${label}</span>`;
    document.body.appendChild(button);
    return button;
  }

  const studioButton = makeFloatingButton("studio", "studio-music-toggle", "♫", "Studio Music");
  const rainButton = makeFloatingButton("rain", "rainstorm-toggle", "☂", "Rainstorm Sound");

  [studioButton, rainButton].forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      playFromTap(button.dataset.inkAudioMode);
    });
  });

  const deckButton = document.getElementById("soundBtn");
  if (deckButton) {
    deckButton.dataset.inkAudioMode = "c4";
    deckButton.removeAttribute("data-href");
    deckButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      playFromTap("c4");
    }, true);
  }

  window.InkspirationsAudioEngine = {
    play: playFromTap,
    stopAll: () => {
      stopAll(null);
      activeMode = null;
      report("All Inkspirations audio stopped.");
      syncButtons();
    },
    sources: SOURCES
  };

  getStatusPanel();
  syncButtons();
})();