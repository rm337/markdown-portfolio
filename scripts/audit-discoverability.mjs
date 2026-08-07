import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];
const baseUrl = "https://rm337.github.io/markdown-portfolio/";
const primaryPages = ["index.html", "portfolio.html", "portfolio-gallery.html", "resume.html", "robertisms.html", "pricing.html", "coasters-tiles.html"];
const artworkPages = fs.readdirSync(path.join(root, "artwork")).filter(file => file.endsWith(".html")).map(file => `artwork/${file}`);

function read(file) { return fs.readFileSync(path.join(root, file), "utf8"); }
function matches(html, pattern) { return pattern.test(html); }

for (const file of [...primaryPages, ...artworkPages]) {
  const html = read(file);
  const requirements = [
    [/<title>[^<]{10,}[^<]*<\/title>/i, "meaningful title"],
    [/<meta\s+name=["']description["']\s+content=(?:"[^"]{40,}"|'[^']{40,}')/i, "meta description"],
    [/<meta\s+name=["']robots["']\s+content=["'][^"']*index/i, "index directive"],
    [/<link\s+rel=["']canonical["']\s+href=["']https:\/\//i, "absolute canonical"],
    [/<meta\s+property=["']og:title["']/i, "Open Graph title"],
    [/<meta\s+property=["']og:image["']/i, "Open Graph image"],
    [/<meta\s+name=["']twitter:card["']/i, "Twitter card"],
    [/<script\s+type=["']application\/ld\+json["']>/i, "JSON-LD"]
  ];
  for (const [pattern, label] of requirements) if (!matches(html, pattern)) errors.push(`${file}: missing ${label}`);
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const dynamicViewer = /\bid=["'](?:modalImg|lightboxImage|lightbox-image)["']/i.test(match[0]);
    if (!dynamicViewer && !/\balt=["'][^"']+["']/i.test(match[0])) errors.push(`${file}: image missing meaningful alt text`);
    if (file.startsWith("artwork/") && (!/\bwidth=["']\d+/i.test(match[0]) || !/\bheight=["']\d+/i.test(match[0]))) errors.push(`${file}: artwork image missing dimensions`);
  }
}

for (const sitemap of ["sitemap.xml", "image-sitemap.xml"]) {
  const xml = read(sitemap);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (!urls.length) errors.push(`${sitemap}: contains no URLs`);
  if (new Set(urls).size !== urls.length) errors.push(`${sitemap}: contains duplicate URLs`);
  if (urls.some(url => !url.startsWith(baseUrl))) errors.push(`${sitemap}: contains a URL outside the canonical site`);
}

const mainSitemap = read("sitemap.xml");
for (const file of artworkPages) {
  const url = `${baseUrl}${file}`;
  if (!mainSitemap.includes(url)) errors.push(`sitemap.xml: missing ${url}`);
}

const robots = read("robots.txt");
if (!robots.includes("image-sitemap.xml")) errors.push("robots.txt: image sitemap is not declared");
if (/Disallow:\s*\/(?:lead-intake|guest-registry)\.html/i.test(robots)) warnings.push("A noindex page is blocked from crawling, so crawlers may not see its noindex directive.");

console.log(JSON.stringify({ indexedPages: primaryPages.length + artworkPages.length, artworkPages: artworkPages.length, errors: errors.length, warnings: warnings.length }, null, 2));
if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
