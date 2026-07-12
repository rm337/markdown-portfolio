(() => {
  if (window.InkspirationsAudioEngine) return;

  const TRACK = {
    title: "Inkspirations Mobile Track",
    volume: 0.92,
    sampleRate: 8000,
    seconds: 2
  };

  function writeText(view, offset, text) {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  }

  function makeTrackDataUri() {
    const sampleCount = TRACK.sampleRate * TRACK.seconds;
    const buffer = new ArrayBuffer(44 + sampleCount * 2);
    const view = new DataView(buffer);
    writeText(view, 0, "RIFF");
    view.setUint32(4, 36 + sampleCount * 2, true);
    writeText(view, 8, "WAVE");
    writeText(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, TRACK.sampleRate, true);
    view.setUint32(28, TRACK.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(view, 36, "data");
    view.setUint32(40, sampleCount * 2, true);

    const notes = [220, 261.63, 329.63, 392];
    for (let i = 0; i < sampleCount; i += 1) {
      const t = i / TRACK.sampleRate;
      const note = notes[Math.floor(t / 0.5) % notes.length];
      const fade = Math.min(1, t / 0.08, (TRACK.seconds - t) / 0.12);
      const beat = t % 0.5;
      const melody = Math.sin(2 * Math.PI * note * t) + 0.45 * Math.sin(2 * Math.PI * note * 1.5 * t);
      const bass = 0.4 * Math.sin(2 * Math.PI * 110 * t);
      const kick = beat < 0.18 ? Math.sin(2 * Math.PI * (90 - 45 * Math.min(beat / 0.12, 1)) * t) * Math.exp(-beat * 25) : 0;
      const sample = Math.max(-1, Math.min(1, (0.34 * melody + 0.18 * bass + 0.28 * kick) * fade));
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return `data:audio/wav;base64,${btoa(binary)}`;
  }

  let audio = null;
  let playing = false;

  function statusPanel() {
    let panel = document.getElementById("inkspirations-audio-status");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "inkspirations-audio-status";
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");
    panel.style.cssText = "position:fixed;left:1rem;bottom:1rem;z-index:10002;max-width:min(360px,calc(100vw - 2rem));padding:.75rem 1rem;border:1px solid rgba(86,217,255,.55);border-radius:12px;background:rgba(1,7,15,.96);color:#f5fbff;font:700 .82rem/1.4 Inter,Arial,sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.4)";
    document.body.appendChild(panel);
    return panel;
  }

  function report(message, error = false) {
    const panel = statusPanel();
    panel.textContent = message;
    panel.style.borderColor = error ? "#ff6e6e" : "rgba(86,217,255,.55)";
    (error ? console.error : console.info)("[Inkspirations Audio]", message);
  }

  function getAudio() {
    if (audio) return audio;
    audio = document.createElement("audio");
    audio.preload = "auto";
    audio.loop = true;
    audio.muted = false;
    audio.volume = TRACK.volume;
    audio.src = makeTrackDataUri();
    audio.setAttribute("playsinline", "");
    audio.addEventListener("playing", () => {
      playing = true;
      report(`Now playing: ${TRACK.title}`);
      syncControls();
    });
    audio.addEventListener("pause", () => {
      playing = false;
      syncControls();
    });
    audio.addEventListener("waiting", () => report(`Loading: ${TRACK.title}…`));
    audio.addEventListener("error", () => {
      playing = false;
      report(`Audio failed. Error code: ${audio.error?.code || "unknown"}`, true);
      syncControls();
    });
    document.body.appendChild(audio);
    return audio;
  }

  function syncControls() {
    document.querySelectorAll("[data-ink-audio-mode], .studio-music-toggle").forEach(button => {
      const label = button.querySelector("span:last-child");
      const text = playing ? "Pause Studio Music" : "Studio Music";
      if (label) label.textContent = text;
      else button.textContent = text;
      button.setAttribute("aria-pressed", String(playing));
      button.disabled = false;
    });
    const soundStatus = document.getElementById("soundStatus");
    if (soundStatus) soundStatus.textContent = playing ? `Playing ${TRACK.title}` : "Audio ready";
    const trackStatus = document.getElementById("trackStatus");
    if (trackStatus) trackStatus.textContent = playing ? `Now playing: ${TRACK.title}` : "Tap Studio Music to begin.";
  }

  function toggleFromTap(event) {
    event?.preventDefault();
    const player = getAudio();
    player.muted = false;
    player.volume = TRACK.volume;

    if (!player.paused) {
      player.pause();
      player.currentTime = 0;
      report(`${TRACK.title} paused.`);
      return;
    }

    const playPromise = player.play();
    report(`Starting: ${TRACK.title}…`);
    if (playPromise?.catch) {
      playPromise.catch(error => {
        playing = false;
        report(`Playback failed: ${error.name || "Error"} ${error.message || ""}`.trim(), true);
        syncControls();
      });
    }
  }

  let studioButton = document.querySelector(".studio-music-toggle");
  if (!studioButton) {
    studioButton = document.createElement("button");
    studioButton.type = "button";
    studioButton.className = "studio-music-toggle";
    studioButton.innerHTML = '<span aria-hidden="true">♫</span><span>Studio Music</span>';
    document.body.appendChild(studioButton);
  }
  studioButton.dataset.inkAudioMode = "studio";
  studioButton.setAttribute("aria-pressed", "false");
  studioButton.addEventListener("click", toggleFromTap);

  const deckButton = document.getElementById("soundBtn");
  if (deckButton) {
    deckButton.dataset.inkAudioMode = "studio";
    deckButton.addEventListener("click", toggleFromTap, true);
  }

  window.InkspirationsAudioEngine = {
    play: toggleFromTap,
    stopAll() {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      report("Audio stopped.");
      syncControls();
    },
    track: TRACK
  };

  report("Audio ready. Tap Studio Music to begin.");
  syncControls();
})();