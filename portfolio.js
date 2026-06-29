const works = [{"type":"Burned Motion Study","title":"Burned Motion / Razorback","category":"Signature Collection","collection":"Signature Collection","availability":"Portfolio review","src":"assets/images/portfolio/red-motion-panel.jpg","thumb":"assets/images/portfolio/thumbs/red-motion-panel-thumb.jpg","desc":"A red motion study with a charging, animal-like force at the front of the composition. The piece reads as heat, pressure, and forward movement without losing the hand-built surface."},{"type":"Fluid Motion","title":"Soul Current","category":"Fluid Soul Series","collection":"Fluid Soul Series","availability":"Portfolio review","src":"assets/images/portfolio/soul-current.jpg","thumb":"assets/images/portfolio/thumbs/soul-current-thumb.jpg","desc":"A blue fluid-motion piece built around suspended ink, soft pressure, and a quiet sense of depth. It anchors the Fluid Soul direction with movement instead of text."},{"type":"Pattern Study","title":"Sunflower Mandala","category":"Nature \u0026 Organic","collection":"Nature \u0026 Organic","availability":"Portfolio review","src":"assets/images/portfolio/sunflower-mandala.jpg","thumb":"assets/images/portfolio/thumbs/sunflower-mandala-thumb.jpg","desc":"A bright organic pattern study centered on a sunflower form. The piece brings a clear natural counterpoint to the darker current and ink works."},{"type":"Abstract Current","title":"Cross Current","category":"Signature Collection","collection":"Signature Collection","availability":"Portfolio review","src":"assets/images/portfolio/blue-name-current.jpg","thumb":"assets/images/portfolio/thumbs/blue-name-current-thumb.jpg","desc":"A layered blue current study with soft crossing movement and a hidden signature quality. It works as a calmer signature piece between the motion studies and the organic work."},{"type":"Digital Lettering","title":"Release","category":"Signature Collection","collection":"Signature Collection","availability":"Portfolio review","src":"assets/images/portfolio/washed-out.jpg","thumb":"assets/images/portfolio/thumbs/washed-out-thumb.jpg","desc":"A restrained lettering piece with washed blue atmosphere and a quiet sense of letting go. It keeps the message simple while the color field carries the mood."},{"type":"Digital Collage","title":"Electric Bloom","category":"Experimental Works","collection":"Experimental Works","availability":"Portfolio review","src":"assets/images/portfolio/lest-we-forget.jpg","thumb":"assets/images/portfolio/thumbs/lest-we-forget-thumb.jpg","desc":"A high-contrast digital collage where color, light, and rough texture collide. It adds a sharper experimental note to the opening sequence."},{"type":"Wood / Lettering","title":"We Are Not Descended","category":"Nature \u0026 Organic","collection":"Nature \u0026 Organic","availability":"Portfolio review","src":"assets/images/portfolio/wood-warning.jpg","thumb":"assets/images/portfolio/thumbs/wood-warning-thumb.jpg","desc":"A wood-burned lettering piece using the natural round as part of the composition. The cracks, bark edge, and burned marks make the material part of the message."},{"type":"Ink Study","title":"Rainline Notes","category":"Texture Studies","collection":"Texture Studies","availability":"Portfolio review","src":"assets/images/portfolio/rainline-study.jpg","thumb":"assets/images/portfolio/thumbs/rainline-study-thumb.jpg","desc":"A vertical texture study with repeated lines, soft color, and rainlike rhythm. It supports the studio atmosphere without taking over the main signature collection."},{"type":"Texture Study","title":"Blue Field","category":"Texture Studies","collection":"Texture Studies","availability":"Portfolio review","src":"assets/images/portfolio/blue-field.jpg","thumb":"assets/images/portfolio/thumbs/blue-field-thumb.jpg","desc":"A quiet blue texture field focused on surface, grain, and tonal movement. This piece is kept in Texture Studies so it does not dominate the opening portfolio."},{"type":"Mixed Media","title":"Love, Weathered","category":"Words \u0026 Expressions","collection":"Words \u0026 Expressions","availability":"Portfolio review","src":"assets/images/portfolio/love-texture.jpg","thumb":"assets/images/portfolio/thumbs/love-texture-thumb.jpg","desc":"A weathered word piece where the surface feels scraped, layered, and lived-in. It belongs with the expression works rather than the main signature sequence."},{"type":"Lettering","title":"Blessed Water","category":"Words \u0026 Expressions","collection":"Words \u0026 Expressions","availability":"Portfolio review","src":"assets/images/portfolio/blessed-water.jpg","thumb":"assets/images/portfolio/thumbs/blessed-water-thumb.jpg","desc":"A soft lettering piece set into a pale blue waterlike field. The focus is direct expression supported by a gentle atmospheric surface."},{"type":"Lettering Study","title":"Infinite Love","category":"Words \u0026 Expressions","collection":"Words \u0026 Expressions","availability":"Portfolio review","src":"assets/images/portfolio/infinite-love-red.jpg","thumb":"assets/images/portfolio/thumbs/infinite-love-red-thumb.jpg","desc":"A saturated lettering study built around a bold central word form. It remains available in the portfolio while sitting clearly in Words \u0026 Expressions."},{"type":"Lettering Study","title":"Infinite Love, Blue Variation","category":"Words \u0026 Expressions","collection":"Words \u0026 Expressions","availability":"Portfolio review","src":"assets/images/portfolio/infinite-love-violet.jpg","thumb":"assets/images/portfolio/thumbs/infinite-love-violet-thumb.jpg","desc":"A cooler variation of the Infinite Love lettering study, with deeper blue and violet atmosphere. It has been moved out of the Signature Collection as requested."},{"type":"Lettering","title":"You Are Priceless","category":"Words \u0026 Expressions","collection":"Words \u0026 Expressions","availability":"Portfolio review","src":"assets/images/portfolio/you-priceless.jpg","thumb":"assets/images/portfolio/thumbs/you-priceless-thumb.jpg","desc":"A direct lettering piece centered on reassurance and value. It is grouped with word-based expressions instead of the main signature works."},{"type":"Brand Mark","title":"Inkspirations Studio Mark","category":"Experimental Works","collection":"Experimental Works","availability":"Portfolio review","src":"assets/images/portfolio/inkspirations-mark.jpg","thumb":"assets/images/portfolio/thumbs/inkspirations-mark-thumb.jpg","desc":"A studio mark exploration using blue lettering, splash, and atmosphere. It functions as brand work rather than a core artwork piece."},{"type":"Identity Design","title":"Studio Blue Identity Card","category":"Experimental Works","collection":"Experimental Works","availability":"Portfolio review","src":"assets/images/portfolio/studio-blue-card.jpg","thumb":"assets/images/portfolio/thumbs/studio-blue-card-thumb.jpg","desc":"A compact identity card for Inkspirations Studios. It supports the portfolio by showing the visual system around the artwork."},{"type":"Identity Design","title":"Inkspirations Logo Lockup","category":"Experimental Works","collection":"Experimental Works","availability":"Portfolio review","src":"assets/images/portfolio/inkspirations-logo-card.jpg","thumb":"assets/images/portfolio/thumbs/inkspirations-logo-card-thumb.jpg","desc":"A clean logo lockup pairing calligraphic emphasis with the studio name. It is organized as supporting identity work."},{"type":"Typographic Poster","title":"Say No","category":"Words \u0026 Expressions","collection":"Words \u0026 Expressions","availability":"Portfolio review","src":"assets/images/portfolio/say-no-poster.jpg","thumb":"assets/images/portfolio/thumbs/say-no-poster-thumb.jpg","desc":"A stark typographic poster with a direct message and strong hierarchy. It belongs in Words \u0026 Expressions because the verbal statement is the main subject."},{"type":"Identity Mark","title":"Small Town Teacher","category":"Experimental Works","collection":"Experimental Works","availability":"Portfolio review","src":"assets/images/portfolio/small-town-teacher.jpg","thumb":"assets/images/portfolio/thumbs/small-town-teacher-thumb.jpg","desc":"A small identity mark with a handmade, personal tone. It rounds out the portfolio as a supporting design exploration."}];
works.forEach((work, index) => { work.index = index; });
const filterRow = document.getElementById("filterRow");
const galleryGrid = document.getElementById("galleryGrid");
const gallerySearch = document.getElementById("gallerySearch");
const gallerySort = document.getElementById("gallerySort");
const galleryCount = document.getElementById("galleryCount");
const emptyGallery = document.getElementById("emptyGallery");
const tourToggle = document.getElementById("tourToggle");
const tourPanel = document.getElementById("tourPanel");
const tourImg = document.getElementById("tourImg");
const tourType = document.getElementById("tourType");
const tourTitle = document.getElementById("tourTitle");
const tourDesc = document.getElementById("tourDesc");
const tourCount = document.getElementById("tourCount");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalType = document.getElementById("modalType");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");

