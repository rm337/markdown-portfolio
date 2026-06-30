const works = [
  {
    type: "Burned Motion Study",
    medium: "Woodburning / Mixed Media",
    title: "Burned Motion / Razorback",
    category: "Signature Collection",
    collection: "Signature Collection",
    src: "assets/images/portfolio/red-motion-panel.jpg",
    thumb: "assets/images/portfolio/thumbs/red-motion-panel-thumb.jpg",
    desc: "A red motion study with a charging razorback form and a rough, energetic surface. The piece leads the portfolio as a signature work."
  },
  {
    type: "Fluid Motion",
    medium: "Digital / Fluid Study",
    title: "Soul Current",
    category: "Fluid Soul Series",
    collection: "Fluid Soul Series",
    src: "assets/images/portfolio/soul-current.jpg",
    thumb: "assets/images/portfolio/thumbs/soul-current-thumb.jpg",
    desc: "A blue fluid-motion piece built around suspended color, soft pressure, and depth. It anchors the Fluid Soul direction."
  },
  {
    type: "Pattern Study",
    medium: "Digital Pattern",
    title: "Sunflower Mandala",
    category: "Nature & Organic",
    collection: "Nature & Organic",
    src: "assets/images/portfolio/sunflower-mandala.jpg",
    thumb: "assets/images/portfolio/thumbs/sunflower-mandala-thumb.jpg",
    desc: "A bright organic pattern study centered on a sunflower form. The piece adds warmth and structure to the collection."
  },
  {
    type: "Abstract Current",
    medium: "Digital / Abstract",
    title: "Cross Current",
    category: "Signature Collection",
    collection: "Signature Collection",
    src: "assets/images/portfolio/blue-name-current.jpg",
    thumb: "assets/images/portfolio/thumbs/blue-name-current-thumb.jpg",
    desc: "A layered blue current study with crossing movement and a quiet name-form quality. It sits between abstract surface and studio identity."
  },
  {
    type: "Digital Lettering",
    medium: "Lettering / Digital",
    title: "Release",
    category: "Signature Collection",
    collection: "Signature Collection",
    src: "assets/images/portfolio/washed-out.jpg",
    thumb: "assets/images/portfolio/thumbs/washed-out-thumb.jpg",
    desc: "A restrained lettering piece set into a washed blue field. The composition keeps the message simple and atmospheric."
  },
  {
    type: "Digital Collage",
    medium: "Digital Collage",
    title: "Electric Bloom",
    category: "Experimental Works",
    collection: "Experimental Works",
    src: "assets/images/portfolio/lest-we-forget.jpg",
    thumb: "assets/images/portfolio/thumbs/lest-we-forget-thumb.jpg",
    desc: "A compact digital collage with bright color, layered texture, and sharp contrast. It gives the collection a more experimental edge."
  },
  {
    type: "Wood / Lettering",
    medium: "Woodburning / Lettering",
    title: "We Are Not Descended",
    category: "Nature & Organic",
    collection: "Nature & Organic",
    src: "assets/images/portfolio/wood-warning.jpg",
    thumb: "assets/images/portfolio/thumbs/wood-warning-thumb.jpg",
    desc: "A wood-burned lettering piece that uses the natural round as part of the composition. The bark edge, cracks, and burned marks carry the material character."
  },
  {
    type: "Ink Study",
    medium: "Texture / Ink Study",
    title: "Rainline Notes",
    category: "Texture Studies",
    collection: "Texture Studies",
    src: "assets/images/portfolio/rainline-study.jpg",
    thumb: "assets/images/portfolio/thumbs/rainline-study-thumb.jpg",
    desc: "A vertical texture study built from repeated marks and soft blue movement. It reads as surface, rhythm, and weather."
  },
  {
    type: "Texture Study",
    medium: "Digital Texture",
    title: "Blue Field",
    category: "Texture Studies",
    collection: "Texture Studies",
    src: "assets/images/portfolio/blue-field.jpg",
    thumb: "assets/images/portfolio/thumbs/blue-field-thumb.jpg",
    desc: "A quiet blue texture field focused on grain, tone, and surface movement. It functions as a supporting study rather than a main signature piece."
  },
  {
    type: "Mixed Media",
    medium: "Lettering / Texture",
    title: "Love, Weathered",
    category: "Words & Expressions",
    collection: "Words & Expressions",
    src: "assets/images/portfolio/love-texture.jpg",
    thumb: "assets/images/portfolio/thumbs/love-texture-thumb.jpg",
    desc: "A word-based texture piece with a worn, layered surface. The lettering and background work together as a single weathered field."
  },
  {
    type: "Lettering",
    medium: "Lettering / Water Study",
    title: "Blessed Water",
    category: "Words & Expressions",
    collection: "Words & Expressions",
    src: "assets/images/portfolio/blessed-water.jpg",
    thumb: "assets/images/portfolio/thumbs/blessed-water-thumb.jpg",
    desc: "A soft lettering piece set into a pale blue waterlike field. The open space lets the words and wash breathe."
  },
  {
    type: "Lettering Study",
    medium: "Digital Lettering",
    title: "Infinite Love",
    category: "Words & Expressions",
    collection: "Words & Expressions",
    src: "assets/images/portfolio/infinite-love-red.jpg",
    thumb: "assets/images/portfolio/thumbs/infinite-love-red-thumb.jpg",
    desc: "A saturated lettering study built around a bold central word form. The color and script carry the energy of the piece."
  },
  {
    type: "Lettering Study",
    medium: "Digital Lettering",
    title: "Infinite Love, Blue Variation",
    category: "Words & Expressions",
    collection: "Words & Expressions",
    src: "assets/images/portfolio/infinite-love-violet.jpg",
    thumb: "assets/images/portfolio/thumbs/infinite-love-violet-thumb.jpg",
    desc: "A cooler blue-violet variation of the Infinite Love lettering study. The palette shifts the same phrase into a calmer register."
  },
  {
    type: "Lettering",
    medium: "Digital Lettering",
    title: "You Are Priceless",
    category: "Words & Expressions",
    collection: "Words & Expressions",
    src: "assets/images/portfolio/you-priceless.jpg",
    thumb: "assets/images/portfolio/thumbs/you-priceless-thumb.jpg",
    desc: "A direct lettering piece centered on reassurance and value. It belongs with the word-based expression work."
  },
  {
    type: "Brand Mark",
    medium: "Identity Design",
    title: "Inkspirations Studio Mark",
    category: "Experimental Works",
    collection: "Experimental Works",
    src: "assets/images/portfolio/inkspirations-mark.jpg",
    thumb: "assets/images/portfolio/thumbs/inkspirations-mark-thumb.jpg",
    desc: "A studio mark exploration using blue lettering, splash, and atmosphere. It supports the identity system around the artwork."
  },
  {
    type: "Identity Design",
    medium: "Identity Design",
    title: "Studio Blue Identity Card",
    category: "Experimental Works",
    collection: "Experimental Works",
    src: "assets/images/portfolio/studio-blue-card.jpg",
    thumb: "assets/images/portfolio/thumbs/studio-blue-card-thumb.jpg",
    desc: "A compact identity card for Inkspirations Studios. It presents the studio voice in a clean public-facing format."
  },
  {
    type: "Identity Design",
    medium: "Identity Design",
    title: "Inkspirations Logo Lockup",
    category: "Experimental Works",
    collection: "Experimental Works",
    src: "assets/images/portfolio/inkspirations-logo-card.jpg",
    thumb: "assets/images/portfolio/thumbs/inkspirations-logo-card-thumb.jpg",
    desc: "A clean logo lockup pairing calligraphic emphasis with the studio name. It is organized as supporting identity work."
  },
  {
    type: "Typographic Poster",
    medium: "Typographic Poster",
    title: "Say No",
    category: "Words & Expressions",
    collection: "Words & Expressions",
    src: "assets/images/portfolio/say-no-poster.jpg",
    thumb: "assets/images/portfolio/thumbs/say-no-poster-thumb.jpg",
    desc: "A stark typographic poster built from scale, contrast, and compression. The direct wording gives the piece its structure."
  },
  {
    type: "Identity Mark",
    medium: "Identity Design",
    title: "Small Town Teacher",
    category: "Experimental Works",
    collection: "Experimental Works",
    src: "assets/images/portfolio/small-town-teacher.jpg",
    thumb: "assets/images/portfolio/thumbs/small-town-teacher-thumb.jpg",
    desc: "A compact identity mark with a handmade, personal tone. It shows a softer side of the studio system."
  },
  {
    type: "Project",
    medium: "Functional Art / Product Study",
    title: "Inkspirations Coasters / Functional Art",
    category: "Functional Art",
    collection: "Functional Art",
    projectHref: "merch-foundry.html#coasters",
    visualLabel: "Coaster Image Slots",
    desc: "A functional art project for coaster sets, usable surfaces, and product-ready studio objects. Final coaster photos can be added into the prepared image slots."
  },
  {
    type: "Writing",
    medium: "Writing / Poem",
    title: "Robert's Poem / Writing Piece",
    category: "Writing / Poem",
    collection: "Writing / Poem",
    projectHref: "portfolio.html#writing",
    visualLabel: "Poem Text Feature",
    desc: "A dedicated writing feature for Robert's poem and the language side of Inkspirations Studios. The text slot is ready for the final poem copy."
  }
];

