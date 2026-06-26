# Inkspirations Studios Portfolio

Public portfolio site for Robert Marleton / Inkspirations Studios.

## Public visitor experience

The public portfolio should feel calm, focused, professional, and easy to understand. First-time employers and clients should only need one clear route:

1. Arrive at `index.html`
2. Review the public portfolio cards
3. Read the short about section
4. Contact Robert by email

### Public pages

- `index.html` - main indexed public portfolio and visitor front door
- `landing.html` - legacy redirect to `index.html`; noindex

### Internal / hidden for now

These files are preserved, but they are not part of the public navigation and should remain `noindex,nofollow` until they are polished for visitors:

- `identity-card.html` - overlaps with the homepage and exposes too many discovery paths
- `guest-registry.html` - useful experiment, but the Slack/export/outbox language feels internal
- `lead-intake.html` - possible future contact page, but currently exposes relay/outbox implementation details
- `site-map.html` - internal organization map, not a visitor-facing site map
- `rooms.html` - internal room hub for draft rooms and experiments
- `beats.html` - BeatForge Studio / Beat Lab experiment
- `flight-deck.html` - immersive music/performance experiment
- `t-shirt-design-lab.html` - future merch concept workshop
- `merch-foundry.html` - future merch/custom-work planning room
- `systems-i-built.html` - promising process page, but still reads like a workshop/draft system

### Supporting files

- `lead-intake.js` - shared static intake helper for local outbox, `mailto:` fallback, JSON export, and optional relay posting
- `rooms.css` - shared room navigation, cards, and atmosphere styles
- `rooms.js` - reusable room data, cards, active-room detection, and atmosphere controls

## Information architecture notes

- Keep public: Home, Portfolio, About, Contact, Fluid Soul, selected artwork, Ocean of Ink concept, creative systems summary, and direct email.
- Hide for now: rooms, BeatForge, Flight Deck, guest registry, identity card, lead intake, merch labs, and raw systems/workflow pages.
- Move later: polished case studies can graduate into the public Portfolio section once each has a clear audience, outcome, and visitor-facing explanation.
- Simplify overlaps: `rooms.html`, `site-map.html`, and `identity-card.html` all acted as competing hubs; `lead-intake.html` and `guest-registry.html` both acted as forms; `merch-foundry.html` and `t-shirt-design-lab.html` overlap as merch planning spaces.
- Avoid public implementation language: Slack relay, local outbox, JSON export, webhook setup, internal rooms, and draft status should stay in internal pages or documentation.

## Public assets

- `Fluid_Soul_Front_Cover_edited.png` - preview image only

## Private files

Paid downloads, private agents, working copies, brush files, source packs, and archives should stay outside this public repo. They are kept locally in:

`C:\Users\rmarl\OneDrive\Documents\GitHub\Inkspirations-private`

Do not publish `.brushset`, source files, private dashboards, or downloadable paid products in this GitHub Pages repo.

## Lead intake and Slack workflow

The public site stays GitHub Pages friendly: leads are saved to a browser outbox, can open a `mailto:` fallback, and can be copied or downloaded as Slack-ready JSON.

For automatic Slack delivery, point `window.INKSPIRATIONS_LEAD_RELAY_URL` or localStorage key `inkspirationsLeadRelayUrl` to a private relay such as Pipedream, Make, Zapier, or a serverless function. Do not commit a raw Slack incoming webhook URL to this repository.
