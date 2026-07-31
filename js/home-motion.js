(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggle = document.querySelector('[data-motion-toggle]');
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
  hero?.addEventListener('pointerdown', (event) => {
    if (event.target.closest('a, button')) return;
    if (motionPreference.matches && !forcedMotion) return;
    const bounds = hero.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.left = `${event.clientX - bounds.left}px`;
    ripple.style.top = `${event.clientY - bounds.top}px`;
    hero.querySelector('.hero-atmosphere')?.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });

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
