(() => {
  "use strict";

  if (window.InkspirationsAudioEngine) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const TRACKS = {
    studio: {
      title: "Blue Current",
      tempo: 92,
      wave: "sine",
      notes: [220, 261.63, 329.63, 392, 329.63, 293.66, 261.63, 196],
      bass: [110, 110, 98, 98, 130.81, 130.81, 98, 98]
    },
    calm: {
      title: "Memory Lanterns",
      tempo: 72,
      wave: "triangle",
      notes: [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66],
      bass: [130.81, 130.81, 146.83, 146.83, 110, 110, 98, 98]
    },
    c4: {
      title: "C4 Flight Signal",
      tempo: 124,
      wave: "sawtooth",
      notes: [261.63, 311.13, 392, 466.16, 392, 311.13, 523.25, 466.16],
      bass: [65.41, 65.41, 77.78, 77.78, 98, 98, 87.31, 87.31]
    }
  };

  let context = null;
  let master = null;
  let timer = null;
  let step = 0;
  let activeMode = null;
  let playing = false;
  const CONTROL_SELECTOR = "button[data-audio-mode], button[data-audio-toggle], button#soundBtn";

  function statusPanel() {
    let panel = document.getElementById("inkspirations-audio-status");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "inkspirations-audio-status";
    panel.className = "ink-audio-status";
    panel.setAttribute("role", "status");
    panel.setAttribute("aria-live", "polite");
    panel.hidden = true;
    document.body.appendChild(panel);
    return panel;
  }

  function report(message, isError = false) {
    const panel = statusPanel();
    panel.hidden = false;
    panel.textContent = message;
    panel.classList.toggle("is-error", isError);
  }

  function ensureContext() {
    if (!AudioContextClass) throw new Error("This browser does not support Web Audio playback.");
    if (context) return context;
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = 0.16;
    master.connect(context.destination);
    return context;
  }

  function voice(frequency, start, duration, type, volume) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function kick(start, volume) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(118, start);
    oscillator.frequency.exponentialRampToValueAtTime(48, start + 0.16);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + 0.2);
  }

  function scheduleStep() {
    if (!playing || !context || !activeMode) return;
    const track = TRACKS[activeMode];
    const beat = 60 / track.tempo;
    const now = context.currentTime + 0.025;
    const noteIndex = step % track.notes.length;
    const melodicVolume = activeMode === "c4" ? 0.12 : 0.17;
    voice(track.notes[noteIndex], now, beat * 0.82, track.wave, melodicVolume);
    voice(track.bass[noteIndex], now, beat * 1.55, "sine", activeMode === "c4" ? 0.2 : 0.14);
    if (step % 2 === 0 || activeMode === "c4") kick(now, activeMode === "c4" ? 0.24 : 0.1);
    step += 1;
  }

  function syncControls() {
    document.querySelectorAll(CONTROL_SELECTOR).forEach((control) => {
      const mode = control.dataset.audioMode || "studio";
      const track = TRACKS[mode] || TRACKS.studio;
      const isCurrent = playing && activeMode === mode;
      if (!control.dataset.audioLabel) control.dataset.audioLabel = control.textContent.trim() || `Play ${track.title}`;
      control.setAttribute("aria-pressed", String(isCurrent));
      control.classList.toggle("is-playing", isCurrent);
      control.textContent = isCurrent ? `Pause ${track.title}` : control.dataset.audioLabel;
    });
    document.documentElement.dataset.audioPlaying = String(playing);
    document.documentElement.dataset.audioMode = activeMode || "";
    const soundStatus = document.getElementById("soundStatus");
    if (soundStatus) {
      soundStatus.textContent = playing && activeMode ? `Playing ${TRACKS[activeMode].title}` : "Deck ready";
    }
  }

  async function play(mode = "studio") {
    const requestedMode = TRACKS[mode] ? mode : "studio";
    try {
      ensureContext();
      if (playing && activeMode === requestedMode) {
        pause();
        return false;
      }
      if (context.state === "suspended") await context.resume();
      if (timer) window.clearInterval(timer);
      activeMode = requestedMode;
      playing = true;
      step = 0;
      scheduleStep();
      const interval = (60 / TRACKS[activeMode].tempo) * 500;
      timer = window.setInterval(scheduleStep, interval);
      report(`Now playing: ${TRACKS[activeMode].title}. Original Inkspirations browser session.`);
      syncControls();
      return true;
    } catch (error) {
      playing = false;
      report(`Music could not start: ${error.message}`, true);
      syncControls();
      return false;
    }
  }

  function pause() {
    if (timer) window.clearInterval(timer);
    timer = null;
    playing = false;
    const title = activeMode ? TRACKS[activeMode].title : "Studio music";
    report(`${title} paused.`);
    syncControls();
  }

  function bindControls() {
    const controls = document.querySelectorAll(CONTROL_SELECTOR);
    controls.forEach((control) => {
      if (control.dataset.audioBound === "true") return;
      control.dataset.audioBound = "true";
      if (!control.dataset.audioMode) control.dataset.audioMode = control.id === "soundBtn" ? "c4" : "studio";
      control.addEventListener("click", (event) => {
        event.preventDefault();
        play(control.dataset.audioMode);
      });
    });

    if (!controls.length && !document.querySelector(".studio-music-toggle")) {
      const floating = document.createElement("button");
      floating.type = "button";
      floating.className = "studio-music-toggle";
      floating.dataset.audioMode = document.body.dataset.roomId === "flight-deck" ? "c4" : "studio";
      floating.dataset.audioLabel = "Play Studio Music";
      floating.textContent = "Play Studio Music";
      floating.setAttribute("aria-pressed", "false");
      document.body.appendChild(floating);
      bindControls();
    }
    syncControls();
  }

  window.InkspirationsAudioEngine = {
    play,
    pause,
    stopAll: pause,
    refresh: bindControls,
    tracks: TRACKS,
    getState: () => ({ playing, mode: activeMode, contextState: context?.state || "uninitialized" })
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindControls, { once: true });
  else bindControls();
})();
