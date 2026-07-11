(() => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "studio-music-toggle";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", "Play optional studio music");
  button.innerHTML = '<span aria-hidden="true">♫</span><span>Studio Music</span>';
  document.body.appendChild(button);

  let context;
  let master;
  let compressor;
  let timer;
  let playing = false;
  let step = 0;
  const active = new Set();
  const tempo = 112;
  const beat = 60 / tempo;
  const scale = [110, 130.81, 146.83, 164.81, 196, 220, 261.63];

  function track(node) {
    active.add(node);
    node.addEventListener?.("ended", () => active.delete(node));
    return node;
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
    oscillator.frequency.setValueAtTime(145, when);
    oscillator.frequency.exponentialRampToValueAtTime(48, when + 0.16);
    gain.gain.setValueAtTime(0.7, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(when);
    oscillator.stop(when + 0.24);
  }

  function hat(when, volume = 0.08) {
    const length = Math.floor(context.sampleRate * 0.06);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = track(context.createBufferSource());
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 6500;
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.055);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(when);
  }

  function scheduleBar() {
    if (!playing) return;
    const start = context.currentTime + 0.05;
    const root = scale[(step / 16) % scale.length | 0];
    const pattern = [0, 2, 4, 2, 5, 4, 2, 1];

    for (let i = 0; i < 16; i += 1) {
      const when = start + i * beat / 4;
      if (i % 4 === 0) kick(when);
      hat(when, i % 4 === 2 ? 0.11 : 0.055);
      if (i % 4 === 0) tone(root / 2, when, beat * 0.75, 0.16, "sawtooth", 520);
      if (i % 2 === 0) {
        const note = scale[(pattern[(i / 2) % pattern.length] + step / 16) % scale.length | 0] * 2;
        tone(note, when, beat * 0.42, 0.055, "triangle", 2400);
      }
    }

    tone(root, start, beat * 3.8, 0.055, "sine", 1200);
    tone(root * 1.5, start, beat * 3.8, 0.035, "sine", 1400);
    tone(root * 2, start, beat * 3.8, 0.025, "triangle", 1700);
    step = (step + 16) % 112;
  }

  async function start() {
    context = context || new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") await context.resume();

    master = master || context.createGain();
    compressor = compressor || context.createDynamicsCompressor();
    try { master.disconnect(); } catch (error) {}
    try { compressor.disconnect(); } catch (error) {}
    master.gain.setValueAtTime(0.52, context.currentTime);
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.2;
    master.connect(compressor);
    compressor.connect(context.destination);

    playing = true;
    step = 0;
    scheduleBar();
    timer = window.setInterval(scheduleBar, beat * 4 * 1000);
    button.classList.add("is-playing");
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Stop studio music");
    button.querySelector("span:last-child").textContent = "Music On";
    localStorage.setItem("inkspirationsMusicPreference", "on");
  }

  function stop() {
    playing = false;
    window.clearInterval(timer);
    active.forEach(node => { try { node.stop?.(); } catch (error) {} });
    active.clear();
    try { master?.disconnect(); } catch (error) {}
    try { compressor?.disconnect(); } catch (error) {}
    button.classList.remove("is-playing");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Play optional studio music");
    button.querySelector("span:last-child").textContent = "Studio Music";
    localStorage.setItem("inkspirationsMusicPreference", "off");
  }

  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      if (playing) stop();
      else await start();
    } catch (error) {
      playing = false;
      button.querySelector("span:last-child").textContent = "Try Music Again";
      console.error("Studio music could not start", error);
    } finally {
      button.disabled = false;
    }
  });

  if (localStorage.getItem("inkspirationsMusicPreference") === "on") {
    button.title = "Press to resume your studio music";
    button.querySelector("span:last-child").textContent = "Resume Music";
  }
})();