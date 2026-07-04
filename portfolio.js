const galleryDataUrl = "portfolio.json?v=20260703-gallery-flow";
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

function normalizeWork(work, index) {
  if (typeof work === "string") {
    const fileName = work.split("/").pop() || `artwork-${index + 1}`;
    return {
      index,
      title: fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      category: "Artwork",
      medium: "Artwork",
      folder: "artwork",
      file: work
    };
  }

  const category = work.category || work.collection || work.type || "Artwork";
  const printUrl = work.printUrl || work.printHref || "";
  return {
    ...work,
    index,
    category,
    medium: work.medium || work.type || category,
    title: work.title || `Gallery Piece ${index + 1}`,
    status: work.status || "Available",
    price: work.price || "Price Upon Request",
    dimensions: work.dimensions || "Dimensions coming soon",
    printUrl,
    printAvailable: Boolean(work.printAvailable),
    originalAvailable: Boolean(work.originalAvailable),
    inquiryType: work.inquiryType || "prints",
    purchaseLabel: work.purchaseLabel || ""
  };
}

function categoryId(category) {
  return String(category || "artwork").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function filterLabel(category) {
  return String(category || "Artwork").replace(/\s*\/\s*/g, " / ");
}

function workText(work) {
  return [work.title, work.type, work.medium, work.collection, work.category, work.desc].filter(Boolean).join(" ").toLowerCase();
}

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
  return {
    id: `portfolio-${work.index ?? categoryId(work.title)}`,
    title: work.title,
    image,
    description: work.desc || "Selected Inkspirations Studios work.",
    about: work.desc || "A selected piece from the Inkspirations Studios portfolio.",
    medium: work.medium || work.category,
    products: work.products || productTypesForWork(work),
    acquisitionPaths: work.acquisitionPaths,
    recommendations: work.recommendations || {
      artwork: work.category,
      room: work.category === "Writing / Poem" ? "Writing Room" : "Ocean of Ink",
      playlist: "Rainstorm Studio Atmosphere"
    },
    source: "Portfolio Gallery"
  };
}

function askHref(work) {
  const subject = `Inquiry about ${work.title}`;
  const body = `Hi Robert, I am interested in ${work.title}. Is this available as a print, original, coaster, functional artwork, or custom piece?`;
  return `mailto:r.marleton@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function printHref(work) {
  return work.printAvailable && work.printHref ? assetPath(work.printHref) : "";
}

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

function matchesFilter(work) {
  return activeFilter === "all" || categoryId(work.category) === activeFilter;
}

function filteredWorks() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = works
    .filter(matchesFilter)
    .filter((work) => !term || workText(work).includes(term));

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
    return `<article class="gallery-card photographer-card" data-position="${position}">
      <button class="gallery-open" type="button" data-action="details" aria-label="View details for ${title}">
        <span class="gallery-image-wrap"><img src="${thumb}" alt="${title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${full}';"></span>
        <span class="gallery-card-copy">
          <span class="gallery-card-kicker">${safeCategory}</span>
          <span class="gallery-card-title">${title}</span>
          <span class="gallery-card-medium">${safeMedium}</span>
        </span>
      </button>
      <span class="gallery-card-actions">
        <button class="mini-action" type="button" data-action="details">View Details</button>
      </span>
    </article>`;
  }).join("");
}

function openLightbox(position) {
  if (!visibleWorks.length) return;
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
    if (action.external) {
      modalPrimaryAction.target = "_blank";
      modalPrimaryAction.rel = "noopener";
    } else {
      modalPrimaryAction.removeAttribute("target");
      modalPrimaryAction.removeAttribute("rel");
    }
  }
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

async function loadGallery() {
  try {
    const response = await fetch(assetPath(galleryDataUrl), { cache: "no-store" });
    if (!response.ok) throw new Error(`Gallery list returned ${response.status}`);
    const data = await response.json();
    works = (data.works || []).map(normalizeWork);
    renderFilters();
    renderGallery();
  } catch (error) {
    galleryGrid.innerHTML = "";
    emptyGallery.hidden = false;
    emptyGallery.textContent = "The gallery list could not load yet. Open this page from the website server, then refresh.";
    galleryCount.textContent = "Gallery";
    console.warn("Inkspirations gallery list did not load.", error);
  }
}

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
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "details") openLightbox(Number(card.dataset.position));
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

loadGallery();