works.forEach((work, index) => { work.index = index; });

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

let activeFilter = "all";
let searchTerm = "";
let sortMode = "curated";
let visibleWorks = [];
let activeIndex = 0;

const siteBase = location.hostname.endsWith("github.io") ? "/markdown-portfolio/" : "";

function assetPath(path) {
  if (!path) return "";
  if (/^(https?:|data:|blob:|\/)/.test(path)) return path;
  return siteBase + path.replace(/^\.\//, "");
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
}

function visualCard(work) {
  const title = escapeHtml(work.visualLabel || work.title);
  const category = escapeHtml(work.category || "Project");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#06101b"/>
        <stop offset=".55" stop-color="#0174F3"/>
        <stop offset="1" stop-color="#02050c"/>
      </linearGradient>
    </defs>
    <rect width="900" height="620" fill="url(#g)"/>
    <circle cx="170" cy="130" r="180" fill="#56d9ff" opacity=".16"/>
    <circle cx="760" cy="520" r="230" fill="#8ff3e8" opacity=".12"/>
    <rect x="70" y="70" width="760" height="480" fill="none" stroke="#8ff3e8" stroke-opacity=".34" stroke-width="2"/>
    <text x="100" y="155" fill="#8ff3e8" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="7">${category}</text>
    <text x="100" y="310" fill="#ffe6ad" font-family="Georgia, serif" font-size="62">${title}</text>
    <text x="100" y="405" fill="#f6f3e8" opacity=".72" font-family="Arial, sans-serif" font-size="28">INKSPIRATIONS STUDIOS</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const filters = [
  { id: "all", label: "All" },
  { id: "signature", label: "Signature" },
  { id: "fluid-soul", label: "Fluid Soul" },
  { id: "nature-organic", label: "Nature" },
  { id: "texture-studies", label: "Texture" },
  { id: "words-expressions", label: "Words" },
  { id: "functional-art", label: "Functional Art" },
  { id: "writing-poem", label: "Writing" },
  { id: "experimental", label: "Experimental" }
];

function workText(work) {
  return [work.title, work.type, work.medium, work.collection, work.category, work.desc].filter(Boolean).join(" ").toLowerCase();
}

function workCategory(work) {
  return work.category || work.collection || work.type || "Artwork";
}

function categoryId(category) {
  return category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function matchesFilter(work) {
  if (activeFilter === "all") return true;
  const aliases = {
    "signature": "signature-collection",
    "fluid-soul": "fluid-soul-series",
    "nature-organic": "nature-and-organic",
    "texture-studies": "texture-studies",
    "words-expressions": "words-and-expressions",
    "functional-art": "functional-art",
    "writing-poem": "writing-poem",
    "experimental": "experimental-works"
  };
  return categoryId(workCategory(work)) === (aliases[activeFilter] || activeFilter);
}

function filteredWorks() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = works
    .map((work, index) => ({ ...work, index, category: workCategory(work) }))
    .filter(matchesFilter)
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
  galleryCount.textContent = `${visibleWorks.length} / ${works.length} Entries`;
  emptyGallery.hidden = visibleWorks.length > 0;

  galleryGrid.innerHTML = visibleWorks.map((work, position) => {
    const medium = work.medium || work.type || "Artwork";
    const category = work.category || workCategory(work);
    const thumb = work.src ? assetPath(work.thumb || work.src) : visualCard(work);
    const full = work.src ? assetPath(work.src) : thumb;
    const title = escapeHtml(work.title);
    const safeCategory = escapeHtml(category);
    const safeMedium = escapeHtml(medium);
    return `<button class="gallery-card photographer-card" type="button" data-position="${position}" aria-label="Open ${title}">
      <span class="gallery-image-wrap"><img src="${thumb}" alt="${title}" loading="eager" decoding="async" onerror="this.onerror=null;this.src='${full}';"></span>
      <span class="gallery-card-copy">
        <span class="gallery-card-kicker">${safeCategory}</span>
        <span class="gallery-card-title">${title}</span>
        <span class="gallery-card-medium">${safeMedium}</span>
      </span>
    </button>`;
  }).join("");
}

function openLightbox(position) {
  if (!visibleWorks.length) return;
  activeIndex = (position + visibleWorks.length) % visibleWorks.length;
  const work = visibleWorks[activeIndex];
  modalImg.src = work.src ? assetPath(work.src) : visualCard(work);
  modalImg.alt = work.title;
  modalType.textContent = `${activeIndex + 1} / ${visibleWorks.length} - ${work.medium || work.type || work.category || "Artwork"}`;
  modalTitle.textContent = work.title;
  modalDesc.textContent = work.desc || "Selected Inkspirations Studios work.";
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

renderFilters();
renderGallery();

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
