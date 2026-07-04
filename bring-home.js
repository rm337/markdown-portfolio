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
        Request: ["Custom inquiry", "Future studio edition", "Collector request"]
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
        if (status) status.textContent = checkoutButton.dataset.bringCheckout === "save" ? "Saved locally for later studio follow-up." : checkoutButton.dataset.bringCheckout === "unavailable" ? "This option begins as a studio inquiry. Use Ask About This Piece for availability." : "This path is saved for Robert to connect when the piece is ready.";
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

  function pathActionLabel(product) {
    if (product.type === "print") return "View Print Options";
    if (product.type === "tile") return "Bring It to Your Table";
    return "Ask About This Piece";
  }

  function physicalInquiryHref(item) {
    const subject = `Inquiry about ${item.title}`;
    const body = `Hi Robert, I'm interested in ${item.title}. Is this piece available as an original, decorative tile, print, or custom physical item?`;
    return `mailto:r.marleton@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function optionMarkup(product) {
    const entries = Object.entries(product.options || {});
    if (!entries.length) return `<p class="bring-home-note">Options will be connected when this studio path is finalized.</p>`;
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
              ${item.products.map((product, index) => `<button class="bring-home-product" type="button" data-bring-product="${index}" aria-pressed="${index === state.productIndex ? "true" : "false"}"><span>${product.icon} ${escapeHtml(product.label)}</span>${product.future ? "<small>Future studio edition</small>" : ""}</button>`).join("")}
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
            <h3>Available Options</h3>
            <div class="bring-home-options">${optionMarkup(activeProduct)}</div>
          </section>
          <section class="bring-home-section">
            <h3>Bring This Piece Home</h3>
            <p class="bring-home-path-note">${productIsPod(activeProduct) ? "This path can connect when Robert approves the final studio edition." : "This selected path begins as a direct studio inquiry."}</p>
            <div class="bring-home-checkout">
              ${productIsPod(activeProduct) ? `<button class="btn primary" type="button" data-bring-checkout="buy">${pathActionLabel(activeProduct)}</button><button class="btn" type="button" data-bring-checkout="checkout">Ask About This Piece</button>` : `<button class="btn" type="button" data-bring-checkout="unavailable">Ask About This Piece</button>`}
              <button class="btn" type="button" data-bring-checkout="save">Save for Later</button>
            </div>
            <p class="bring-home-note">The studio stays here. Ordering paths can connect quietly when Robert approves the final piece.</p>
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
(function(){
  "use strict";

  const contactEmail = "r.marleton@gmail.com";
  const printPartnerUrl = "";

  const pathDefaults = {
    printPartner: {
      label: "Fine Art Print",
      badge: "Studio Editions",
      action: "View Print Options",
      ready: true,
      options: { Format:["Fine art print","Canvas print","Framed print"], Size:["Choose after opening"], Quantity:["Choose after opening"] },
      note: "When this piece is available as a studio print, the print options open in a separate window."
    },
    apparelPartner: {
      label: "Apparel",
      badge: "Future Studio Edition",
      action: "Ask About Apparel",
      ready: false,
      options: { Style:["Premium T-shirt","Future apparel option"], Size:["S","M","L","XL","2XL","3XL"], Color:["Deep ocean","Black","White","Heather gray"] },
      note: "Apparel appears only after Robert approves the final studio edition."
    },
    decorativeTileInquiry: {
      label: "Decorative Tile",
      badge: "Physical Inquiry",
      action: "Ask About Tile",
      ready: true,
      options: { Size:["4 x 4","6 x 6","8 x 8","Custom"], Finish:["Gloss","Matte","Robert recommendation"], Quantity:["Single","Pair","Set","Custom"] },
      note: "Decorative tiles, coaster-style pieces, and physical studio objects begin as direct studio inquiries."
    },
    originalArtworkInquiry: {
      label: "Original Artwork",
      badge: "Availability Inquiry",
      action: "Ask About Original",
      ready: true,
      options: { Interest:["Original piece","Similar piece","Collector question"] },
      note: "Originals and one-of-a-kind pieces require Robert to confirm availability."
    },
    commissionRequest: {
      label: "Commission",
      badge: "Custom Work",
      action: "Request Commission",
      ready: true,
      options: { Project:["Custom artwork","Decorative tile","Writing / phrase piece","Studio room idea"], Timeline:["Flexible","Soon","Event deadline"] },
      note: "Custom work begins as a direct request so Robert can respond personally."
    },
    contactRobert: {
      label: "Contact Robert",
      badge: "Direct Contact",
      action: "Contact Robert",
      ready: true,
      options: { Reason:["Question","Collaboration","Licensing","Other"] },
      note: "Use this when the best next step is a direct studio conversation."
    },
    stickerPartner: {
      label: "Sticker",
      badge: "Future Product",
      action: "Ask About Stickers",
      ready: false,
      options: { Size:["Small","Medium","Large"], Finish:["Gloss","Matte"] },
      note: "Sticker editions will connect after Robert approves a final destination."
    },
    journalPartner: {
      label: "Journal",
      badge: "Future Product",
      action: "Ask About Journals",
      ready: false,
      options: { Format:["Lined journal","Blank journal","Future notebook"] },
      note: "Journal editions are prepared as future merchandise paths."
    }
  };

  const alias = {
    print:"printPartner", tshirt:"apparelPartner", shirt:"apparelPartner", apparel:"apparelPartner",
    tile:"decorativeTileInquiry", coaster:"decorativeTileInquiry", sticker:"stickerPartner", journal:"journalPartner",
    original:"originalArtworkInquiry", commission:"commissionRequest", contact:"contactRobert", other:"contactRobert"
  };

  let commerceItem = null;
  let commerceIndex = 0;
  let lastFocus = null;

  function esc(value){
    return String(value || "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  }

  function arr(value){ return !value ? [] : Array.isArray(value) ? value : [value]; }

  function siteAsset(path){
    if(!path) return "";
    if(/^(https?:|data:|blob:|\/)/.test(path)) return path;
    const base = location.hostname.endsWith("github.io") ? "/markdown-portfolio/" : "";
    return base + String(path).replace(/^\.\//, "");
  }

  function mailto(subject, body){
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function normalizePath(path){
    const raw = typeof path === "string" ? path : (path.type || path.path || path.kind || "contact");
    const type = alias[String(raw).trim()] || raw || "contactRobert";
    const base = pathDefaults[type] || pathDefaults.contactRobert;
    const custom = typeof path === "string" ? {} : path;
    return {
      type,
      label: custom.label || base.label,
      badge: custom.badge || base.badge,
      action: custom.action || base.action,
      ready: typeof custom.ready === "boolean" ? custom.ready : base.ready,
      url: custom.url || "",
      options: custom.options || base.options || {},
      note: custom.note || base.note
    };
  }

  function inferPaths(item){
    if(item.acquisitionPaths) return arr(item.acquisitionPaths).map(normalizePath);
    if(item.products) return arr(item.products).map(normalizePath);
    const text = [item.type,item.medium,item.category,item.collection,item.title,item.source].filter(Boolean).join(" ").toLowerCase();
    if(text.includes("functional") || text.includes("coaster") || text.includes("tile")) return ["decorativeTileInquiry","originalArtworkInquiry","commissionRequest","contactRobert"].map(normalizePath);
    if(text.includes("writing") || text.includes("poem")) return ["printPartner","commissionRequest","contactRobert"].map(normalizePath);
    if(text.includes("lettering") || text.includes("words") || text.includes("robertism")) return ["apparelPartner","printPartner","decorativeTileInquiry","contactRobert"].map(normalizePath);
    if(text.includes("wood") || text.includes("burn")) return ["originalArtworkInquiry","printPartner","decorativeTileInquiry","commissionRequest"].map(normalizePath);
    return ["printPartner","originalArtworkInquiry","decorativeTileInquiry","commissionRequest","contactRobert"].map(normalizePath);
  }

  function unique(paths){
    const seen = new Set();
    return paths.filter(path => !seen.has(path.type) && seen.add(path.type));
  }

  function normalizeCommerceItem(item){
    const paths = unique(inferPaths(item || {}));
    return {
      id: item.id || "inkspirations-piece",
      title: item.title || "Inkspirations Piece",
      image: item.image || item.featuredImage || "",
      description: item.description || item.desc || item.shareQuote || "Selected Inkspirations Studios work.",
      about: item.about || item.artistDescription || item.story || item.description || item.desc || "A selected piece from the Inkspirations Studios world.",
      story: item.story || "",
      medium: item.medium || item.category || item.collection || "Inkspirations Studios",
      paths: paths.length ? paths : [normalizePath("contactRobert")],
      recommendations: item.recommendations || {},
      source: item.source || "Inkspirations Studios"
    };
  }

  function ensureCommerceStyles(){
    if(document.querySelector("style[data-commerce-path-style]")) return;
    const style = document.createElement("style");
    style.setAttribute("data-commerce-path-style", "true");
    style.textContent = `
      .bring-home-paths{display:grid;gap:.65rem}.bring-home-path{min-height:70px;border:1px solid rgba(246,243,232,.14);background:rgba(246,243,232,.055);color:#f6f3e8;text-align:left;padding:.75rem;cursor:pointer;font:800 .68rem Inter,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.bring-home-path[aria-pressed='true']{border-color:#8ff3e8;background:rgba(143,243,232,.11);color:#8ff3e8}.bring-home-path small{display:block;margin-top:.22rem;color:rgba(246,243,232,.55);letter-spacing:.08em}.bring-home-badge{display:inline-flex;width:max-content;margin-bottom:.65rem;min-height:26px;align-items:center;border:1px solid rgba(143,243,232,.26);color:#8ff3e8;padding:.32rem .48rem;font:800 .56rem Inter,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.bring-home-actions{display:grid;gap:.65rem}.bring-home-actions .btn{width:100%}
    `;
    document.head.appendChild(style);
  }

  function ensureModal(){
    ensureCommerceStyles();
    let modal = document.getElementById("bringHomeModal");
    if(modal) return modal;
    modal = document.createElement("div");
    modal.className = "bring-home-modal";
    modal.id = "bringHomeModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "bringHomeTitle");
    modal.innerHTML = `<div class="bring-home-panel" role="document"><button class="bring-home-close" type="button" data-bring-home-close>Close</button><div data-bring-home-content></div></div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function recChips(recommendations){
    const groups = [["Related artwork",recommendations.artwork],["Related room",recommendations.room],["Related playlist",recommendations.playlist],["Related Robertism",recommendations.robertism]];
    const chips = [];
    groups.forEach(([label, values]) => arr(values).filter(Boolean).forEach(value => chips.push(`<span class="bring-home-chip">${esc(label)}: ${esc(value)}</span>`)));
    return chips.length ? chips.join("") : `<span class="bring-home-chip">Studio recommendation: Ask Robert for the best pairing.</span>`;
  }

  function optionMarkup(path){
    const entries = Object.entries(path.options || {});
    if(!entries.length) return `<p class="bring-home-note">Options appear when this path is finalized.</p>`;
    return entries.map(([label, values]) => `<div class="bring-home-field"><label>${esc(label)}</label><select>${arr(values).map(value => `<option>${esc(value)}</option>`).join("")}</select></div>`).join("");
  }

  function inquiryHref(item, path){
    const subjects = {
      decorativeTileInquiry:`Tile inquiry about ${item.title}`,
      originalArtworkInquiry:`Original artwork inquiry about ${item.title}`,
      commissionRequest:`Commission request inspired by ${item.title}`,
      contactRobert:`Question about ${item.title}`,
      apparelPartner:`Apparel interest for ${item.title}`,
      stickerPartner:`Sticker interest for ${item.title}`,
      journalPartner:`Journal interest for ${item.title}`
    };
    const bodies = {
      decorativeTileInquiry:`Hi Robert, I am interested in ${item.title} as a decorative tile, coaster, or custom physical piece. Is this available?`,
      originalArtworkInquiry:`Hi Robert, I am interested in ${item.title}. Is the original available, or is there a similar physical piece?`,
      commissionRequest:`Hi Robert, I would like to request a commission inspired by ${item.title}.`,
      contactRobert:`Hi Robert, I have a question about ${item.title}.`,
      apparelPartner:`Hi Robert, I am interested in apparel for ${item.title} when it becomes available.`,
      stickerPartner:`Hi Robert, I am interested in a sticker version of ${item.title} when it becomes available.`,
      journalPartner:`Hi Robert, I am interested in a journal or notebook connected to ${item.title} when it becomes available.`
    };
    return mailto(subjects[path.type] || `Inquiry about ${item.title}`, bodies[path.type] || `Hi Robert, I am interested in ${item.title}.`);
  }

  function primaryAction(item, path){
    if(path.type === "printPartner" && path.ready && (path.url || printPartnerUrl)){
      return `<a class="btn primary" href="${esc(path.url || printPartnerUrl)}" target="_blank" rel="noopener">View Print Options</a>`;
    }
    const label = path.type === "decorativeTileInquiry" ? "Bring It to Your Table" : path.type === "originalArtworkInquiry" ? "Bring This Piece Home" : path.ready && path.type !== "printPartner" ? path.action : "Ask About This Piece";
    return `<a class="btn primary" href="${esc(inquiryHref(item, path))}">${esc(label)}</a>`;
  }

  function saveForLater(){
    const status = document.querySelector("[data-bring-home-status]");
    if(commerceItem){
      const saved = JSON.parse(localStorage.getItem("inkBringHomeSaved") || "[]");
      saved.unshift({ title: commerceItem.title, date: new Date().toISOString() });
      localStorage.setItem("inkBringHomeSaved", JSON.stringify(saved.slice(0, 25)));
    }
    if(status) status.textContent = "Saved on this device for later.";
  }

  function renderCommerce(){
    const modal = ensureModal();
    const item = commerceItem;
    if(!item) return;
    const path = item.paths[Math.min(commerceIndex, item.paths.length - 1)] || item.paths[0];
    const image = item.image ? `<img src="${esc(siteAsset(item.image))}" alt="${esc(item.title)}" onerror="this.outerHTML='<div class=&quot;bring-home-fallback&quot;>${esc(item.title)}</div>'">` : `<div class="bring-home-fallback">${esc(item.title)}</div>`;
    modal.querySelector("[data-bring-home-content]").innerHTML = `
      <header class="bring-home-header"><div class="bring-home-image">${image}</div><div class="bring-home-copy"><p class="bring-home-kicker">${esc(item.medium)}</p><h2 id="bringHomeTitle">${esc(item.title)}</h2><p>${esc(item.description)}</p></div></header>
      <div class="bring-home-body"><div>
        <section class="bring-home-section"><h3>Bring This Home</h3><div class="bring-home-paths">${item.paths.map((entry, index) => `<button class="bring-home-path" type="button" data-commerce-path="${index}" aria-pressed="${index === commerceIndex ? "true" : "false"}"><span>${esc(entry.label)}</span><small>${esc(entry.badge)}</small></button>`).join("")}</div></section>
        <section class="bring-home-section"><h3>About This Piece</h3><div class="bring-home-about"><p>${esc(item.about)}</p>${item.story ? `<p>${esc(item.story)}</p>` : ""}</div></section>
        <section class="bring-home-section"><h3>Studio Recommendation</h3><p class="bring-home-note">This piece also pairs well with...</p><div class="bring-home-recs">${recChips(item.recommendations)}</div></section>
      </div><aside>
        <section class="bring-home-section"><h3>Selected Path</h3><span class="bring-home-badge">${esc(path.badge)}</span><p class="bring-home-path-note">${esc(path.note)}</p><div class="bring-home-options">${optionMarkup(path)}</div></section>
        <section class="bring-home-section"><h3>Next Step</h3><div class="bring-home-actions">${primaryAction(item, path)}<button class="btn" type="button" data-commerce-save>Save for Later</button><a class="btn" href="${esc(inquiryHref(item, normalizePath("contactRobert")))}">Ask About This Piece</a></div><p class="bring-home-note">A direct print link appears only when Robert has approved the piece. Originals, tiles, commissions, and custom work stay inquiry-based.</p><p class="bring-home-status" data-bring-home-status></p></section>
      </aside></div>`;
  }

  function openCommerce(item){
    commerceItem = normalizeCommerceItem(item || {});
    commerceIndex = 0;
    lastFocus = document.activeElement;
    const modal = ensureModal();
    renderCommerce();
    modal.classList.add("open");
    document.body.classList.add("bring-home-open");
    const closeButton = modal.querySelector("[data-bring-home-close]");
    if(closeButton) closeButton.focus();
  }

  function closeCommerce(){
    const modal = document.getElementById("bringHomeModal");
    if(!modal) return;
    modal.classList.remove("open");
    document.body.classList.remove("bring-home-open");
    if(lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  document.addEventListener("click", event => {
    const close = event.target.closest("[data-bring-home-close]");
    const modal = document.getElementById("bringHomeModal");
    if(close || (modal && event.target === modal)){ closeCommerce(); return; }
    const pathButton = event.target.closest("[data-commerce-path]");
    if(pathButton){ commerceIndex = Number(pathButton.dataset.commercePath || 0); renderCommerce(); return; }
    if(event.target.closest("[data-commerce-save]")){ saveForLater(); return; }
  }, true);

  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-bring-home-id]");
    if(!trigger) return;
    const registry = window.InkspirationsBringHomeData || {};
    const item = registry[trigger.dataset.bringHomeId];
    if(!item) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openCommerce(item);
  }, true);

  window.InkspirationsBringHome = Object.assign(window.InkspirationsBringHome || {}, {
    open: openCommerce,
    close: closeCommerce,
    normalizeItem: normalizeCommerceItem,
    acquisitionDefaults: pathDefaults
  });
})();

