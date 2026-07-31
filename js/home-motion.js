(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('[data-motion-toggle]');
  const speakButton = document.querySelector('[data-motion-speak]');
  const motionStatus = document.querySelector('[data-motion-status]');
  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  let forcedMotion = false;
  let paused = false;
  let activeEffect = 'ripple';

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

  const createEffect = (effect, clientX, clientY) => {
    if (effect === 'ripple') { createRipple(clientX, clientY); return; }
    const bounds = hero.getBoundingClientRect();
    const mark = document.createElement('span');
    mark.className = `motion-mark ${effect}`;
    mark.setAttribute('aria-hidden', 'true');
    mark.style.left = `${clientX - bounds.left}px`;
    mark.style.top = `${clientY - bounds.top}px`;
    hero.querySelector('.hero-atmosphere')?.appendChild(mark);
    mark.addEventListener('animationend', () => mark.remove(), { once: true });
  };

  hero?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button')) return;
    if (motionPreference.matches && !forcedMotion) return;
    createEffect(activeEffect, event.clientX, event.clientY);
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
      motionStatus.textContent = 'Listening for ripple, dot, expanse, drift, or pause.';
      recognition.start();
    });
    recognition.addEventListener('result', (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      if (/pause|stop|still/.test(command)) {
        paused = true;
        syncMotion();
        motionStatus.textContent = 'Motion paused.';
      } else if (/ripple/.test(command)) {
        activeEffect = 'ripple'; forcedMotion = true; paused = false; syncMotion();
        const bounds = hero.getBoundingClientRect();
        createEffect(activeEffect, bounds.left + bounds.width * .66, bounds.top + bounds.height * .42);
        motionStatus.textContent = 'Ripple selected. Tap anywhere to make another.';
      } else if (/dot|drop|droplet/.test(command)) {
        activeEffect = 'dot'; forcedMotion = true; paused = false; syncMotion();
        const bounds = hero.getBoundingClientRect();
        createEffect(activeEffect, bounds.left + bounds.width * .68, bounds.top + bounds.height * .58);
        motionStatus.textContent = 'Dot selected. Tap anywhere to release one.';
      } else if (/expanse|expand|bloom/.test(command)) {
        activeEffect = 'expanse'; forcedMotion = true; paused = false; syncMotion();
        const bounds = hero.getBoundingClientRect();
        createEffect(activeEffect, bounds.left + bounds.width * .7, bounds.top + bounds.height * .45);
        motionStatus.textContent = 'Expanse selected. Tap anywhere to open the ink.';
      } else if (/drift|flow|current/.test(command)) {
        activeEffect = 'drift'; forcedMotion = true; paused = false; syncMotion();
        const bounds = hero.getBoundingClientRect();
        createEffect(activeEffect, bounds.left + bounds.width * .5, bounds.top + bounds.height * .5);
        motionStatus.textContent = 'Drift selected. Tap anywhere to send it across.';
      } else if (/motion|move|start/.test(command)) {
        forcedMotion = true;
        paused = false;
        syncMotion();
        motionStatus.textContent = 'Motion started.';
      } else motionStatus.textContent = 'Say ripple, dot, expanse, drift, or pause.';
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
