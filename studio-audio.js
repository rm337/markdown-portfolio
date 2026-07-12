(() => {
  let buttons = [...document.querySelectorAll("[data-audio-toggle]")];
  if (!buttons.length) {
    const floating = document.createElement("button");
    floating.type = "button";
    floating.className = "rainstorm-toggle";
    floating.setAttribute("data-audio-toggle", "");
    floating.innerHTML = '<span aria-hidden="true">☂</span><span>Rainstorm Sound</span>';
    document.body.appendChild(floating);
    buttons = [floating];
  }

  let context;
  let rainSource;
  let rainGain;
  let rainFilter;
  let hissSource;
  let hissGain;
  let hissFilter;
  let rumble;
  let rumbleGain;
  let masterGain;
  let playing = false;

  function sync(message) {
    buttons.forEach(button => {
      const label = message || (playing ? "Rainstorm On" : "Rainstorm Sound");
      const text = button.querySelector("span:last-child");
      if (text) text.textContent = label;
      else button.textContent = label;
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Stop rainstorm sound" : "Play rainstorm sound");
    });
  }

  async function unlockAudio(audioContext) {
    if (audioContext.state === "suspended") await audioContext.resume();
    const buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    await new Promise(resolve => window.setTimeout(resolve, 30));
    if (audioContext.state !== "running") {
      await audioContext.resume();
    }
  }

  function noiseBuffer(audioContext, seconds = 4, brownNoise = false) {
    const buffer = audioContext.createBuffer(2, audioContext.sampleRate * seconds, audioContext.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      let brown = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        if (brownNoise) {
          brown = (brown + 0.02 * white) / 1.02;
          data[i] = Math.max(-1, Math.min(1, brown * 4));
        } else {
          data[i] = white * 0.55;
        }
      }
    }
    return buffer;
  }

  function stopNodes() {
    try { rainSource?.stop(); } catch (error) {}
    try { hissSource?.stop(); } catch (error) {}
    try { rumble?.stop(); } catch (error) {}
    try { masterGain?.disconnect(); } catch (error) {}
    rainSource = null;
    hissSource = null;
    rumble = null;
  }

  async function start() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error("Web Audio is not supported in this browser.");

    context = context || new AudioContextClass();
    await unlockAudio(context);
    if (context.state !== "running") throw new Error(`Audio context is ${context.state}.`);

    stopNodes();

    masterGain = context.createGain();
    masterGain.gain.setValueAtTime(0.0001, context.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.92, context.currentTime + 0.25);
    masterGain.connect(context.destination);

    rainSource = context.createBufferSource();
    rainSource.buffer = noiseBuffer(context, 4, true);
    rainSource.loop = true;
    rainFilter = context.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.value = 3200;
    rainFilter.Q.value = 0.3;
    rainGain = context.createGain();
    rainGain.gain.value = 0.72;
    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);

    hissSource = context.createBufferSource();
    hissSource.buffer = noiseBuffer(context, 3, false);
    hissSource.loop = true;
    hissFilter = context.createBiquadFilter();
    hissFilter.type = "bandpass";
    hissFilter.frequency.value = 2800;
    hissFilter.Q.value = 0.45;
    hissGain = context.createGain();
    hissGain.gain.value = 0.34;
    hissSource.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(masterGain);

    rumble = context.createOscillator();
    rumble.type = "sine";
    rumble.frequency.value = 72;
    rumbleGain = context.createGain();
    rumbleGain.gain.value = 0.025;
    rumble.connect(rumbleGain);
    rumbleGain.connect(masterGain);

    rainSource.start();
    hissSource.start();
    rumble.start();
    playing = true;
    sync();
  }

  function stop() {
    if (masterGain && context) {
      masterGain.gain.cancelScheduledValues(context.currentTime);
      masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), context.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
    }
    window.setTimeout(stopNodes, 240);
    playing = false;
    sync();
  }

  buttons.forEach(button => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        if (playing) stop();
        else await start();
      } catch (error) {
        playing = false;
        stopNodes();
        sync("Tap To Retry Sound");
        console.error("Rainstorm audio could not start", error);
      } finally {
        button.disabled = false;
      }
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !playing || !context) return;
    context.resume().catch(() => {});
  });

  sync();
})();