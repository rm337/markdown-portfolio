(() => {
  "use strict";
  if (window.InkspirationsAudioEngine) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const TRACKS = {
    studio: { title: "Blue Current", tempo: 92, wave: "sine", notes: [220,261.63,329.63,392,329.63,293.66,261.63,196] },
    calm: { title: "Memory Lanterns", tempo: 72, wave: "triangle", notes: [261.63,329.63,392,493.88,440,392,329.63,293.66] },
    c4: { title: "C4 Flight Signal", tempo: 124, wave: "sawtooth", notes: [261.63,311.13,392,466.16,392,311.13,523.25,466.16] }
  };
  const CONTROL_SELECTOR = "button[data-audio-mode], button[data-audio-toggle], button#soundBtn";
  let context, master, timer, activeMode = null, playing = false, step = 0;

  function ensureContext() {
    if (!AudioContextClass) throw new Error("This browser does not support audio playback.");
    if (context) return;
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = .13;
    master.connect(context.destination);
  }

  function note() {
    if (!playing || !context || !activeMode) return;
    const track = TRACKS[activeMode];
    const start = context.currentTime + .025;
    const duration = 60 / track.tempo * .78;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = track.wave;
    oscillator.frequency.setValueAtTime(track.notes[step % track.notes.length], start);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(.14, start + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain); gain.connect(master);
    oscillator.start(start); oscillator.stop(start + duration + .03);
    step += 1;
  }

  function syncControls() {
    document.querySelectorAll(CONTROL_SELECTOR).forEach((control) => {
      const mode = control.dataset.audioMode || "studio";
      const current = playing && activeMode === mode;
      if (!control.dataset.audioLabel) control.dataset.audioLabel = control.textContent.trim() || `Play ${TRACKS[mode]?.title || "Studio Music"}`;
      control.setAttribute("aria-pressed", String(current));
      control.classList.toggle("is-playing", current);
      control.textContent = current ? `Pause ${TRACKS[mode]?.title || "Studio Music"}` : control.dataset.audioLabel;
    });
    document.documentElement.dataset.audioPlaying = String(playing);
    const status = document.getElementById("soundStatus");
    if (status) status.textContent = playing ? `Playing ${TRACKS[activeMode].title}` : "Deck ready";
  }

  function pause() {
    if (timer) window.clearInterval(timer);
    timer = null; playing = false; syncControls();
  }

  async function play(mode = "studio") {
    const requested = TRACKS[mode] ? mode : "studio";
    try {
      ensureContext();
      if (playing && activeMode === requested) { pause(); return false; }
      if (context.state === "suspended") await context.resume();
      if (timer) window.clearInterval(timer);
      activeMode = requested; playing = true; step = 0; note();
      timer = window.setInterval(note, (60 / TRACKS[activeMode].tempo) * 500);
      syncControls(); return true;
    } catch { playing = false; syncControls(); return false; }
  }

  function bindControls() {
    document.querySelectorAll(CONTROL_SELECTOR).forEach((control) => {
      if (control.dataset.audioBound === "true") return;
      control.dataset.audioBound = "true";
      if (!control.dataset.audioMode) control.dataset.audioMode = control.id === "soundBtn" ? "c4" : "studio";
      control.addEventListener("click", (event) => { event.preventDefault(); play(control.dataset.audioMode); });
    });
    syncControls();
  }

  window.InkspirationsAudioEngine = { play, pause, stopAll: pause, refresh: bindControls, tracks: TRACKS, getState: () => ({ playing, mode: activeMode, contextState: context?.state || "uninitialized" }) };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindControls, { once: true }); else bindControls();
})();