(function(){
  "use strict";
  if(document.querySelector("style[data-commerce-base-style]")) return;
  const style = document.createElement("style");
  style.setAttribute("data-commerce-base-style", "true");
  style.textContent = `
    body.bring-home-open{overflow:hidden}.bring-home-modal{position:fixed;inset:0;z-index:140;display:none;place-items:center;padding:clamp(.75rem,2vw,1.4rem);background:rgba(2,5,12,.88);backdrop-filter:blur(18px)}.bring-home-modal.open{display:grid}.bring-home-panel{position:relative;width:min(1120px,96vw);max-height:92vh;overflow:auto;border:1px solid rgba(143,243,232,.28);background:radial-gradient(circle at 18% 8%,rgba(86,217,255,.14),transparent 30%),linear-gradient(145deg,rgba(5,13,24,.98),rgba(3,8,17,.98));color:#f6f3e8;box-shadow:0 32px 120px rgba(0,0,0,.58),inset 0 1px 0 rgba(246,243,232,.05)}.bring-home-close{position:absolute;top:.85rem;right:.85rem;z-index:2;min-height:40px;border:1px solid rgba(246,243,232,.18);background:rgba(2,5,12,.78);color:#f6f3e8;padding:.6rem .75rem;cursor:pointer;font:800 .62rem Inter,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}.bring-home-header{display:grid;grid-template-columns:minmax(260px,.62fr) minmax(0,1fr);gap:clamp(1rem,3vw,1.6rem);padding:clamp(1rem,3vw,1.6rem);border-bottom:1px solid rgba(246,243,232,.12)}.bring-home-image{min-height:320px;display:grid;place-items:center;overflow:hidden;background:#02050c;border:1px solid rgba(246,243,232,.12)}.bring-home-image img{width:100%;height:100%;max-height:520px;object-fit:contain;display:block}.bring-home-fallback{min-height:320px;display:grid;place-items:center;padding:1rem;text-align:center;color:#ffe6ad;font:500 clamp(2rem,5vw,4.2rem)/.95 Georgia,'Times New Roman',serif;background:radial-gradient(circle at 24% 18%,rgba(86,217,255,.22),transparent 34%),linear-gradient(145deg,#06101b,#0174F3 62%,#02050c)}.bring-home-copy{align-self:end;padding-right:2.2rem}.bring-home-kicker,.bring-home-section h3,.bring-home-chip,.bring-home-note,.bring-home-status{font-family:Inter,Arial,sans-serif;text-transform:uppercase;letter-spacing:.12em;font-weight:800}.bring-home-kicker{margin:0 0 .65rem;color:#8ff3e8;font-size:.68rem}.bring-home-copy h2{margin:0;color:#ffe6ad;font:500 clamp(2rem,5vw,4.8rem)/.94 Georgia,'Times New Roman',serif;letter-spacing:0}.bring-home-copy p{max-width:660px;color:rgba(246,243,232,.76);margin:.8rem 0 0}.bring-home-body{display:grid;grid-template-columns:minmax(0,.95fr) minmax(280px,.55fr);gap:1rem;padding:clamp(1rem,3vw,1.6rem)}.bring-home-section{border:1px solid rgba(246,243,232,.12);background:rgba(246,243,232,.035);padding:1rem}.bring-home-section+.bring-home-section{margin-top:1rem}.bring-home-section h3{margin:0 0 .85rem;color:rgba(143,243,232,.86);font-size:.72rem}.bring-home-options{display:grid;gap:.75rem}.bring-home-field label{display:block;margin-bottom:.32rem;color:rgba(246,243,232,.62);font:800 .62rem Inter,Arial,sans-serif;text-transform:uppercase;letter-spacing:.12em}.bring-home-field select{width:100%;min-height:42px;border:1px solid rgba(246,243,232,.16);background:rgba(2,5,12,.7);color:#f6f3e8;padding:.65rem .7rem;font:inherit}.bring-home-about p{color:rgba(246,243,232,.76);margin:0 0 .75rem}.bring-home-recs{display:grid;gap:.5rem}.bring-home-chip{display:inline-flex;align-items:center;min-height:30px;border:1px solid rgba(246,243,232,.14);background:rgba(246,243,232,.05);color:rgba(246,243,232,.76);padding:.38rem .52rem;font-size:.6rem;line-height:1.2}.bring-home-path-note{margin:0 0 .75rem;color:rgba(246,243,232,.72)}.bring-home-note{margin:.75rem 0 0;color:rgba(246,243,232,.52);font-size:.58rem;line-height:1.5}.bring-home-status{min-height:1.2rem;margin:.65rem 0 0;color:#8ff3e8;font-size:.62rem}@media(max-width:860px){.bring-home-header,.bring-home-body{grid-template-columns:1fr}.bring-home-copy{padding-right:2.2rem}.bring-home-image,.bring-home-fallback{min-height:240px}}@media(max-width:560px){.bring-home-modal{padding:0}.bring-home-panel{width:100vw;max-height:100vh;min-height:100vh;border-left:0;border-right:0}.bring-home-copy h2{font-size:2.15rem}}
  `;
  document.head.appendChild(style);
})();
