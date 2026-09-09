(() => {
  const baseMoney = (value, currency = 'USD') => value == null ? 'Price not assigned' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  const money = (value, currency = 'USD') => value == null ? 'Price not assigned' : `Starting at ${baseMoney(value, currency)}`;
  const availabilityLabel = value => ({ available: 'Available', pending_classification: 'Pending classification', sold: 'Sold', unavailable: 'Unavailable' }[value] || 'Status pending');
  const authLabel = item => {
    if (item.authentication_id) return item.authentication_id;
    if (item.edition_type === 'Open Edition') return 'Open edition • no unique edition ID';
    if (item.edition_type === 'Unassigned') return 'Authentication not assigned';
    return 'Fluid Soul authentication available';
  };
  const editionLabel = item => {
    if (!item || item.edition_type === 'Unassigned') return 'Pending classification';
    if (item.edition_type === 'Limited Series' && item.edition_number && item.edition_size) return `${item.edition_type} • ${item.edition_number}/${item.edition_size}`;
    return item.edition_type;
  };
  const addViewerFields = () => {
    const meta = document.querySelector('.meta');
    if (!meta || document.querySelector('#price')) return;
    meta.insertAdjacentHTML('beforeend', '<div><small>Price</small><span id="price">Price not assigned</span></div><div><small>Availability</small><span id="availability">Status pending</span></div>');
  };
  const updateViewer = i => {
    const w = works[i];
    if (!w || !w.product) return;
    const item = w.product;
    document.querySelector('#edition').textContent = editionLabel(item);
    document.querySelector('#auth').textContent = authLabel(item);
    document.querySelector('#price').textContent = money(item.price, item.currency);
    document.querySelector('#availability').textContent = availabilityLabel(item.availability);
    const orderBtn = document.querySelector('#viewer .actions .blue');
    if (orderBtn) orderBtn.textContent = item.price == null ? 'ORDER / REQUEST DETAILS' : `ORDER / PURCHASE • ${money(item.price, item.currency)}`;
  };
  const decorateCards = () => {
    document.querySelectorAll('#grid .card').forEach((card, i) => {
      const w = works[i];
      if (!w || !w.product) return;
      const cap = card.querySelector('.cap');
      if (!cap || cap.querySelector('.catalog-line')) return;
      const item = w.product;
      const line = document.createElement('span');
      line.className = 'catalog-line';
      line.style.color = '#0174F3';
      line.style.marginTop = '7px';
      line.textContent = `${editionLabel(item)} • ${item.price == null ? availabilityLabel(item.availability) : money(item.price, item.currency)}`;
      cap.appendChild(line);
    });
  };
  addViewerFields();
  const originalShow = show;
  show = function(i) { originalShow(i); updateViewer(i); };
  fetch('products.json', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('Product registry unavailable'); return r.json(); })
    .then(registry => {
      works.forEach(w => {
        const item = registry.works && registry.works[w.slug];
        if (item) {
          w.product = item;
          w.edition = editionLabel(item);
          w.auth = authLabel(item);
        }
      });
      render();
      decorateCards();
      if (document.querySelector('#viewer').classList.contains('on')) updateViewer(cur);
    })
    .catch(err => console.warn('Fluid Soul registry:', err.message));
})();
