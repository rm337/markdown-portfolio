# Lightroom Export To Website Gallery

Use these settings for selected Lightroom images before adding them to the Inkspirations Studios website gallery.

## Export Settings

1. Select the finished images in Lightroom.
2. Choose `File > Export`.
3. Set `Export To` to a folder on your computer first, such as Desktop or Downloads.
4. In `File Naming`, choose a clear lowercase name style:
   - `blue-current-study.jpg`
   - `round-wood-coaster.jpg`
   - `ink-process-01.jpg`
5. In `File Settings`:
   - Image Format: `JPEG`
   - Color Space: `sRGB`
   - Quality: `80` to `85`
   - Limit File Size: leave unchecked unless an image is still too large
6. In `Image Sizing`:
   - Check `Resize to Fit`
   - Choose `Long Edge`
   - Set long edge to `2048 px`
   - Resolution can be `72` or `96 ppi`
7. In `Output Sharpening`:
   - Check `Sharpen For`
   - Choose `Screen`
   - Amount: `Standard`
8. In `Metadata`:
   - Choose `Copyright Only` or `Copyright & Contact Info Only`
   - Do not include location data.
9. Click `Export`.

## Where To Drop The Files

After export, move the web JPEGs into one of these folders:

- `assets/images/artwork/` for finished artwork and digital pieces
- `assets/images/coasters/` for coaster and functional art images
- `assets/images/wood-art/` for woodburning, wood panels, and physical wood pieces
- `assets/images/process/` for behind-the-scenes or making-of photos

## Updating The Gallery List

Open `portfolio.json` and add one entry inside the `works` list.

Example for a new artwork:

```json
{
  "folder": "artwork",
  "file": "blue-current-study.jpg",
  "title": "Blue Current Study",
  "category": "Signature Collection",
  "medium": "Digital Ink",
  "desc": "A blue ink movement study from Inkspirations Studios.",
  "printHref": "https://pixels.com/featured/your-approved-print-link"
}
```

Example for a coaster:

```json
{
  "folder": "coasters",
  "file": "round-blue-coaster.jpg",
  "title": "Round Blue Coaster",
  "category": "Functional Art",
  "medium": "Coaster / Functional Art",
  "desc": "A usable blue-current coaster study.",
  "acquisitionPaths": ["decorativeTileInquiry", "originalArtworkInquiry", "commissionRequest"]
}
```

The website reads this list automatically. You do not need to edit the gallery HTML for each image.

Keep private notes, source-file names, paid downloads, and internal pricing out of `portfolio.json`. The gallery does not show raw JSON to visitors, but anything committed to a public GitHub Pages site should still be treated as publish-safe.

Preview the gallery through a local website URL or GitHub Pages. Do not rely on double-clicking `portfolio.html`, because browsers often block local JSON loading from `file://` pages.
