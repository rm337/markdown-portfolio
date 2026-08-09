# Discoverability maintenance

The public site is static and deploys to GitHub Pages from `main`. Its canonical origin is:

`https://rm337.github.io/markdown-portfolio/`

## Updating the artwork catalog

1. Add only Robert-approved artwork and truthful descriptions to `portfolio.json`.
2. Run `node scripts/build-discovery-assets.mjs`.
3. Run `node scripts/audit-discoverability.mjs` and `node scripts/verify-public-site.mjs`.
4. Commit the catalog, generated `artwork/` pages, crawlable gallery markup, and sitemaps together.

The generator creates individual artwork pages, image metadata, a crawlable copy of the gallery, `sitemap.xml`, and `image-sitemap.xml`. Do not hand-edit generated artwork pages; update verified catalog facts and regenerate them.

## Search Console setup (manual)

After the changes are deployed:

1. Open Google Search Console and add the URL-prefix property `https://rm337.github.io/markdown-portfolio/`.
2. Complete Google's requested ownership verification. GitHub Pages usually supports the HTML-file method: download Google's verification file, place it in the repository root without changing its name or contents, deploy, confirm the file's public URL works, and click **Verify**.
3. Submit `https://rm337.github.io/markdown-portfolio/sitemap.xml` under **Sitemaps**. The image sitemap is declared in `robots.txt`; it may also be submitted directly as `https://rm337.github.io/markdown-portfolio/image-sitemap.xml`.
4. Use **URL inspection** to request indexing for the homepage and `portfolio.html` after the deployment is live.

## Analytics setup (optional and manual)

No analytics account or tracking ID is committed. `js/site-measurement.js` records first-touch referral/UTM context in session storage and emits privacy-neutral events for artwork-page visits, outbound links, and contact clicks. It automatically forwards events if a future approved `gtag` or Plausible client is configured.

To activate a provider, Robert must choose and configure the account, then add its provider-supplied script and identifier. Do not commit account secrets. Verify consent and privacy requirements before enabling visitor tracking.

## Accuracy rules

- Keep titles, media, descriptions, status, and image alternatives grounded in the repository and Robert's approval.
- Do not add dimensions, dates, prices, availability, meanings, or external profiles unless verified.
- Keep draft and internal room pages `noindex`; do not add them to the public sitemap until they are intentionally promoted.
