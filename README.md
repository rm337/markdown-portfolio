# Inkspirations Studios Portfolio

Public portfolio site for Robert Marleton / Inkspirations Studios.

## Public pages

- `index.html` - main portfolio homepage and public front door
- `identity-card.html` - digital business card and personal discovery hub
- `guest-registry.html` - static guest registry and studio logbook
- `lead-intake.html` - structured lead intake for commissions, contact, prints, brushes, collaborations, and Slack-ready exports
- `lead-intake.js` - shared static intake helper for local outbox, `mailto:` fallback, JSON export, and optional relay posting
- `site-map.html` - visitor-facing navigation map for all public pages
- `rooms.html` - global room hub generated from shared room data
- `rooms.css` - shared room navigation, cards, and atmosphere styles
- `rooms.js` - reusable room data, cards, active-room detection, and atmosphere controls
- `beats.html` - BeatForge Studio / Beat Lab room
- `flight-deck.html` - immersive animated Flight Deck performance page
- `t-shirt-design-lab.html` - creative workshop for future T-shirt concepts
- `merch-foundry.html` - creative command room for merch and custom-work concepts
- `systems-i-built.html` - systems showcase for frameworks, protocols, workflows, and creative operating structures

## Legacy redirects

- `landing.html` - redirects old links to `index.html`; it is not part of the public navigation

## Public assets

- `Fluid_Soul_Front_Cover_edited.png` - preview image only

## Private files

Paid downloads, private agents, working copies, brush files, source packs, and archives should stay outside this public repo. They are kept locally in:

`C:\Users\rmarl\OneDrive\Documents\GitHub\Inkspirations-private`

Do not publish `.brushset`, source files, private dashboards, or downloadable paid products in this GitHub Pages repo.

## Lead intake and Slack workflow

The public site stays GitHub Pages friendly: leads are saved to a browser outbox, can open a `mailto:` fallback, and can be copied or downloaded as Slack-ready JSON.

For automatic Slack delivery, point `window.INKSPIRATIONS_LEAD_RELAY_URL` or localStorage key `inkspirationsLeadRelayUrl` to a private relay such as Pipedream, Make, Zapier, or a serverless function. Do not commit a raw Slack incoming webhook URL to this repository.
