(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('[data-motion-toggle]');
  const speakButton = document.querySelector('[data-motion-speak]');
  const motionStatus = document.querySelector('[data-motion-status]');
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  let forcedMotion = false;
  let paused = false;

  const syncMotion = () => {
    const active = !paused && (!motionPreference.matches || forcedMotion);
    document.documentElement.classList.toggle('force-motion', forcedMotion);
    document.documentElement.classList.toggle('motion-paused', !active);
    if (motionToggle) {
      motionToggle.setAttribute('aria-pressed', String(active));
      motionToggle.textContent = active ? 'Motion: On' : 'Enable Motion';
    }
  };

  motionToggle?.addEventListener('click', () => {
    if (motionPreference.matches && !forcedMotion) forcedMotion = true;
    else paused = !paused;
    syncMotion();
  });

  motionPreference.addEventListener?.('change', syncMotion);
  syncMotion();

  const hero = document.querySelector('.hero');
  const createRipple = (clientX, clientY) => {
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.left = `${clientX - bounds.left}px`;
    ripple.style.top = `${clientY - bounds.top}px`;
    hero.querySelector('.hero-atmosphere')?.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  };

  hero?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button')) return;
    if (motionPreference.matches && !forcedMotion) return;
    createRipple(event.clientX, event.clientY);
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition && speakButton) {
    speakButton.disabled = true;
    speakButton.textContent = 'Voice Unavailable';
  } else if (speakButton) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    speakButton.addEventListener('click', () => {
      motionStatus.textContent = 'Listening for motion, ripple, or pause.';
      recognition.start();
    });
    recognition.addEventListener('result', (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      if (/pause|stop|still/.test(command)) {
        paused = true;
        syncMotion();
        motionStatus.textContent = 'Motion paused.';
      } else if (/motion|move|flow|start/.test(command)) {
        forcedMotion = true;
        paused = false;
        syncMotion();
        motionStatus.textContent = 'Motion started.';
      } else if (/ripple|ink|ocean|water/.test(command)) {
        forcedMotion = true;
        paused = false;
        syncMotion();
        const bounds = hero.getBoundingClientRect();
        createRipple(bounds.left + bounds.width * .7, bounds.top + bounds.height * .42);
        motionStatus.textContent = 'Ink ripple created.';
      } else motionStatus.textContent = 'Say motion, ripple, or pause.';
    });
    recognition.addEventListener('error', () => { motionStatus.textContent = 'Voice motion could not start. Tap the water instead.'; });
  }

  if (motionPreference.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });

  revealItems.forEach((item) => observer.observe(item));
})();
