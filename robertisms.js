(function(){
  "use strict";

  const grid = document.getElementById("caseGrid");
  const count = document.getElementById("caseCount");
  const search = document.getElementById("caseSearch");
  const collection = document.getElementById("caseCollection");
  const empty = document.getElementById("caseEmpty");
  const FABRICATOR = "https://robert-marleton.lovable.app/fabricator";
  const TSHIRT_LAB = "t-shirt-design-lab.html";
  let records = [];
  let query = "";
  let activeCollection = "all";

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function list(items) {
    return (items || []).map(item => `<span class="case-chip">${escapeHtml(item)}</span>`).join("");
  }

  function imageMarkup(item) {
    if (!item.featuredImage) return `<div class="case-fallback">${escapeHtml(item.shareQuote || item.title)}</div>`;
    const src = `assets/images/robertisms/${item.featuredImage}`;
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(item.title)}" onerror="this.outerHTML='<div class=&quot;case-fallback&quot;>${escapeHtml(item.shareQuote || item.title)}</div>'">`;
  }

  function productTypesForPun(item) {
    const text = (item.relatedProducts || []).join(" ").toLowerCase();
    const products = [];
    if (text.includes("shirt") || text.includes("tee")) products.push("tshirt");
    if (text.includes("coaster") || text.includes("tile")) products.push("tile");
    if (text.includes("print")) products.push("print");
    if (text.includes("sticker")) products.push("sticker");
    if (!products.length) products.push("tshirt", "sticker");
    products.push("contact");
    return Array.from(new Set(products));
  }

  function punBringHomePayload(item) {
    return {
      id: item.id,
      title: item.title,
      image: item.featuredImage ? `assets/images/robertisms/${item.featuredImage}` : "",
      description: item.shareQuote || item.title,
      about: item.story || "One of Robert's Puns from Inkspirations Studios.",
      story: item.humorCategory ? `Humor category: ${item.humorCategory}.` : "",
      medium: item.collection || "Robert's Puns",
      products: productTypesForPun(item),
      recommendations: {
        artwork: item.artworkConnections || [],
        room: item.relatedRooms || [],
        playlist: item.musicMood || [],
        robertism: item.relatedRobertisms || []
      },
      source: "Robert's Puns Case Files"
    };
  }

  function buildFabricatorUrl(item) {
    const url = new URL(FABRICATOR);
    url.searchParams.set("seed", item.shareQuote || item.title || "");
    url.searchParams.set("source", "roberts-puns");
    if (item.story) url.searchParams.set("context", item.story);
    return url.toString();
  }

  function buildTshirtLabUrl(item) {
    const url = new URL(TSHIRT_LAB, window.location.href);
    url.searchParams.set("seed", item.shareQuote || item.title || "");
    url.searchParams.set("source", "roberts-puns");
    if (item.story) url.searchParams.set("why", item.story);
    return url.pathname + url.search;
  }

  function haystack(item) {
    return [
      item.title,
      item.shareQuote,
      item.story,
      item.humorCategory,
      item.collection,
      ...(item.artworkConnections || []),
      ...(item.relatedProducts || []),
      ...(item.relatedRooms || []),
      ...(item.musicMood || []),
      ...(item.tags || []),
      ...(item.relatedRobertisms || [])
    ].join(" ").toLowerCase();
  }

  function filtered() {
    const term = query.trim().toLowerCase();
    return records.filter(item => {
      const collectionMatch = activeCollection === "all" || item.collection === activeCollection;
      return collectionMatch && (!term || haystack(item).includes(term));
    });
  }

  function renderCollections() {
    const names = Array.from(new Set(records.map(item => item.collection).filter(Boolean))).sort();
    collection.innerHTML = `<option value="all">All Collections</option>` + names.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
  }

  function render() {
    const items = filtered();
    count.textContent = `${items.length} / ${records.length} Case Files`;
    empty.hidden = items.length > 0;
    grid.innerHTML = items.map(item => `
      <article class="case-card">
        <div class="case-media">${imageMarkup(item)}</div>
        <div class="case-body">
          <span class="case-badge">${escapeHtml(item.collection)}</span>
          <h2>${escapeHtml(item.title)}</h2>
          <p class="case-quote">${escapeHtml(item.shareQuote)}</p>
          <p class="case-story">${escapeHtml(item.story)}</p>
          <div class="case-group"><strong>Products</strong><div class="case-chips">${list(item.relatedProducts)}</div></div>
          <div class="case-group"><strong>Rooms</strong><div class="case-chips">${list(item.relatedRooms)}</div></div>
          <div class="case-group"><strong>Artwork Connections</strong><div class="case-chips">${list(item.artworkConnections)}</div></div>
          <div class="case-group"><strong>Tags</strong><div class="case-chips">${list(item.tags)}</div></div>
          <div class="actions">
            <button class="btn primary" type="button" data-pun-home="${escapeHtml(item.id)}">Explore Product Path</button>
            <a class="btn" href="${escapeHtml(buildTshirtLabUrl(item))}">Develop as T-Shirt</a>
            <a class="btn" href="${escapeHtml(buildFabricatorUrl(item))}">Fabricate This Pun</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  async function init() {
    try {
      const response = await fetch("data/robertisms.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load Robert's Puns data: ${response.status}`);
      const data = await response.json();
      records = Array.isArray(data.records) ? data.records : [];
      renderCollections();
      render();
    } catch (error) {
      count.textContent = "Case Files";
      empty.hidden = false;
      empty.textContent = "Robert's Puns data could not load yet.";
      console.error("[Robert's Puns]", error);
    }
  }

  search.addEventListener("input", event => {
    query = event.target.value;
    render();
  });

  collection.addEventListener("change", event => {
    activeCollection = event.target.value;
    render();
  });

  grid.addEventListener("click", event => {
    const button = event.target.closest("[data-pun-home]");
    if (!button || !window.InkspirationsBringHome) return;
    const item = records.find(record => record.id === button.dataset.punHome);
    if (item) window.InkspirationsBringHome.open(punBringHomePayload(item));
  });

  init();
})();