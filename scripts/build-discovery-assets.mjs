import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = "https://rm337.github.io/markdown-portfolio";
const catalogPath = path.join(root, "portfolio.json");
const galleryCatalogPath = path.join(root, "data", "portfolio-gallery.json");
const artworkDir = path.join(root, "artwork");
const portfolioPath = path.join(root, "portfolio.html");
const START = "<!-- DISCOVERY_GALLERY_START -->";
const END = "<!-- DISCOVERY_GALLERY_END -->";

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const works = catalog.works || [];
const galleryCatalog = JSON.parse(fs.readFileSync(galleryCatalogPath, "utf8"));
const catalogAltByTitle = new Map((galleryCatalog.items || []).map((item) => [item.title, item.alt]));

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return String(value || "artwork")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readDimensions(relativePath) {
  const buffer = fs.readFileSync(path.join(root, relativePath));
  if (buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += Math.max(length + 2, 2);
    }
  }
  throw new Error(`Unsupported image dimensions: ${relativePath}`);
}

const entries = works.map((work) => ({
  ...work,
  slug: slugify(work.title),
  alt: catalogAltByTitle.get(work.title) || `${work.title}${work.medium ? `, ${work.medium}` : ""}.`,
  dimensions: readDimensions(work.src),
  thumbDimensions: readDimensions(work.thumb || work.src)
}));

fs.mkdirSync(artworkDir, { recursive: true });

for (const [index, work] of entries.entries()) {
  const canonical = `${baseUrl}/artwork/${work.slug}.html`;
  const imageUrl = `${baseUrl}/${work.src}`;
  const previous = entries[(index - 1 + entries.length) % entries.length];
  const next = entries[(index + 1) % entries.length];
  const title = `${work.title} by Robert Marleton | Inkspirations Studios`;
  const description = work.desc;
  const schema = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: work.title,
    description,
    image: {
      "@type": "ImageObject",
      contentUrl: imageUrl,
      width: work.dimensions.width,
      height: work.dimensions.height,
      caption: `${work.title} by Robert Marleton`
    },
    artMedium: work.medium,
    artform: work.type,
    creator: { "@type": "Person", name: "Robert Marleton", url: `${baseUrl}/` },
    isPartOf: { "@type": "CollectionPage", name: "Inkspirations Studios Gallery", url: `${baseUrl}/portfolio.html` },
    url: canonical
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: "Gallery", item: `${baseUrl}/portfolio.html` },
      { "@type": "ListItem", position: 3, name: work.title, item: canonical }
    ]
  };
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Inkspirations Studios">
  <meta property="og:title" content="${escapeHtml(work.title)} by Robert Marleton">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="${work.dimensions.width}">
  <meta property="og:image:height" content="${work.dimensions.height}">
  <meta property="og:image:alt" content="${escapeHtml(work.alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(work.title)} by Robert Marleton">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${escapeHtml(work.alt)}">
  <link rel="stylesheet" href="../css/artwork-page.css?v=20260807">
  <script type="application/ld+json">${JSON.stringify([schema, breadcrumb]).replaceAll("<", "\\u003c")}</script>
