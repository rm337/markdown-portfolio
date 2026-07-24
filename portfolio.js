const galleryDataUrl = "portfolio.json?v=20260717-21works";
const imageFolders = {
  artwork: "assets/images/artwork/",
  coasters: "assets/images/coasters/",
  "wood-art": "assets/images/wood-art/",
  process: "assets/images/process/"
};
const filterRow = document.getElementById("filterRow");
const galleryGrid = document.getElementById("galleryGrid");
const gallerySearch = document.getElementById("gallerySearch");
const gallerySort = document.getElementById("gallerySort");
const galleryCount = document.getElementById("galleryCount");
const emptyGallery = document.getElementById("emptyGallery");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalType = document.getElementById("modalType");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalStatus = document.getElementById("modalStatus");
const modalPrice = document.getElementById("modalPrice");
const modalDimensions = document.getElementById("modalDimensions");
const modalMedium = document.getElementById("modalMedium");
const modalPrimaryAction = document.getElementById("modalPrimaryAction");

let works = [];
let activeFilter = "all";
let searchTerm = "";
let sortMode = "curated";
let visibleWorks = [];
let activeIndex = 0;
let lastGalleryTrigger = null;
let searchScrollTimer = null;

const siteBase = location.hostname.endsWith("github.io") ? "/markdown-portfolio/" : "";

window.InkspirationsBringHomeData = Object.assign(window.InkspirationsBringHomeData || {}, {
  "roberts-poem": {
    id: "roberts-poem",
    title: "Robert's Poem / Writing Piece",
    description: "A quiet writing feature from the Inkspirations Studios world.",
    about: "Rain at the studio window. Ink moving like memory. A room opens, and the work begins.",
    medium: "Writing / Poem",
    products: ["print", "journal", "sticker"],
    recommendations: {
      room: "Writing Room",
      artwork: "Words & Expressions",
      playlist: "Rainstorm Studio Atmosphere"
    },
    source: "Portfolio Writing Section"
  },
  "functional-art-coasters": {
    id: "functional-art-coasters",
    title: "Inkspirations Coasters / Functional Art",
    image: "assets/images/portfolio/coasters/curved-blue-object-coaster-study.jpg",
    description: "Coaster studies, usable surfaces, and object-based artwork from the Inkspirations product world.",
    about: "Functional art experiments that move the blue-current studio language onto objects people can live with.",
    medium: "Functional Art / Product Study",
    products: ["tile", "print", "sticker", "other"],
    recommendations: {
      artwork: "Blue Current Coaster",
      room: "Merch Concept Foundry",
      playlist: "Ocean of Ink"
    },
    source: "Portfolio Functional Art Section"
  }
});