let activeFilter = "all";
let searchTerm = "";
let sortMode = "curated";
let visibleWorks = [];
let activeIndex = 0;
let tourIndex = 0;

const siteBase = location.hostname.endsWith("github.io") ? "/markdown-portfolio/" : "";
function assetPath(path) {
  if (!path) return "";
  if (/^(https?:|data:|blob:|file:|\/)/.test(path)) return path;
  return siteBase + path.replace(/^\.\//, "");
}

const filters = [
  { id: "all", label: "All" },
  { id: "signature", label: "Signature Collection" },
  { id: "fluid-soul", label: "Fluid Soul Series" },
  { id: "nature-organic", label: "Nature & Organic" },
  { id: "texture-studies", label: "Texture Studies" },
  { id: "words-expressions", label: "Words & Expressions" },
  { id: "experimental", label: "Experimental Works" }
];

function workText(work) {
  return [work.title, work.type, work.medium, work.collection, work.desc].filter(Boolean).join(" ").toLowerCase();
}

function workCategory(work, index) {
  return work.category || work.collection || work.type || "Artwork";
}

function matchesFilter(work, index) {
  if (activeFilter === "all") return true;
  const category = workCategory(work, index);
  const categoryId = category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const aliases = {
    "signature": "signature-collection",
    "fluid-soul": "fluid-soul-series",
    "nature-organic": "nature-and-organic",
    "texture-studies": "texture-studies",
    "words-expressions": "words-and-expressions",
    "experimental": "experimental-works"
  };
  return categoryId === (aliases[activeFilter] || activeFilter);
}

function filteredWorks() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = works
    .map((work, index) => ({ ...work, index, category: workCategory(work, index) }))
    .filter((work) => matchesFilter(work, work.index))
    .filter((work) => !term || workText(work).includes(term));

  if (sortMode === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
  if (sortMode === "category") filtered.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  return filtered;
}

function renderFilters() {
  filterRow.innerHTML = filters.map((filter) => {
    const selected = filter.id === activeFilter ? ' aria-pressed="true"' : ' aria-pressed="false"';
    return `<button class="filter-chip" type="button" data-filter="${filter.id}"${selected}>${filter.label}</button>`;
  }).join("");
}

function renderGallery() {
  visibleWorks = filteredWorks();
  galleryCount.textContent = `${visibleWorks.length} / ${works.length} Pieces`;
  emptyGallery.hidden = visibleWorks.length > 0;

  galleryGrid.innerHTML = visibleWorks.map((work, position) => {
    const medium = work.medium || work.type || "Artwork";
    const category = work.category || workCategory(work, work.index);
    const thumb = assetPath(work.thumb || work.src);
    const full = assetPath(work.src);
    return `<button class="gallery-card" type="button" data-position="${position}" aria-label="Open ${work.title}">
      <span class="gallery-image-wrap"><img src="${thumb}" alt="${work.title}" loading="eager" decoding="async" onerror="this.onerror=null;this.src='${full}';"></span>
      <span class="gallery-card-copy">
        <span class="gallery-card-kicker">${category}</span>
        <span class="gallery-card-title">${work.title}</span>
        <span class="gallery-card-medium">${medium}</span>
      </span>
    </button>`;
  }).join("");
}

function openLightbox(position) {
  if (!visibleWorks.length) return;
  activeIndex = (position + visibleWorks.length) % visibleWorks.length;
  const work = visibleWorks[activeIndex];
  modalImg.src = assetPath(work.src);
  modalImg.alt = work.title;
  modalType.textContent = `${activeIndex + 1} / ${visibleWorks.length} - ${work.medium || work.type || work.category || "Artwork"}`;
  modalTitle.textContent = work.title;
  modalDesc.textContent = work.desc || "Selected Inkspirations Studios artwork.";
  modal.classList.add("open");
  document.body.classList.add("modal-open");
  document.getElementById("closeModal").focus();
}

function closeModal() {
  modal.classList.remove("open");
  document.body.classList.remove("modal-open");
}

function moveLightbox(direction) {
  if (!modal.classList.contains("open")) return;
  openLightbox(activeIndex + direction);
}

function renderTour() {
  const work = works[tourIndex];
  tourImg.src = assetPath(work.src);
  tourImg.alt = work.title;
  tourType.textContent = work.medium || work.type || "Artwork";
  tourTitle.textContent = work.title;
  tourDesc.textContent = work.desc || "Selected Inkspirations Studios artwork.";
  tourCount.textContent = `Featured: ${tourIndex + 1} of ${works.length}`;
}

function moveTour(direction) {
  tourIndex = (tourIndex + direction + works.length) % works.length;
  renderTour();
}

renderFilters();
renderGallery();
renderTour();

filterRow.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  renderFilters();
  renderGallery();
});

gallerySearch.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderGallery();
});

gallerySort.addEventListener("change", (event) => {
  sortMode = event.target.value;
  renderGallery();
});

galleryGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".gallery-card");
  if (!card) return;
  openLightbox(Number(card.dataset.position));
});

tourToggle.addEventListener("click", () => {
  tourPanel.hidden = !tourPanel.hidden;
  tourToggle.textContent = tourPanel.hidden ? "Curated Tour" : "Hide Tour";
  if (!tourPanel.hidden) renderTour();
});

document.getElementById("tourPrev").addEventListener("click", () => moveTour(-1));
document.getElementById("tourNext").addEventListener("click", () => moveTour(1));
document.getElementById("tourOpen").addEventListener("click", () => {
  const originalPosition = visibleWorks.findIndex((work) => work.index === tourIndex);
  if (originalPosition >= 0) openLightbox(originalPosition);
  else openLightbox(0);
});

document.getElementById("modalPrev").addEventListener("click", () => moveLightbox(-1));
document.getElementById("modalNext").addEventListener("click", () => moveLightbox(1));
document.getElementById("closeModal").addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if (event.key === "ArrowRight") moveLightbox(1);
  if (event.key === "ArrowLeft") moveLightbox(-1);
});



