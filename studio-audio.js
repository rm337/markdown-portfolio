(() => {
  const buttons = [...document.querySelectorAll("[data-audio-toggle]")];
  if (!buttons.length) return;

  const media = document.createElement("video");
  media.src = "assets/audio/rain-studio.mov";
  media.loop = true;
  media.preload = "auto";
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
  console.log("Rainstorm audio source ready", media.src);

  let playing = false;
  let rainContext;
  let rainSource;
  let rainGain;
  let rainRumble;
  let rainRumbleGain;

  function sync(label) {
    buttons.forEach((button) => {
      button.textContent = label || (playing ? "Rainstorm On" : "Rainstorm Sound");
      button.setAttribute("aria-pressed", String(playing));
    });
  }

  function makeNoiseBuffer(context) {
    const seconds = 3;
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.025 * white) / 1.025;
      data[i] = last * 3.4;
    }
    return buffer;
  }

  function stopFallbackRain() {
    if (rainSource) {
      try { rainSource.stop(); } catch (error) {}
      rainSource.disconnect();
      rainSource = null;
    }
    if (rainRumble) {
      try { rainRumble.stop(); } catch (error) {}
      rainRumble.disconnect();
      rainRumble = null;
    }
    if (rainGain) {
      rainGain.disconnect();
      rainGain = null;
    }
    if (rainRumbleGain) {
      rainRumbleGain.disconnect();
      rainRumbleGain = null;
    }
  }

  async function startFallbackRain() {
    rainContext = rainContext || new (window.AudioContext || window.webkitAudioContext)();
    if (rainContext.state === "suspended") await rainContext.resume();
    stopFallbackRain();

    const filter = rainContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1850;
    filter.Q.value = 0.55;

    rainGain = rainContext.createGain();
    rainGain.gain.setValueAtTime(0.0001, rainContext.currentTime);
    rainGain.gain.exponentialRampToValueAtTime(0.085, rainContext.currentTime + 1.4);

    rainSource = rainContext.createBufferSource();
    rainSource.buffer = makeNoiseBuffer(rainContext);
    rainSource.loop = true;
    rainSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(rainContext.destination);
    rainSource.start();

    rainRumble = rainContext.createOscillator();
    rainRumble.type = "sine";
    rainRumble.frequency.value = 54;
    rainRumbleGain = rainContext.createGain();
    rainRumbleGain.gain.value = 0.012;
    rainRumble.connect(rainRumbleGain);
    rainRumbleGain.connect(rainContext.destination);
    rainRumble.start();

    console.log("Rainstorm fallback audio playing", { state: rainContext.state });
  }

  async function startRainstorm() {
    sync("Audio Starting...");
    console.log("Rainstorm audio starting");
    try {
      await Promise.race([
        media.play(),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error("Rainstorm video audio timed out")), 900);
        })
      ]);
      console.log("Rainstorm video audio playing", { paused: media.paused, readyState: media.readyState });
    } catch (error) {
      media.pause();
      console.warn("Rainstorm video audio unavailable; starting fallback rain", error);
      await startFallbackRain();
    }
    playing = true;
    sync("Rainstorm On");
  }

  function stopRainstorm() {
    media.pause();
    stopFallbackRain();
    playing = false;
    sync("Rainstorm Sound");
    console.log("Rainstorm audio stopped");
  }

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", async () => {
      try {
        if (playing) {
          stopRainstorm();
          return;
        }
        await startRainstorm();
      } catch (error) {
        playing = false;
        sync("Audio Error");
        console.error("Rainstorm audio error", error);
      }
    });
  });
})();
