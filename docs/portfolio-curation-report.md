# Portfolio Curation Report

## Project Inventory

HTML:
- `index.html` - public homepage and portfolio front door
- `landing.html` - legacy redirect
- `identity-card.html` - hidden/internal identity hub
- `site-map.html` - hidden/internal studio map
- `rooms.html` - hidden/internal room hub
- `lead-intake.html` - hidden/internal intake form
- `guest-registry.html` - hidden/internal registry experiment
- `beats.html` - hidden/internal BeatForge experiment
- `flight-deck.html` - hidden/internal Flight Deck experiment
- `systems-i-built.html` - hidden/internal systems/process draft
- `merch-foundry.html` - hidden/internal merch planning room
- `t-shirt-design-lab.html` - hidden/internal shirt concept lab

CSS:
- `css/rooms.css` - shared styling for internal room/workshop pages
- Homepage styles are currently embedded in `index.html`

JavaScript:
- `js/rooms.js` - shared internal room data, cards, navigation, and atmosphere helpers
- `js/lead-intake.js` - shared intake, mailto, JSON export, and optional relay helpers
- Several hidden/internal HTML files also contain page-specific inline scripts

Images:
- `assets/images/portfolio/Fluid_Soul_Front_Cover_edited.png` - 1080 x 1080 PNG, 1.2 MB

Videos, icons, fonts:
- No local video files found
- No local icon files found
- No local font files found

Other assets:
- `README.md` - repository and portfolio organization notes
- `LICENSE` - repository license
- `_config.yml` - GitHub Pages/Jekyll configuration
- `.nojekyll` - GitHub Pages behavior file
- `.gitignore` - Git ignore rules
- `.vscode/settings.json` - local editor settings

## Implemented Folder Structure

- `assets/images/portfolio/` - public portfolio artwork
- `css/` - shared stylesheets
- `js/` - shared scripts
- `docs/` - curation and maintenance notes

Recommended future folders when matching assets exist:
- `assets/images/ui/`
- `assets/images/backgrounds/`
- `assets/icons/`
- `assets/video/`
- `archive/`
- `experimental/`

HTML files were left at the project root so existing URLs remain stable. Internal and experimental pages are already hidden from the public journey with `noindex,nofollow`.

## Image Audit

`assets/images/portfolio/Fluid_Soul_Front_Cover_edited.png`
- Recommendation: Hero Image and Featured Artwork
- Why: This is the only finished artwork image currently available in the repository. It has strong color consistency, a clear studio identity, and enough resolution for homepage use. It works best as the singular visual anchor rather than one item in a crowded gallery.
- Quality notes: 1080 x 1080 is appropriate for square hero and featured placements. The 1.2 MB PNG is acceptable for now, but a future WebP export would improve loading performance.
- Cropping/aspect ratio: Square crop is stable and presentation-ready.
- Alt text: Homepage alt text now describes the image content more clearly.

## Homepage Selection

Hero artwork:
- `Fluid_Soul_Front_Cover_edited.png`

Featured portfolio order:
1. Fluid Soul - finished artwork and brand anchor
2. Ocean Of Ink Concept - public-facing creative direction
3. Creative Systems - professional/process signal
4. Contact / Commissions - clear next step

The current repository does not contain three to six distinct finished artwork images, so the homepage should not pretend it does. Quality wins here: one strong artwork plus three supporting portfolio directions feels calmer and more honest than a padded gallery.

Detail images:
- None available yet. Future detail images should be close crops of actual artwork texture, brush marks, product previews, or installation/mockup views.

## Asset Cleanup Recommendations

Duplicates:
- No duplicate image files found.

Unused images:
- No unused image files found.

Temporary or outdated assets:
- No temporary image assets found.
- Internal pages remain useful as experiments, but they should stay hidden until each has a clear visitor purpose.

Assets to keep:
- `assets/images/portfolio/Fluid_Soul_Front_Cover_edited.png`
- `css/rooms.css`
- `js/rooms.js`
- `js/lead-intake.js`

Assets to archive:
- None moved to archive during this pass. There is only one image, and it is in active public use.

## Optimization Notes

Completed:
- Moved the artwork into `assets/images/portfolio/`
- Added explicit `width` and `height` to homepage image uses
- Added high fetch priority to the first hero image
- Added lazy loading to the repeated lower-page image
- Preserved descriptive alt text

Recommended later:
- Export a WebP version of Fluid Soul around 1400 px square for responsive display
- Add a smaller 640 px version for mobile
- Add true detail crops only when source artwork images are available
- Consider extracting homepage CSS into `css/home.css` during a later maintenance pass

## Broken Link And Missing Asset Review

Expected public journey:
- Home
- Portfolio
- About
- Contact

Internal pages:
- Kept available, hidden from indexing, and linked only from internal/noindex surfaces.

Missing assets found during audit:
- None after path updates.
