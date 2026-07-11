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
  let filter;
  let rumble;
  let rumbleGain;
  let playing = false;

  function sync() {
    buttons.forEach(button => {
      button.textContent = playing ? "Rainstorm On" : "Rainstorm Sound";
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Stop rainstorm sound" : "Play rainstorm sound");
    });
  }

  function noiseBuffer(audioContext) {
    const seconds = 5;
    const buffer = audioContext.createBuffer(2, audioContext.sampleRate * seconds, audioContext.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const data = buffer.getChannelData(channel);
      let brown = 0;
      for (let i = 0; i < data.length; i += 1) {
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.018 * white) / 1.018;
        data[i] = brown * 3.2;
      }
    }
    return buffer;
  }

  async function start() {
    context = context || new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") await context.resume();

    rainSource = context.createBufferSource();
    rainSource.buffer = noiseBuffer(context);
    rainSource.loop = true;

    filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3200;
    filter.Q.value = .4;

    rainGain = context.createGain();
    rainGain.gain.setValueAtTime(.0001, context.currentTime);
    rainGain.gain.exponentialRampToValueAtTime(.22, context.currentTime + .8);

    rumble = context.createOscillator();
    rumble.type = "sine";
    rumble.frequency.value = 48;
    rumbleGain = context.createGain();
    rumbleGain.gain.value = .018;

    rainSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(context.destination);
    rumble.connect(rumbleGain);
    rumbleGain.connect(context.destination);

    rainSource.start();
    rumble.start();
    playing = true;
    sync();
  }

  function stop() {
    if (rainGain && context) {
      rainGain.gain.cancelScheduledValues(context.currentTime);
      rainGain.gain.setValueAtTime(Math.max(rainGain.gain.value, .0001), context.currentTime);
      rainGain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .25);
    }
    window.setTimeout(() => {
      try { rainSource?.stop(); } catch (error) {}
      try { rumble?.stop(); } catch (error) {}
      rainSource = null;
      rumble = null;
    }, 300);
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
        sync();
        button.textContent = "Try Rain Again";
        console.error("Rainstorm audio could not start", error);
      } finally {
        button.disabled = false;
      }
    });
  });

  sync();
})();