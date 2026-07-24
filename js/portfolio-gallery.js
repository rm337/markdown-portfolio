const state = {
  allItems: [],
  visibleItems: [],
  currentIndex: 0,
  imageCache: new Map(),
  navigationLocked: false,
  lastTrigger: null,
  lockedScrollY: 0
};

const els = {
  grid: document.querySelector('#gallery-grid'),
  featured: document.querySelector('#featured-panel'),
  search: document.querySelector('#gallery-search'),
  collection: document.querySelector('#collection-filter'),
  type: document.querySelector('#type-filter'),
  sort: document.querySelector('#sort-filter'),
  count: document.querySelector('#gallery-count'),
  empty: document.querySelector('#empty-state'),
  lightbox: document.querySelector('#lightbox'),
  lightboxImage: document.querySelector('#lightbox-image'),
  lightboxTitle: document.querySelector('#lightbox-title'),
  lightboxDescription: document.querySelector('#lightbox-description'),
  lightboxKicker: document.querySelector('#lightbox-kicker'),
  lightboxMeta: document.querySelector('#lightbox-meta'),
  takeHome: document.querySelector('#lightbox-take-home'),
  lightboxClose: document.querySelector('#lightbox-close'),
  previous: document.querySelector('#lightbox-previous'),
  next: document.querySelector('#lightbox-next')
};