const fallbackCatalog = [
  ["red-motion-panel", "Burned Motion / Razorback", "Signature Collection", "Burned Motion Study"],
  ["soul-current", "Submersion", "Fluid Soul Series", "Lettering / Ink Study"],
  ["sunflower-mandala", "Sunflower Mandala", "Nature & Organic", "Pattern Study"],
  ["blue-name-current", "Release", "Signature Collection", "Digital Lettering"],
  ["washed-out", "Washed Out", "Signature Collection", "Digital Lettering"],
  ["lest-we-forget", "Lest We Forget", "Experimental Works", "Digital Collage"],
  ["wood-warning", "We Are Not Descended From Fearful Men", "Nature & Organic", "Wood / Lettering"],
  ["rainline-study", "Rainline Study", "Texture Studies", "Ink Study"],
  ["blue-field", "Blue Field", "Texture Studies", "Texture Study"],
  ["love-texture", "Love Study (Title Pending)", "Words & Expressions", "Mixed Media"],
  ["blessed-water", "Between Waves", "Words & Expressions", "Lettering"],
  ["infinite-love-red", "Electric Love", "Words & Expressions", "Lettering Study"],
  ["infinite-love-violet", "Electric Love, Blue Variation", "Words & Expressions", "Lettering Study"],
  ["you-priceless", "U R Priceless", "Words & Expressions", "Lettering"],
  ["inkspirations-mark", "Inkspirations Studio Mark", "Experimental Works", "Brand Mark"],
  ["studio-blue-card", "Studio Blue Identity Card", "Experimental Works", "Identity Design"],
  ["inkspirations-logo-card", "Inkspirations Logo Lockup", "Experimental Works", "Identity Design"],
  ["say-no-poster", "Say No to Provoke and Blame", "Words & Expressions", "Typographic Poster"],
  ["small-town-teacher", "Small Town Teacher", "Experimental Works", "Identity Mark"]
].map(([stem, title, category, medium]) => ({
  title,
  category,
  collection: category,
  medium,
  src: `assets/images/portfolio/${stem}.jpg`,
  thumb: `assets/images/portfolio/thumbs/${stem}-thumb.jpg`,
  desc: `${title}, a selected ${medium.toLowerCase()} from Inkspirations Studios.`
})).concat([
  {
    title: "Blue Current Coaster Study",
    category: "Functional Art",
    collection: "Coasters & Decorative Tiles",
    medium: "Functional Art / Product Study",
    src: "assets/images/portfolio/coasters/curved-blue-object-coaster-study.jpg",
    thumb: "assets/images/portfolio/coasters/thumbs/curved-blue-object-coaster-study-thumb.jpg",
    inquiryType: "tiles",
    desc: "A curved blue-current coaster study connecting the gallery to useful studio objects."
  },
  {
    title: "Blue Wave Wood Panel",
    category: "Functional Art",
    collection: "Coasters & Decorative Tiles",
    medium: "Wood Panel / Product Study",
    src: "assets/images/portfolio/coasters/blue-wave-wood-panel-functional-art.jpg",
    thumb: "assets/images/portfolio/coasters/thumbs/blue-wave-wood-panel-functional-art-thumb.jpg",
    inquiryType: "tiles",
    desc: "Layered blue movement and hand-finished texture on a wood surface."
  },
  {
    title: "Natural Wood Round",
    category: "Functional Art",
    collection: "Coasters & Decorative Tiles",
    medium: "Wood Round / Product Study",
    src: "assets/images/portfolio/coasters/wood-round-functional-art.jpg",
    thumb: "assets/images/portfolio/coasters/thumbs/wood-round-functional-art-thumb.jpg",
    inquiryType: "tiles",
    desc: "A round wood functional-art study with the natural material kept visible."
  }
]);

