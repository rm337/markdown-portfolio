(function(){
  "use strict";

  const productDefaults = {
    tshirt: {
      icon: "👕",
      label: "Premium T-Shirt",
      options: {
        Size: ["S", "M", "L", "XL", "2XL", "3XL"],
        Color: ["Deep Ocean Blue", "Black", "White", "Heather Gray"],
        Quantity: ["1", "2", "3", "4+"]
      }
    },
    tile: {
      icon: "🧱",
      label: "Decorative Tile",
      options: {
        Size: ["4 x 4", "6 x 6", "8 x 8"],
        Finish: ["Gloss", "Matte", "Future specialty finish"],
        Quantity: ["1", "2", "4", "Set inquiry"]
      }
    },
    print: {
      icon: "🖼️",
      label: "Fine Art Print",
      options: {
        Surface: ["Fine art paper", "Canvas", "Future archival option"],
        Size: ["8 x 10", "11 x 14", "16 x 20", "Custom inquiry"],
        Quantity: ["1", "2", "3", "4+"]
      }
    },
    sticker: {
      icon: "🏷️",
      label: "Sticker",
      options: {
        Size: ["Small", "Medium", "Large"],
        Finish: ["Gloss", "Matte"],
        Quantity: ["1", "3", "5", "10+"]
      }
    },
    journal: {
      icon: "📒",
      label: "Journal",
      future: true,
      options: {
        Format: ["Future lined journal", "Future blank journal"],
        Quantity: ["Interest list"]
      }
    },
    other: {
      icon: "🎁",
      label: "Other Products",
      future: true,
      options: {
        Request: ["Custom inquiry", "Future product idea", "Collector request"]
      }
    }
  };

  const state = {
    item: null,
    productIndex: 0,
    lastFocus: null
  };

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function siteAsset(path) {
    if (!path) return "";
    if (/^(https?:|data:|blob:|\/)/.test(path)) return path;
    const base = location.hostname.endsWith("github.io") ? "/markdown-portfolio/" : "";
    return base + String(path).replace(/^\.\//, "");
  }

  function asArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function normalizeProduct(product) {
    const key = typeof product === "string" ? product : product.type;
    const base = productDefaults[key] || productDefaults.other;
    return {
      type: key || "other",
      icon: product.icon || base.icon,
      label: product.label || base.label,
      future: Boolean(product.future || base.future),
      options: product.options || base.options || {}
    };
  }

  function normalizeItem(item) {
    const products = asArray(item.products).map(normalizeProduct);
    return {
      id: item.id || "inkspirations-piece",
      title: item.title || "Inkspirations Piece",
      image: item.image || item.featuredImage || "",
      description: item.description || item.desc || item.shareQuote || "Selected Inkspirations Studios work.",
      about: item.about || item.artistDescription || item.story || item.description || item.desc || "A selected piece from the Inkspirations Studios world.",
      story: item.story || "",
      medium: item.medium || item.category || item.collection || "Inkspirations Studios",
      products: products.length ? products : [normalizeProduct("print")],
      recommendations: item.recommendations || {},
      source: item.source || "Inkspirations Studios"
    };
  }

  function ensureStyles() {
    if (document.querySelector("style[data-bring-home-style]")) return;
    const style = document.createElement("style");
    style.setAttribute("data-bring-home-style", "true");
    style.textContent = `
      body.bring-home-open { overflow: hidden; }
      .bring-home-modal { position: fixed; inset: 0; z-index: 140; display: none; place-items: center; padding: clamp(.75rem, 2vw, 1.4rem); background: rgba(2, 5, 12, .88); backdrop-filter: blur(18px); }
      .bring-home-modal.open { display: grid; }
      .bring-home-panel { position: relative; width: min(1120px, 96vw); max-height: 92vh; overflow: auto; border: 1px solid rgba(143, 243, 232, .28); background: radial-gradient(circle at 18% 8%, rgba(86, 217, 255, .14), transparent 30%), linear-gradient(145deg, rgba(5, 13, 24, .98), rgba(3, 8, 17, .98)); color: #f6f3e8; box-shadow: 0 32px 120px rgba(0, 0, 0, .58), inset 0 1px 0 rgba(246, 243, 232, .05); }
      .bring-home-close { position: absolute; top: .85rem; right: .85rem; z-index: 2; min-height: 40px; border: 1px solid rgba(246, 243, 232, .18); background: rgba(2, 5, 12, .78); color: #f6f3e8; padding: .6rem .75rem; cursor: pointer; font: 800 .62rem Inter, Arial, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
      .bring-home-header { display: grid; grid-template-columns: minmax(260px, .62fr) minmax(0, 1fr); gap: clamp(1rem, 3vw, 1.6rem); padding: clamp(1rem, 3vw, 1.6rem); border-bottom: 1px solid rgba(246, 243, 232, .12); }
      .bring-home-image { min-height: 320px; display: grid; place-items: center; overflow: hidden; background: #02050c; border: 1px solid rgba(246, 243, 232, .12); }
      .bring-home-image img { width: 100%; height: 100%; max-height: 520px; object-fit: contain; display: block; }
      .bring-home-fallback { min-height: 320px; display: grid; place-items: center; padding: 1rem; text-align: center; color: #ffe6ad; font: 500 clamp(2rem, 5vw, 4.2rem)/.95 Georgia, 'Times New Roman', serif; background: radial-gradient(circle at 24% 18%, rgba(86, 217, 255, .22), transparent 34%), linear-gradient(145deg, #06101b, #0174F3 62%, #02050c); }
      .bring-home-copy { align-self: end; padding-right: 2.2rem; }
      .bring-home-kicker, .bring-home-section h3, .bring-home-product, .bring-home-chip, .bring-home-note, .bring-home-status { font-family: Inter, Arial, sans-serif; text-transform: uppercase; letter-spacing: .12em; font-weight: 800; }
      .bring-home-kicker { margin: 0 0 .65rem; color: #8ff3e8; font-size: .68rem; }
      .bring-home-copy h2 { margin: 0; color: #ffe6ad; font: 500 clamp(2rem, 5vw, 4.8rem)/.94 Georgia, 'Times New Roman', serif; letter-spacing: 0; }
      .bring-home-copy p { max-width: 660px; color: rgba(246, 243, 232, .76); margin: .8rem 0 0; }
      .bring-home-body { display: grid; grid-template-columns: minmax(0, .95fr) minmax(280px, .55fr); gap: 1rem; padding: clamp(1rem, 3vw, 1.6rem); }
      .bring-home-section { border: 1px solid rgba(246, 243, 232, .12); background: rgba(246, 243, 232, .035); padding: 1rem; }
      .bring-home-section + .bring-home-section { margin-top: 1rem; }
      .bring-home-section h3 { margin: 0 0 .85rem; color: rgba(143, 243, 232, .86); font-size: .72rem; }
      .bring-home-products { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .65rem; }
      .bring-home-product { min-height: 64px; border: 1px solid rgba(246, 243, 232, .14); background: rgba(246, 243, 232, .055); color: #f6f3e8; text-align: left; padding: .75rem; cursor: pointer; font-size: .68rem; }
      .bring-home-product[aria-pressed='true'] { border-color: #8ff3e8; background: rgba(143, 243, 232, .11); color: #8ff3e8; }
      .bring-home-product small { display: block; margin-top: .22rem; color: rgba(246, 243, 232, .55); letter-spacing: .08em; }
      .bring-home-options { display: grid; gap: .75rem; }
      .bring-home-field label { display: block; margin-bottom: .32rem; color: rgba(246, 243, 232, .62); font: 800 .62rem Inter, Arial, sans-serif; text-transform: uppercase; letter-spacing: .12em; }
      .bring-home-field select { width: 100%; min-height: 42px; border: 1px solid rgba(246, 243, 232, .16); background: rgba(2, 5, 12, .7); color: #f6f3e8; padding: .65rem .7rem; font: inherit; }
      .bring-home-about p { color: rgba(246, 243, 232, .76); margin: 0 0 .75rem; }
      .bring-home-recs { display: grid; gap: .5rem; }
      .bring-home-chip { display: inline-flex; align-items: center; min-height: 30px; border: 1px solid rgba(246, 243, 232, .14); background: rgba(246, 243, 232, .05); color: rgba(246, 243, 232, .76); padding: .38rem .52rem; font-size: .6rem; line-height: 1.2; }
      .bring-home-checkout { display: grid; gap: .65rem; }
      .bring-home-path-note { margin: 0 0 .75rem; color: rgba(246, 243, 232, .72); }
      .bring-home-checkout .btn { width: 100%; }
      .bring-home-note { margin: .75rem 0 0; color: rgba(246, 243, 232, .52); font-size: .58rem; line-height: 1.5; }
      .bring-home-status { min-height: 1.2rem; margin: .65rem 0 0; color: #8ff3e8; font-size: .62rem; }
      @media (max-width: 860px) { .bring-home-header, .bring-home-body { grid-template-columns: 1fr; } .bring-home-copy { padding-right: 2.2rem; } .bring-home-image, .bring-home-fallback { min-height: 240px; } }
      @media (max-width: 560px) { .bring-home-modal { padding: 0; } .bring-home-panel { width: 100vw; max-height: 100vh; min-height: 100vh; border-left: 0; border-right: 0; } .bring-home-products { grid-template-columns: 1fr; } .bring-home-copy h2 { font-size: 2.15rem; } }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    ensureStyles();
    let modal = document.getElementById("bringHomeModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "bring-home-modal";
    modal.id = "bringHomeModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "bringHomeTitle");
    modal.innerHTML = `
      <div class="bring-home-panel" role="document">
        <button class="bring-home-close" type="button" data-bring-home-close>Close</button>
        <div data-bring-home-content></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.closest("[data-bring-home-close]")) close();
      const productButton = event.target.closest("[data-bring-product]");
      if (productButton) {
        state.productIndex = Number(productButton.dataset.bringProduct || 0);
        render();
      }
      const checkoutButton = event.target.closest("[data-bring-checkout]");
      if (checkoutButton) {
        const status = modal.querySelector("[data-bring-home-status]");
        if (status) status.textContent = checkoutButton.dataset.bringCheckout === "save" ? "Saved locally for later studio follow-up." : checkoutButton.dataset.bringCheckout === "unavailable" ? "This option is an inquiry path right now. Use Ask About This Piece for availability." : "Checkout placeholder ready for future fulfillment connection.";
        if (checkoutButton.dataset.bringCheckout === "save" && state.item) {
          const saved = JSON.parse(localStorage.getItem("inkBringHomeSaved") || "[]");
          saved.unshift({ title: state.item.title, date: new Date().toISOString() });
          localStorage.setItem("inkBringHomeSaved", JSON.stringify(saved.slice(0, 25)));
        }
      }
    });
    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && modal.classList.contains("open")) close();
    });
    return modal;
  }

  function recChips(recommendations) {
    const groups = [
      ["Related artwork", recommendations.artwork],
      ["Related room", recommendations.room],
      ["Related playlist", recommendations.playlist],
      ["Related Robertism", recommendations.robertism]
    ];
    const chips = [];
    groups.forEach(([label, values]) => {
      asArray(values).filter(Boolean).forEach(value => chips.push(`<span class="bring-home-chip">${escapeHtml(label)}: ${escapeHtml(value)}</span>`));
    });
    return chips.length ? chips.join("") : `<span class="bring-home-chip">Studio recommendation: Ask Robert for the best pairing.</span>`;
  }

  function productIsPod(product) {
    return ["tshirt", "print", "sticker"].includes(product.type) && !product.future;
  }

  function physicalInquiryHref(item) {
    const subject = `Inquiry about ${item.title}`;
    const body = `Hi Robert, I'm interested in ${item.title}. Is this piece available as an original, decorative tile, print, or custom physical item?`;
    return `mailto:r.marleton@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function optionMarkup(product) {
    const entries = Object.entries(product.options || {});
    if (!entries.length) return `<p class="bring-home-note">Options will be connected when this product path is finalized.</p>`;
    return entries.map(([label, values]) => `
      <div class="bring-home-field">
        <label>${escapeHtml(label)}</label>
        <select>${asArray(values).map(value => `<option>${escapeHtml(value)}</option>`).join("")}</select>
      </div>
    `).join("");
  }

  function render() {
    const modal = ensureModal();
    const item = state.item;
    if (!item) return;
    const activeProduct = item.products[Math.min(state.productIndex, item.products.length - 1)] || item.products[0];
    const image = item.image ? `<img src="${escapeHtml(siteAsset(item.image))}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;bring-home-fallback&quot;>${escapeHtml(item.title)}</div>'">` : `<div class="bring-home-fallback">${escapeHtml(item.title)}</div>`;
    modal.querySelector("[data-bring-home-content]").innerHTML = `
      <header class="bring-home-header">
        <div class="bring-home-image">${image}</div>
        <div class="bring-home-copy">
          <p class="bring-home-kicker">${escapeHtml(item.medium)}</p>
          <h2 id="bringHomeTitle">${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description)}</p>
        </div>
      </header>
      <div class="bring-home-body">
        <div>
          <section class="bring-home-section">
            <h3>Available Paths</h3>
            <div class="bring-home-products">
              ${item.products.map((product, index) => `<button class="bring-home-product" type="button" data-bring-product="${index}" aria-pressed="${index === state.productIndex ? "true" : "false"}"><span>${product.icon} ${escapeHtml(product.label)}</span>${product.future ? "<small>Future product path</small>" : ""}</button>`).join("")}
            </div>
          </section>
          <section class="bring-home-section">
            <h3>About This Piece</h3>
            <div class="bring-home-about"><p>${escapeHtml(item.about)}</p>${item.story ? `<p>${escapeHtml(item.story)}</p>` : ""}</div>
          </section>
          <section class="bring-home-section">
            <h3>Studio Recommendation</h3>
            <p class="bring-home-note">This piece also pairs well with...</p>
            <div class="bring-home-recs">${recChips(item.recommendations)}</div>
          </section>
        </div>
        <aside>
          <section class="bring-home-section">
            <h3>Product Options</h3>
            <div class="bring-home-options">${optionMarkup(activeProduct)}</div>
          </section>
          <section class="bring-home-section">
            <h3>Order through print partner</h3>
            <p class="bring-home-path-note">${productIsPod(activeProduct) ? "This product type is ready for a future print-partner checkout connection." : "This selected option is not set up for automatic checkout yet."}</p>
            <div class="bring-home-checkout">
              ${productIsPod(activeProduct) ? `<button class="btn primary" type="button" data-bring-checkout="buy">Order Through Print Partner</button><button class="btn" type="button" data-bring-checkout="checkout">Continue to Checkout</button>` : `<button class="btn" type="button" data-bring-checkout="unavailable">Print Partner Not Connected Yet</button>`}
              <button class="btn" type="button" data-bring-checkout="save">Save for Later</button>
            </div>
            <p class="bring-home-note">Provider-neutral placeholder. The studio experience stays here; fulfillment can connect later behind the scenes.</p>
            <p class="bring-home-status" data-bring-home-status></p>
          </section>
          <section class="bring-home-section">
            <h3>Interested in the physical piece?</h3>
            <p class="bring-home-path-note">For originals, decorative tiles, custom commissions, physical studio pieces, or one-of-a-kind objects, ask Robert directly about availability.</p>
            <div class="bring-home-checkout">
              <a class="btn primary" href="${escapeHtml(physicalInquiryHref(item))}">Ask About This Piece</a>
            </div>
          </section>
        </aside>
      </div>
    `;
  }

  function open(item) {
    state.item = normalizeItem(item || {});
    state.productIndex = 0;
    state.lastFocus = document.activeElement;
    const modal = ensureModal();
    render();
    modal.classList.add("open");
    document.body.classList.add("bring-home-open");
    const closeButton = modal.querySelector("[data-bring-home-close]");
    if (closeButton) closeButton.focus();
  }

  function close() {
    const modal = document.getElementById("bringHomeModal");
    if (!modal) return;
    modal.classList.remove("open");
    document.body.classList.remove("bring-home-open");
    if (state.lastFocus && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
  }

  function lookup(id) {
    const registry = window.InkspirationsBringHomeData || {};
    return registry[id];
  }

  window.InkspirationsBringHome = { open, close, normalizeItem, productDefaults };

  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-bring-home-id]");
    if (!trigger) return;
    const item = lookup(trigger.dataset.bringHomeId);
    if (!item) return;
    event.preventDefault();
    open(item);
  });
})();