</head>
<body>
  <a class="skip-link" href="#artwork">Skip to artwork</a>
  <header class="site-header"><a href="../index.html">Inkspirations Studios</a><nav aria-label="Primary navigation"><a href="../portfolio.html">Gallery</a><a href="../index.html#about">About</a><a href="../index.html#contact">Contact</a></nav></header>
  <main id="artwork">
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a><span aria-hidden="true">/</span><a href="../portfolio.html">Gallery</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(work.title)}</span></nav>
    <article class="artwork-layout">
      <figure><img src="../${escapeHtml(work.src)}" alt="${escapeHtml(work.alt)}" width="${work.dimensions.width}" height="${work.dimensions.height}" decoding="async" fetchpriority="high"><figcaption>${escapeHtml(work.title)} &middot; ${escapeHtml(work.medium)}</figcaption></figure>
      <div class="artwork-copy"><p class="eyebrow">${escapeHtml(work.collection || work.category)}</p><h1>${escapeHtml(work.title)}</h1><p class="description">${escapeHtml(description)}</p><dl><div><dt>Artist</dt><dd>Robert Marleton</dd></div><div><dt>Medium</dt><dd>${escapeHtml(work.medium)}</dd></div><div><dt>Type</dt><dd>${escapeHtml(work.type)}</dd></div><div><dt>Status</dt><dd>${escapeHtml(work.availability || "Portfolio Only")}</dd></div></dl><div class="actions"><a class="primary" href="../portfolio.html">Return to the Gallery</a><a href="../index.html#contact">Contact Robert</a></div></div>
    </article>
    <nav class="artwork-nav" aria-label="More artwork"><a href="${previous.slug}.html"><span>Previous artwork</span><strong>${escapeHtml(previous.title)}</strong></a><a href="${next.slug}.html"><span>Next artwork</span><strong>${escapeHtml(next.title)}</strong></a></nav>
  </main>
  <footer>Inkspirations Studios &middot; Robert Marleton</footer>
  <script src="../js/site-measurement.js?v=20260807" defer></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(artworkDir, `${work.slug}.html`), html);
}

const staticGallery = entries.map((work) => `      <article class="gallery-card photographer-card discovery-card">
        <a class="gallery-open" href="artwork/${work.slug}.html">
          <span class="gallery-image-wrap"><img src="${escapeHtml(work.thumb || work.src)}" alt="${escapeHtml(work.alt)}" width="${work.thumbDimensions.width}" height="${work.thumbDimensions.height}" loading="lazy" decoding="async"></span>
          <span class="gallery-card-copy"><span class="gallery-card-kicker">${escapeHtml(work.category)}</span><span class="gallery-card-title">${escapeHtml(work.title)}</span><span class="gallery-card-medium">${escapeHtml(work.medium)}</span></span>
        </a>
      </article>`).join("\n");

let portfolio = fs.readFileSync(portfolioPath, "utf8");
const generatedBlock = `${START}\n${staticGallery}\n      ${END}`;
if (portfolio.includes(START) && portfolio.includes(END)) {
  portfolio = portfolio.replace(new RegExp(`${START}[\\s\\S]*?${END}`), generatedBlock);
} else {
  portfolio = portfolio.replace('<div class="gallery-grid photographer-grid" id="galleryGrid" aria-live="polite"></div>', `<div class="gallery-grid photographer-grid" id="galleryGrid" aria-live="polite">\n      ${generatedBlock}\n      </div>`);
}
fs.writeFileSync(portfolioPath, portfolio);

const lastmod = "2026-08-07";
const publicPages = ["", "portfolio.html", "portfolio-gallery.html", "pricing.html"];
const sitemapUrls = [
  ...publicPages.map((page, index) => `  <url><loc>${baseUrl}/${page}</loc><lastmod>${lastmod}</lastmod><changefreq>${index < 3 ? "weekly" : "monthly"}</changefreq><priority>${index === 0 ? "1.0" : index < 3 ? "0.9" : "0.6"}</priority></url>`),
  ...entries.map((work) => `  <url><loc>${baseUrl}/artwork/${work.slug}.html</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
];
fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join("\n")}\n</urlset>\n`);

const imageEntries = entries.map((work) => `  <url>\n    <loc>${baseUrl}/artwork/${work.slug}.html</loc>\n    <image:image><image:loc>${baseUrl}/${work.src}</image:loc><image:title>${escapeHtml(work.title)}</image:title><image:caption>${escapeHtml(work.desc)}</image:caption></image:image>\n  </url>`);
fs.writeFileSync(path.join(root, "image-sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${imageEntries.join("\n")}\n</urlset>\n`);

console.log(`Generated ${entries.length} artwork pages, crawlable gallery markup, and two sitemaps.`);
