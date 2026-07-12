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
  let delay;
  let delayFeedback;
  let timer;
  let playing = false;
  let bar = 0;
  const active = new Set();
  const tempo = 104;
  const beat = 60 / tempo;
  const roots = [55, 49, 65.41, 43.65];

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

  function filteredTone(frequency, when, duration, volume, type = "sine", cutoff = 900, send = 0.18) {
    const oscillator = track(context.createOscillator());
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const sendGain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, when);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, when);
    filter.Q.value = 0.45;

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    sendGain.gain.value = send;
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    gain.connect(sendGain);
    sendGain.connect(delay);

    oscillator.start(when);
    oscillator.stop(when + duration + 0.08);
  }

  function kick(when, volume = 0.55) {
    const oscillator = track(context.createOscillator());
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(105, when);
    oscillator.frequency.exponentialRampToValueAtTime(44, when + 0.22);
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.3);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(when);
    oscillator.stop(when + 0.34);
  }

  function softNoise(when, duration = 0.16, volume = 0.035, cutoff = 5200) {
    const length = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = track(context.createBufferSource());
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(when);
  }

  function scheduleBar() {
    if (!playing) return;
    const start = context.currentTime + 0.06;
    const root = roots[bar % roots.length];

    for (let i = 0; i < 16; i += 1) {
      const when = start + i * beat / 4;
      if (i % 4 === 0) kick(when, i === 0 ? 0.62 : 0.48);
      if (i === 6 || i === 14) softNoise(when, 0.11, 0.028, 4200);
      if (i === 10) softNoise(when, 0.22, 0.02, 2800);
    }

    filteredTone(root, start, beat * 3.85, 0.16, "sine", 420, 0.22);
    filteredTone(root * 1.5, start + beat * 0.5, beat * 3.25, 0.045, "sine", 760, 0.34);
    filteredTone(root * 2, start + beat * 1.25, beat * 2.1, 0.026, "triangle", 980, 0.42);

    if (bar % 2 === 1) {
      filteredTone(root * 2.25, start + beat * 2.5, beat * 0.75, 0.018, "sine", 1200, 0.5);
    }

    bar += 1;
  }

  async function start() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser");
    context = context || new AudioContextClass();
    if (context.state === "suspended") await context.resume();

    master = master || context.createGain();
    compressor = compressor || context.createDynamicsCompressor();
    delay = delay || context.createDelay(1.5);
    delayFeedback = delayFeedback || context.createGain();

    try { master.disconnect(); } catch (error) {}
    try { compressor.disconnect(); } catch (error) {}
    try { delay.disconnect(); } catch (error) {}
    try { delayFeedback.disconnect(); } catch (error) {}

    master.gain.setValueAtTime(0.58, context.currentTime);
    compressor.threshold.value = -24;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.28;
    delay.delayTime.value = beat * 0.75;
    delayFeedback.gain.value = 0.26;

    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delay.connect(master);
    master.connect(compressor);
    compressor.connect(context.destination);

    playing = true;
    bar = 0;
    scheduleBar();
    timer = window.setInterval(scheduleBar, beat * 4 * 1000);
    localStorage.setItem("inkspirationsMusicPreference", "on");
    syncControls("Cinematic studio mix is playing. Deep pulse, atmosphere, and no arcade tones.");
  }

  function stop() {
    playing = false;
    window.clearInterval(timer);
    active.forEach(node => { try { node.stop?.(); } catch (error) {} });
    active.clear();
    try { master?.disconnect(); } catch (error) {}
    try { compressor?.disconnect(); } catch (error) {}
    try { delay?.disconnect(); } catch (error) {}
    try { delayFeedback?.disconnect(); } catch (error) {}
    localStorage.setItem("inkspirationsMusicPreference", "off");
    syncControls("Studio mix stopped. Press play to begin again.");
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
  syncControls("Press Play Flight Deck Mix to begin the cinematic studio music.");
})();