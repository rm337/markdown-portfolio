(() => {
  function bindWhenReady() {
    const engine = window.InkspirationsAudioEngine;
    if (!engine) {
      window.setTimeout(bindWhenReady, 40);
      return;
    }

    let studioButton = document.querySelector('[data-ink-audio-mode="studio"]');
    if (!studioButton) {
      studioButton = document.createElement('button');
      studioButton.type = 'button';
      studioButton.className = 'studio-music-toggle';
      studioButton.dataset.inkAudioMode = 'studio';
      studioButton.setAttribute('aria-pressed', 'false');
      studioButton.innerHTML = '<span aria-hidden="true">♫</span><span>Studio Music</span>';
      document.body.appendChild(studioButton);
      studioButton.addEventListener('click', event => {
        event.preventDefault();
        engine.play('studio');
      });
    }

    const deckButton = document.getElementById('soundBtn');
    if (deckButton && !deckButton.dataset.inkAudioBound) {
      deckButton.dataset.inkAudioBound = 'true';
      deckButton.dataset.inkAudioMode = 'c4';
      deckButton.removeAttribute('data-href');
      deckButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        engine.play('c4');
      }, true);
    }
  }

  bindWhenReady();
})();
