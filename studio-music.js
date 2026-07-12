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
  const tempo = 128;
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
    button.querySelector("span:last-child").textContent = playing ? "C4 On" : "Studio Music";

    if (deckButton) {
      deckButton.disabled = false;
      deckButton.textContent = playing ? "Stop C4 Mix" : "Play C4 Mix";
      deckButton.setAttribute("aria-pressed", String(playing));
      deckButton.setAttribute("aria-label", playing ? "Stop C4 music" : "Play C4 music");
    }
    if (deckStatus) deckStatus.textContent = playing ? "C4 mix live" : "Ready to play";
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
    filter.Q.value = 0.7;

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + 0.02);
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

  function kick(when, volume = 0.9) {
    const body = track(context.createOscillator());
    const click = track(context.createOscillator());
    const bodyGain = context.createGain();
    const clickGain = context.createGain();

    body.type = "sine";
    body.frequency.setValueAtTime(170, when);
    body.frequency.exponentialRampToValueAtTime(45, when + 0.18);
    bodyGain.gain.setValueAtTime(volume, when);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.34);

    click.type = "triangle";
    click.frequency.setValueAtTime(1050, when);
    click.frequency.exponentialRampToValueAtTime(180, when + 0.03);
    clickGain.gain.setValueAtTime(0.17, when);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);

    body.connect(bodyGain);
    click.connect(clickGain);
    bodyGain.connect(master);
    clickGain.connect(master);
    body.start(when);
    click.start(when);
    body.stop(when + 0.36);
    click.stop(when + 0.06);
  }

  function noiseHit(when, duration = 0.11, volume = 0.08, cutoff = 7200) {
    const length = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = track(context.createBufferSource());
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(when);
  }

  function bassPulse(root, when, duration, volume = 0.25) {
    filteredTone(root / 2, when, duration, volume, "sawtooth", 240, 0.08);
    filteredTone(root, when, duration * 0.9, volume * 0.46, "square", 320, 0.05);
  }

  function scheduleBar() {
    if (!playing) return;
    const start = context.currentTime + 0.06;
    const root = roots[bar % roots.length];

    for (let i = 0; i < 16; i += 1) {
      const when = start + i * beat / 4;
      if (i % 4 === 0) kick(when, i === 0 ? 0.98 : 0.82);
      if (i % 2 === 0) noiseHit(when, 0.055, i % 4 === 2 ? 0.07 : 0.04, 7000);
      if (i === 4 || i === 12) noiseHit(when, 0.16, 0.16, 1500);
      if (i === 0 || i === 3 || i === 8 || i === 11) bassPulse(root, when, beat * 0.55, i === 0 ? 0.34 : 0.27);
    }

    filteredTone(root, start, beat * 3.9, 0.12, "sine", 360, 0.16);
    filteredTone(root * 1.5, start + beat * 0.5, beat * 3.1, 0.05, "sawtooth", 820, 0.3);

    if (bar % 2 === 1) {
      filteredTone(root * 2, start + beat * 2.5, beat * 0.45, 0.055, "square", 1200, 0.28);
      filteredTone(root * 2.25, start + beat * 3.0, beat * 0.35, 0.045, "square", 1500, 0.32);
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

    master.gain.setValueAtTime(0.78, context.currentTime);
    compressor.threshold.value = -28;
    compressor.knee.value = 8;
    compressor.ratio.value = 10;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.14;
    delay.delayTime.value = beat * 0.75;
    delayFeedback.gain.value = 0.2;

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
    syncControls("C4 is live: harder kick, deeper bass, faster pulse, and full Flight Deck pressure.");
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
    syncControls("C4 mix stopped. Press play to bring the pressure back.");
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
    button.querySelector("span:last-child").textContent = "Resume C4";
  }
  syncControls("Press Play C4 Mix to begin the Flight Deck music.");
})();