## Goal
Add a new `/muscle-building-guide` content route (SEO-targeted) and wire it into site nav, sitemap, and llms.txt.

## Scope
- New page: `src/pages/MuscleBuildingGuide.tsx`
  - Long-form evidence-based guide covering: protein needs, creatine, beta-alanine, HMB, leucine/EAAs, vitamin D, omega-3, timing, sample stack.
  - Semantic HTML: single `<h1>`, sectioned `<h2>`/`<h3>`, article/section landmarks.
  - Internal links to relevant supplements (Creatine, Protein, Beta-Alanine, HMB) via `/supplement/:id` and to `/stack-builder`.
  - Meta via `<Helmet>`: title (<60 chars), description (<160 chars), canonical, OG/Twitter tags, `Article` JSON-LD.
  - Medical disclaimer block (per project memory).
- Routing: register route in `src/App.tsx`.
- Navigation: add "Muscle Building" entry to `src/components/layout/Header.tsx` `navItems` (desktop + accessible mobile handling — currently mobile only shows first 3; keep same pattern, add to desktop list).
- Discovery:
  - Add URL to `public/sitemap.xml` (priority 0.7, weekly).
  - Add entry to `public/llms.txt` under Pages.

## Technical details
- Route path: `/muscle-building-guide`.
- Uses existing `Layout` wrapper for consistent header/footer.
- No backend changes, no new tables, no data fetching required — static content.
- Keyword focus (from earlier Semrush suggestion): "muscle building supplements".

## Out of scope
- No CMS/database backing for the guide.
- No new supplement entries.
