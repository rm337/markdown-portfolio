import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const checked = { pages: 0, links: 0, images: new Set(), audio: new Set(), scripts: new Set(), styles: new Set(), fragments: 0 };
const publicDirectories = ["css", "js"];
const rootFiles = fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name);
const htmlFiles = rootFiles.filter((file) => file.endsWith(".html"));

function cleanReference(reference) {
  return String(reference || "").trim().replace(/^['"]|['"]$/g, "");
}

function isExternal(reference) {
  return /^(?:[a-z]+:|\/\/)/i.test(reference) || reference.startsWith("data:");
}

function checkFile(fromFile, reference, kind) {
  const clean = cleanReference(reference);
  if (!clean || isExternal(clean) || clean === "#") return;
  const [pathname, fragment = ""] = clean.split("#", 2);
  const withoutQuery = pathname.split("?", 1)[0];
  const baseFile = withoutQuery
    ? path.resolve(path.dirname(path.join(root, fromFile)), decodeURIComponent(withoutQuery))
    : path.join(root, fromFile);
  const relative = path.relative(root, baseFile);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    errors.push(`${fromFile}: local reference leaves repository: ${clean}`);
    return;
  }
  checked.links += 1;
  if (!fs.existsSync(baseFile) || !fs.statSync(baseFile).isFile()) {
    errors.push(`${fromFile}: missing ${kind}: ${clean}`);
    return;
  }
  const extension = path.extname(baseFile).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(extension)) checked.images.add(relative);
  if ([".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".mov"].includes(extension)) checked.audio.add(relative);
  if (extension === ".js") checked.scripts.add(relative);
  if (extension === ".css") checked.styles.add(relative);
  if (fs.statSync(baseFile).size === 0) errors.push(`${fromFile}: empty ${kind}: ${clean}`);
  if (fragment && extension === ".html") {
    checked.fragments += 1;
    const target = fs.readFileSync(baseFile, "utf8");
    const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const dynamicRoom = relative.replaceAll("\\", "/") === "rooms.html"
      && new RegExp(`id:\\s*["']${escaped}["']`, "i").test(fs.readFileSync(path.join(root, "js/rooms.js"), "utf8"));
    if (!new RegExp(`(?:id|name)=["']${escaped}["']`, "i").test(target) && !dynamicRoom) {
      errors.push(`${fromFile}: missing fragment #${fragment} in ${relative}`);
    }
  }
}

for (const htmlFile of htmlFiles) {
  checked.pages += 1;
  const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
  for (const match of html.matchAll(/\b(href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const kind = match[1].toLowerCase() === "src" ? "asset" : "link";
    checkFile(htmlFile, match[2], kind);
  }
}

for (const directory of publicDirectories) {
  const directoryPath = path.join(root, directory);
  if (!fs.existsSync(directoryPath)) continue;
  for (const file of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (!file.isFile() || !file.name.endsWith(".css")) continue;
    const relative = path.join(directory, file.name);
    const css = fs.readFileSync(path.join(root, relative), "utf8");
    for (const match of css.matchAll(/url\(([^)]+)\)/gi)) checkFile(relative, match[1], "stylesheet asset");
  }
}

for (const cssFile of rootFiles.filter((file) => file.endsWith(".css"))) {
  const css = fs.readFileSync(path.join(root, cssFile), "utf8");
  for (const match of css.matchAll(/url\(([^)]+)\)/gi)) checkFile(cssFile, match[1], "stylesheet asset");
}

for (const catalog of ["portfolio.json", "data/portfolio-gallery.json"]) {
  const data = JSON.parse(fs.readFileSync(path.join(root, catalog), "utf8"));
  for (const item of data.works || data.items || []) {
    for (const field of ["src", "thumb", "image", "projectHref"]) {
      if (item[field]) checkFile("index.html", item[field], `${catalog} ${field}`);
    }
  }
}

const flightDeck = JSON.parse(fs.readFileSync(path.join(root, "data/flight-deck-tracks.json"), "utf8"));
for (const entry of [...(flightDeck.paths || []), ...(flightDeck.tracks || [])]) checkFile("index.html", entry.url, "data/flight-deck-tracks.json listening path");

function walk(directory, predicate) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "private"].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...walk(full, predicate));
    else if (predicate(full)) results.push(path.relative(root, full));
  }
  return results;
}

for (const imageFile of walk(path.join(root, "assets", "images"), (file) => /\.(?:jpe?g|png|gif|webp|svg)$/i.test(file))) {
  if (fs.statSync(path.join(root, imageFile)).size === 0) errors.push(`${imageFile}: image file is empty`);
  checked.images.add(imageFile);
}

const audioRoot = path.join(root, "assets", "audio");
if (fs.existsSync(audioRoot)) {
  for (const audioFile of walk(audioRoot, (file) => /\.(?:mp3|wav|m4a|ogg|flac|aac|mov)$/i.test(file))) {
    if (fs.statSync(path.join(root, audioFile)).size === 0) errors.push(`${audioFile}: audio file is empty`);
    checked.audio.add(audioFile);
  }
}

const javascriptFiles = walk(root, (file) => /\.(?:js|cjs|mjs)$/i.test(file));
for (const script of javascriptFiles) {
  try {
    execFileSync(process.execPath, ["--check", path.join(root, script)], { stdio: "pipe" });
    checked.scripts.add(script);
  } catch (error) {
    errors.push(`${script}: JavaScript syntax failed: ${String(error.stderr || error.message).trim()}`);
  }
}

const summary = {
  pages: checked.pages,
  localReferences: checked.links,
  images: checked.images.size,
  audioFiles: checked.audio.size,
  JavaScriptFiles: checked.scripts.size,
  stylesheets: checked.styles.size,
  fragments: checked.fragments,
  errors: errors.length
};

console.log(JSON.stringify(summary, null, 2));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
