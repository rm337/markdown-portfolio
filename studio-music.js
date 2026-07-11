(() => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "studio-music-toggle";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", "Play optional studio music");
  button.innerHTML = '<span aria-hidden="true">♫</span><span>Studio Music</span>';
  document.body.appendChild(button);

  const deckButton = document.getElementById("soundBtn");
  const deckStatus = document.getElementById("soundStatus");
  const deckTrackStatus = document.getElementById("trackStatus");

  let context;
  let master;
  let compressor;
  let timer;
  let playing = false;
  let step = 0;
  const active = new Set();
  const tempo = 118;
  const beat = 60 / tempo;
  const scale = [110, 130.81, 146.83, 164.81, 196, 220, 261.63];

  function track(node) {
    active.add(node);
    node.addEventListener?.("ended", () => active.delete(node));
    return node;
  }

  function syncControls(message) {
    button.classList.toggle("is-playing", playing);
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute("aria-label", playing ? "Stop studio music" : "Play optional studio music");
    button.querySelector("span:last-child").textContent = playing ? "Music On" : "Studio Music";

    if (deckButton) {
      deckButton.disabled = false;
      deckButton.textContent = playing ? "Stop Flight Deck Mix" : "Play Flight Deck Mix";
      deckButton.setAttribute("aria-pressed", String(playing));
      deckButton.setAttribute("aria-label", playing ? "Stop Flight Deck music" : "Play Flight Deck music");
    }
    if (deckStatus) deckStatus.textContent = playing ? "Live mix playing" : "Ready to play";
    if (deckTrackStatus && message) deckTrackStatus.textContent = message;
    document.body.classList.toggle("deck-playing", playing);
  }

  function tone(frequency, when, duration, volume, type = "sine", cutoff = 1800) {
    const oscillator = track(context.createOscillator());
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, when);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.03);
  }

  function kick(when) {
    const oscillator = track(context.createOscillator());
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(155, when);
    oscillator.frequency.exponentialRampToValueAtTime(46, when + 0.18);
    gain.gain.setValueAtTime(0.9, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.24);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(when);
    oscillator.stop(when + 0.26);
  }

  function hat(when, volume = 0.1) {
    const length = Math.floor(context.sampleRate * 0.07);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = track(context.createBufferSource());
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 6200;
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.065);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(when);
  }

  function clap(when) {
    for (let offset = 0; offset < 3; offset += 1) {
      const length = Math.floor(context.sampleRate * 0.045);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = track(context.createBufferSource());
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = 1500;
      gain.gain.setValueAtTime(0.18, when + offset * 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.12 + offset * 0.018);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(when + offset * 0.018);
    }
  }

  function scheduleBar() {
    if (!playing) return;
    const start = context.currentTime + 0.05;
    const root = scale[(step / 16) % scale.length | 0];
    const pattern = [0, 2, 4, 2, 5, 4, 2, 1];

    for (let i = 0; i < 16; i += 1) {
      const when = start + i * beat / 4;
      if (i % 4 === 0) kick(when);
      if (i === 4 || i === 12) clap(when);
      hat(when, i % 4 === 2 ? 0.15 : 0.075);
      if (i % 4 === 0) tone(root / 2, when, beat * 0.8, 0.22, "sawtooth", 560);
      if (i % 2 === 0) {
        const note = scale[(pattern[(i / 2) % pattern.length] + step / 16) % scale.length | 0] * 2;
        tone(note, when, beat * 0.44, 0.075, "triangle", 2600);
      }
    }

    tone(root, start, beat * 3.8, 0.075, "sine", 1300);
    tone(root * 1.5, start, beat * 3.8, 0.05, "sine", 1500);
    tone(root * 2, start, beat * 3.8, 0.035, "triangle", 1900);
    step = (step + 16) % 112;
  }

  async function start() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser");
    context = context || new AudioContextClass();
    if (context.state === "suspended") await context.resume();

    master = master || context.createGain();
    compressor = compressor || context.createDynamicsCompressor();
    try { master.disconnect(); } catch (error) {}
    try { compressor.disconnect(); } catch (error) {}
    master.gain.setValueAtTime(0.78, context.currentTime);
    compressor.threshold.value = -20;
    compressor.knee.value = 16;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.18;
    master.connect(compressor);
    compressor.connect(context.destination);

    playing = true;
    step = 0;
    scheduleBar();
    timer = window.setInterval(scheduleBar, beat * 4 * 1000);
    localStorage.setItem("inkspirationsMusicPreference", "on");
    syncControls("Flight Deck mix is now playing. Use the main button or the floating music button to stop it.");
  }

  function stop() {
    playing = false;
    window.clearInterval(timer);
    active.forEach(node => { try { node.stop?.(); } catch (error) {} });
    active.clear();
    try { master?.disconnect(); } catch (error) {}
    try { compressor?.disconnect(); } catch (error) {}
    localStorage.setItem("inkspirationsMusicPreference", "off");
    syncControls("Flight Deck mix stopped. Press Play Flight Deck Mix to start it again.");
  }

  async function toggle() {
    button.disabled = true;
    if (deckButton) deckButton.disabled = true;
    try {
      if (playing) stop();
      else await start();
    } catch (error) {
      playing = false;
      syncControls("Music could not start. Check that this browser tab is not muted, then press the button again.");
      button.querySelector("span:last-child").textContent = "Try Music Again";
      console.error("Studio music could not start", error);
    } finally {
      button.disabled = false;
      if (deckButton) deckButton.disabled = false;
    }
  }

  button.addEventListener("click", toggle);
  if (deckButton) {
    deckButton.disabled = false;
    deckButton.removeAttribute("data-href");
    deckButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggle();
    }, true);
  }

  document.querySelectorAll("[data-track]").forEach(trackButton => {
    trackButton.addEventListener("dblclick", () => {
      if (!playing) toggle();
    });
  });

  if (localStorage.getItem("inkspirationsMusicPreference") === "on") {
    button.title = "Press to resume your studio music";
    button.querySelector("span:last-child").textContent = "Resume Music";
  }
  syncControls("Press Play Flight Deck Mix to begin the local studio music.");
})();