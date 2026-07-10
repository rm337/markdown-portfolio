# Portfolio Gallery Installation

Date: 2026-07-09
Status: Installed

## What changed

The interactive portfolio gallery package was installed directly into the site repository so Robert does not have to place the files manually.

Installed files:

```text
portfolio-gallery.html
css/portfolio-gallery.css
js/portfolio-gallery.js
data/portfolio-gallery.json
scripts/auto-import-portfolio-images.mjs
docs/portfolio-gallery-installation.md
```

## Live path

```text
https://rm337.github.io/markdown-portfolio/portfolio-gallery.html
```

## Current public gallery content

The live JSON catalog intentionally includes only verified visitor-ready image paths that exist in the repository. At install time, the confirmed image was:

```text
assets/images/portfolio/Fluid_Soul_Front_Cover_edited.png
```

This avoids broken placeholders or fake portfolio depth.

## Future auto-import command

Codex or a repository worker can expand the gallery by running:

```bash
node scripts/auto-import-portfolio-images.mjs --max=60
```

That command scans repository images, copies selected candidates into `assets/images/portfolio/`, and rebuilds `data/portfolio-gallery.json`.

## Visitor-facing rule

The public gallery should show artwork and studio atmosphere. Backend file structures, scripts, AI process language, and implementation notes belong behind the curtain.