function assetPath(path) {
  if (!path) return "";
  if (/^(https?:|data:|blob:|\/|mailto:)/.test(path)) return path;
  return siteBase + path.replace(/^\.\//, "");
}

function imagePath(work, field) {
  const explicit = work[field];
  if (explicit) return assetPath(explicit);
  const file = field === "thumb" ? work.thumbFile : work.file;
  if (!file) return "";
  const folder = imageFolders[work.folder] || imageFolders.artwork;
  return assetPath(`${folder}${file}`);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
}

function visualCard(work) {
  const title = escapeHtml(work.visualLabel || work.title || "Inkspirations Piece");
  const category = escapeHtml(work.category || "Artwork");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">
    <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#06101b"/><stop offset=".55" stop-color="#0174F3"/><stop offset="1" stop-color="#02050c"/></linearGradient></defs>
    <rect width="900" height="620" fill="url(#g)"/><circle cx="170" cy="130" r="180" fill="#56d9ff" opacity=".16"/><circle cx="760" cy="520" r="230" fill="#8ff3e8" opacity=".12"/><rect x="70" y="70" width="760" height="480" fill="none" stroke="#8ff3e8" stroke-opacity=".34" stroke-width="2"/><text x="100" y="155" fill="#8ff3e8" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="7">${category}</text><text x="100" y="310" fill="#ffe6ad" font-family="Georgia, serif" font-size="62">${title}</text><text x="100" y="405" fill="#f6f3e8" opacity=".72" font-family="Arial, sans-serif" font-size="28">INKSPIRATIONS STUDIOS</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeWork(work, index) {
  if (typeof work === "string") {
    const fileName = work.split("/").pop() || `artwork-${index + 1}`;
    return { index, title: fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), category: "Artwork", medium: "Artwork", folder: "artwork", file: work };
  }
  const category = work.category || work.collection || work.type || "Artwork";
  const printUrl = work.printUrl || work.printHref || "";
  return { ...work, index, category, medium: work.medium || work.type || category, title: work.title || `Gallery Piece ${index + 1}`, status: work.status || "Available", price: work.price || "Price Upon Request", dimensions: work.dimensions || "Dimensions coming soon", printUrl, printAvailable: Boolean(work.printAvailable), originalAvailable: Boolean(work.originalAvailable), inquiryType: work.inquiryType || "prints", purchaseLabel: work.purchaseLabel || "" };
}

function categoryId(category) { return String(category || "artwork").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function filterLabel(category) { return String(category || "Artwork").replace(/\s*\/\s*/g, " / "); }
function workText(work) { return [work.title, work.type, work.medium, work.collection, work.category, work.desc].filter(Boolean).join(" ").toLowerCase(); }
function productTypesForWork(work) {
  const text = [work.category, work.collection, work.type, work.medium, work.title].filter(Boolean).join(" ").toLowerCase();
  if (text.includes("functional") || text.includes("coaster")) return ["tile", "original", "commission", "contact"];
  if (text.includes("writing") || text.includes("poem")) return ["print", "commission", "contact"];
  if (text.includes("words") || text.includes("lettering") || text.includes("typographic")) return ["tshirt", "print", "tile", "commission", "contact"];
  if (text.includes("wood") || text.includes("burn")) return ["original", "print", "tile", "commission", "contact"];
  if (text.includes("identity") || text.includes("brand") || text.includes("logo")) return ["print", "tshirt", "commission", "contact"];
  return ["print", "original", "tile", "commission", "contact"];
}
function workKind(work) {
  const text = [work.inquiryType, work.category, work.collection, work.type, work.medium, work.title].filter(Boolean).join(" ").toLowerCase();
  if (text.includes("coaster") || text.includes("functional") || text.includes("tile") || text.includes("table")) return "table";
  if (text.includes("wood") || text.includes("burn")) return "wood";
  if (text.includes("original")) return "original";
  return "artwork";
}
function bringHomePayload(work) {
  const image = imagePath(work, "src") || imagePath(work, "thumb");
  return { id: `portfolio-${work.index ?? categoryId(work.title)}`, title: work.title, image, description: work.desc || "Selected Inkspirations Studios work.", about: work.desc || "A selected piece from the Inkspirations Studios portfolio.", medium: work.medium || work.category, products: work.products || productTypesForWork(work), acquisitionPaths: work.acquisitionPaths, recommendations: work.recommendations || { artwork: work.category, room: work.category === "Writing / Poem" ? "Writing Room" : "Ocean of Ink", playlist: "Rainstorm Studio Atmosphere" }, source: "Portfolio Gallery" };
}
function askHref(work) {
  const subject = `Inquiry about ${work.title}`;
  const body = `Hi Robert, I am interested in ${work.title}. Is this available as a print, original, coaster, functional artwork, or custom piece?`;
  return `mailto:r.marleton@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function printHref(work) { return work.printAvailable && work.printHref ? assetPath(work.printHref) : ""; }
function primaryAction(work) {
  const href = printHref(work);
  const reserved = String(work.status || "").toLowerCase().includes("reserved");
  if (href) return { href, label: "Order a Print", external: true };
  if (reserved) return { href: askHref(work), label: "Reserve This Piece", external: false };
  if (work.purchaseLabel) return { href: askHref(work), label: work.purchaseLabel, external: false };
  const kind = workKind(work);
  if (kind === "table") return { href: askHref(work), label: "Bring It to Your Table", external: false };
  if (kind === "wood") return { href: askHref(work), label: "Bring This Home", external: false };
  if (kind === "original" || work.originalAvailable) return { href: askHref(work), label: "Bring This Piece Home", external: false };
  return { href: askHref(work), label: "Ask About This Piece", external: false };
}

function filtersForWorks() {
  const categories = Array.from(new Map(works.map((work) => [categoryId(work.category), filterLabel(work.category)])).entries());
  return [{ id: "all", label: "All" }, ...categories.map(([id, label]) => ({ id, label }))];
}
function matchesFilter(work) { return activeFilter === "all" || categoryId(work.category) === activeFilter; }
function filteredWorks() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = works.filter(matchesFilter).filter((work) => !term || workText(work).includes(term));
  if (sortMode === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sortMode === "category") filtered.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  return filtered;
}
function renderFilters() {
  filterRow.innerHTML = filtersForWorks().map((filter) => {
    const selected = filter.id === activeFilter ? ' aria-pressed="true"' : ' aria-pressed="false"';
    return `<button class="filter-chip" type="button" data-filter="${filter.id}"${selected}>${escapeHtml(filter.label)}</button>`;
  }).join("");
}
function renderGallery() {
  visibleWorks = filteredWorks();
  galleryCount.textContent = `${visibleWorks.length} / ${works.length} Entries`;
  emptyGallery.hidden = visibleWorks.length > 0;
  galleryGrid.innerHTML = visibleWorks.map((work, position) => {
    const thumb = imagePath(work, "thumb") || imagePath(work, "src") || visualCard(work);
    const full = imagePath(work, "src") || thumb;
    const title = escapeHtml(work.title);
    const safeCategory = escapeHtml(work.category);
    const safeMedium = escapeHtml(work.medium);
    const inquiry = escapeHtml(askHref(work));
    return `<article class="gallery-card photographer-card" data-position="${position}"><button class="gallery-open" type="button" data-action="details" aria-label="View details for ${title}"><span class="gallery-image-wrap"><img src="${thumb}" alt="${title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${full}';"></span><span class="gallery-card-copy"><span class="gallery-card-kicker">${safeCategory}</span><span class="gallery-card-title">${title}</span><span class="gallery-card-medium">${safeMedium}</span></span></button><span class="gallery-card-actions"><button class="mini-action" type="button" data-action="details">View Details</button><a class="mini-action" href="${inquiry}" data-action="inquiry">Ask About This Piece</a></span></article>`;
  }).join("");
}

function scrollToFirstResult() {
  const firstCard = galleryGrid.querySelector(".gallery-card");
  if (!firstCard) return;
  requestAnimationFrame(() => {
    const top = firstCard.getBoundingClientRect().top + window.pageYOffset - 12;
    window.scrollTo({ top, left: 0, behavior: "smooth" });
  });
}

function openLightbox(position) {
  if (!visibleWorks.length) return;
  lastGalleryTrigger = document.activeElement;
  activeIndex = (position + visibleWorks.length) % visibleWorks.length;
  const work = visibleWorks[activeIndex];
  modalImg.src = imagePath(work, "src") || imagePath(work, "thumb") || visualCard(work);
  modalImg.alt = work.title;
  modalType.textContent = `${activeIndex + 1} / ${visibleWorks.length} - ${work.medium || work.type || work.category || "Artwork"}`;
  modalTitle.textContent = work.title;
  modalDesc.textContent = work.desc || "Selected Inkspirations Studios work.";
  modalStatus.textContent = work.status || "Available";
  modalPrice.textContent = work.price || "Price Upon Request";
  modalDimensions.textContent = work.dimensions || "Dimensions coming soon";
  modalMedium.textContent = work.medium || "Artwork";
  if (modalPrimaryAction) {
    const action = primaryAction(work);
    modalPrimaryAction.href = action.href;
    modalPrimaryAction.textContent = action.label;
    if (action.external) { modalPrimaryAction.target = "_blank"; modalPrimaryAction.rel = "noopener"; }
    else { modalPrimaryAction.removeAttribute("target"); modalPrimaryAction.removeAttribute("rel"); }
  }
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.getElementById("closeModal").focus({ preventScroll: true });
}
function closeModal() {
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastGalleryTrigger instanceof HTMLElement) lastGalleryTrigger.focus({ preventScroll: true });
}
function moveLightbox(direction) { if (modal.classList.contains("open")) openLightbox(activeIndex + direction); }

async function loadGallery() {
  works = fallbackCatalog.map(normalizeWork);
  renderFilters();
  renderGallery();
  try {
    const response = await fetch(assetPath(galleryDataUrl), { cache: "no-store" });
    if (!response.ok) throw new Error(`Gallery list returned ${response.status}`);
    const data = await response.json();
    works = (data.works || []).map(normalizeWork);
    renderFilters();
    renderGallery();
  } catch (error) {
    console.warn("Using the built-in gallery catalog because the JSON catalog did not load.", error);
  }
}

filterRow.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  renderFilters();
  renderGallery();
  scrollToFirstResult();
});

gallerySearch.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderGallery();
  clearTimeout(searchScrollTimer);
  searchScrollTimer = setTimeout(scrollToFirstResult, 250);
});

gallerySort.addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderGallery();
  scrollToFirstResult();
});

galleryGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".gallery-card");
  if (!card) return;
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "inquiry") return;
  if (action === "details") openLightbox(Number(card.dataset.position));
});

document.getElementById("modalPrev").addEventListener("click", () => moveLightbox(-1));
document.getElementById("modalNext").addEventListener("click", () => moveLightbox(1));
document.getElementById("closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowRight") moveLightbox(1);
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "Tab" && modal.classList.contains("open")) {
    const focusable = [...modal.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')].filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

loadGallery();