async function initGallery() {
  try {
    const response = await fetch('data/portfolio-gallery.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Gallery JSON failed to load: ${response.status}`);
    const data = await response.json();
    state.allItems = Array.isArray(data.items) ? data.items.filter(item => item && item.image) : [];
  } catch (error) {
    console.warn(error);
    state.allItems = [];
  }

  hydrateFilters();
  bindEvents();
  renderGallery();
  preloadImages(state.allItems);
}

function bindEvents() {
  els.search.addEventListener('input', renderGallery);
  els.collection.addEventListener('change', renderGallery);
  els.type.addEventListener('change', renderGallery);
  els.sort.addEventListener('change', renderGallery);
  els.lightboxClose.addEventListener('click', closeLightbox);
  els.previous.addEventListener('click', showPrevious);
  els.next.addEventListener('click', showNext);

  els.lightbox.addEventListener('click', event => {
    if (event.target === els.lightbox) closeLightbox();
  });

  els.lightbox.addEventListener('cancel', event => {
    event.preventDefault();
    closeLightbox();
  });

  document.addEventListener('keydown', event => {
    if (!els.lightbox.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
    }
    if (event.key === 'ArrowLeft') showPrevious();
    if (event.key === 'ArrowRight') showNext();
  });
}

function hydrateFilters() {
  uniqueSorted(state.allItems.map(item => item.collection).filter(Boolean))
    .forEach(value => els.collection.append(new Option(value, value)));

  uniqueSorted(state.allItems.map(item => item.type).filter(Boolean))
    .forEach(value => els.type.append(new Option(value, value)));
}

function renderGallery() {
  const query = els.search.value.trim().toLowerCase();
  const collection = els.collection.value;
  const type = els.type.value;

  state.visibleItems = state.allItems
    .filter(item => collection === 'all' || item.collection === collection)
    .filter(item => type === 'all' || item.type === type)
    .filter(item => {
      if (!query) return true;
      return [item.title, item.collection, item.type, item.medium, item.description, ...(item.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    })
    .sort(sortItems);

  renderFeatured();
  renderCards();
  els.count.textContent = `${state.visibleItems.length} image${state.visibleItems.length === 1 ? '' : 's'} showing`;
  els.empty.hidden = state.visibleItems.length > 0;
  preloadImages(state.visibleItems);
}

function isInquirable(item) {
  return Boolean(item) && item.inquiryEnabled !== false;
}

function createInquiryLink(item) {
  const subject = encodeURIComponent(`Inkspirations Studios inquiry: ${item.title}`);
  const body = encodeURIComponent(`Hello Robert,\n\nI would like to ask about “${item.title}.”\n\nPlease send me more information about availability, pricing, or commissioning related work.\n\nThank you.`);
  return `mailto:r.marleton@gmail.com?subject=${subject}&body=${body}`;
}

function renderFeatured() {
  const featuredItem = state.visibleItems.find(item => item.featured) || state.visibleItems[0];
  if (!featuredItem) {
    els.featured.innerHTML = '';
    els.featured.hidden = true;
    return;
  }

  const featuredIndex = state.visibleItems.indexOf(featuredItem);
  const inquiryButton = isInquirable(featuredItem)
    ? `<a class="button" href="${escapeAttribute(createInquiryLink(featuredItem))}">Ask About This Piece</a>`
    : '';

  els.featured.hidden = false;
  els.featured.innerHTML = `
    <img src="${escapeAttribute(featuredItem.image)}" alt="${escapeAttribute(featuredItem.alt || featuredItem.title)}" loading="eager" decoding="async">
    <div class="featured-copy">
      <p class="eyebrow">Featured piece</p>
      <h2>${escapeHtml(featuredItem.title)}</h2>
      <p>${escapeHtml(featuredItem.description || '')}</p>
      <div class="card-actions">
        <button class="button primary" type="button" data-featured-open>Open Lightbox</button>
        ${inquiryButton}
      </div>
    </div>
  `;
  els.featured.querySelector('[data-featured-open]').addEventListener('click', () => openLightbox(featuredIndex));
}

function renderCards() {
  els.grid.innerHTML = '';

  state.visibleItems.forEach((item, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.alt || item.title)}" loading="lazy" decoding="async">
      <div class="card-body">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.collection || 'Portfolio')}</p>
        <p>${escapeHtml(item.medium || '')}</p>
        <div class="tag-row">${(item.tags || []).slice(0, 4).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    `;
    card.addEventListener('click', () => openLightbox(index));
    els.grid.append(card);
  });
}

function preloadImage(src) {
  if (!src || state.imageCache.has(src)) return state.imageCache.get(src);
  const image = new Image();
  image.decoding = 'async';
  const ready = new Promise(resolve => {
    image.onload = resolve;
    image.onerror = resolve;
  });
  image.src = src;
  state.imageCache.set(src, ready);
  return ready;
}

function preloadImages(items) {
  items.forEach(item => preloadImage(item.image));
}

function preloadNeighbors() {
  if (!state.visibleItems.length) return;
  const previousIndex = (state.currentIndex - 1 + state.visibleItems.length) % state.visibleItems.length;
  const nextIndex = (state.currentIndex + 1) % state.visibleItems.length;
  preloadImage(state.visibleItems[previousIndex]?.image);
  preloadImage(state.visibleItems[nextIndex]?.image);
}

function lockPage() {
  state.lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add('lightbox-open');
  document.body.classList.add('lightbox-open');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${state.lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockPage() {
  document.documentElement.classList.remove('lightbox-open');
  document.body.classList.remove('lightbox-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, state.lockedScrollY);
}

function openLightbox(index) {
  if (!state.visibleItems[index] || els.lightbox.open) return;
  state.lastTrigger = document.activeElement;
  state.currentIndex = index;
  updateLightbox();
  lockPage();
  els.lightbox.showModal();
  els.lightbox.scrollTop = 0;
  els.lightboxClose.focus({ preventScroll: true });
  preloadNeighbors();
}

function updateLightbox() {
  const item = state.visibleItems[state.currentIndex];
  if (!item) return;

  els.lightboxImage.classList.add('is-switching');
  els.lightboxImage.src = item.image;
  els.lightboxImage.alt = item.alt || item.title;
  els.lightboxTitle.textContent = item.title;
  els.lightboxDescription.textContent = item.description || '';
  els.lightboxKicker.textContent = [item.collection, item.type].filter(Boolean).join(' · ');
  els.lightboxMeta.innerHTML = '';
  if (els.takeHome) {
    const canInquire = isInquirable(item);
    els.takeHome.href = canInquire ? createInquiryLink(item) : 'pricing.html';
    els.takeHome.textContent = canInquire ? 'Ask About This Piece' : 'View Pricing';
  }

  [['Medium', item.medium], ['Year', item.year], ['Priority', item.priority ? `Gallery ${item.priority}` : '']]
    .filter(([, value]) => value)
    .forEach(([label, value]) => {
      const wrap = document.createElement('div');
      wrap.innerHTML = `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(value))}</dd>`;
      els.lightboxMeta.append(wrap);
    });

  requestAnimationFrame(() => els.lightboxImage.classList.remove('is-switching'));
  preloadNeighbors();
}

function navigate(direction) {
  if (!state.visibleItems.length || state.navigationLocked) return;
  state.navigationLocked = true;
  state.currentIndex = (state.currentIndex + direction + state.visibleItems.length) % state.visibleItems.length;
  updateLightbox();
  window.setTimeout(() => { state.navigationLocked = false; }, 90);
}

function showPrevious() {
  navigate(-1);
}

function showNext() {
  navigate(1);
}

function closeLightbox() {
  if (!els.lightbox.open) return;
  els.lightbox.close();
  unlockPage();
  if (state.lastTrigger instanceof HTMLElement) {
    requestAnimationFrame(() => state.lastTrigger.focus({ preventScroll: true }));
  }
}

function sortItems(a, b) {
  if (els.sort.value === 'title') return String(a.title).localeCompare(String(b.title));
  if (els.sort.value === 'newest') return Number(b.year || 0) - Number(a.year || 0);
  return Number(a.priority || 999) - Number(b.priority || 999);
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

initGallery();