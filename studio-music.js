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
  let timer;
  let playing = false;
  const active = new Set();
  const notes = [110, 130.81, 146.83, 164.81, 196, 220, 261.63];

  function voice(frequency, delay, duration, volume) {
    const now = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.detune.setValueAtTime((Math.random() - .5) * 7, now);
    filter.type = "lowpass";
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 2.5);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    oscillator.start(now);
    oscillator.stop(now + duration + .1);
    active.add(oscillator);
    oscillator.addEventListener("ended", () => active.delete(oscillator));
  }

  function phrase() {
    if (!playing) return;
    const root = notes[Math.floor(Math.random() * notes.length)];
    voice(root, 0, 11, .07);
    voice(root * 1.5, 1.5, 9, .035);
    voice(root * 2, 4, 7, .022);
  }

  async function start() {
    context = context || new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") await context.resume();
    master = master || context.createGain();
    master.disconnect();
    master.gain.value = .22;
    master.connect(context.destination);
    playing = true;
    phrase();
    timer = window.setInterval(phrase, 8500);
    button.classList.add("is-playing");
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Stop studio music");
    button.querySelector("span:last-child").textContent = "Music On";
    localStorage.setItem("inkspirationsMusicPreference", "on");
  }

  function stop() {
    playing = false;
    window.clearInterval(timer);
    active.forEach(node => { try { node.stop(); } catch (error) {} });
    active.clear();
    if (master) master.disconnect();
    button.classList.remove("is-playing");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Play optional studio music");
    button.querySelector("span:last-child").textContent = "Studio Music";
    localStorage.setItem("inkspirationsMusicPreference", "off");
  }

  button.addEventListener("click", () => playing ? stop() : start());

  if (localStorage.getItem("inkspirationsMusicPreference") === "on") {
    button.title = "Press to resume your studio music";
    button.querySelector("span:last-child").textContent = "Resume Music";
  }
})();