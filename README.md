# Ayush Gandhi Photography

Photography website — Wildlife, Street, Astrophotography, Concert and Filmmaking (categories are editable).
Astro (static) + Sanity (content and images) on Vercel. Field HUD design: dark-first with a Sage Paper light mode, a camera mode dial for categories, and a Focus-pull intro.

- **First-time setup:** [SETUP.md](SETUP.md) — step-by-step checklist.
- **System design:** [PLAN.md](PLAN.md) · **Content fields:** [CONTENT-MODEL.md](CONTENT-MODEL.md)

## Develop

```bash
npm install
npm run dev        # http://localhost:4321 — demo content until .env has a Sanity project ID
npm run build      # static site in dist/
npm run check      # type-check
npm run studio     # Sanity Studio at http://localhost:3333 (after `npm install` in studio/)
```

## How content gets to the site

Publish in Sanity Studio → Sanity webhook → Vercel deploy hook → static rebuild (~1 min). Drafts don't trigger a rebuild. With no `PUBLIC_SANITY_PROJECT_ID`, the site builds from `src/lib/demo.ts`.

## Where things live

| What | Where |
|---|---|
| Content fetch (one GROQ query per build) | `src/lib/sanity.ts` |
| Demo content | `src/lib/demo.ts` |
| Stats, dial modes, helpers | `src/lib/content.ts` |
| Image URLs (always resized, auto format) | `src/lib/image.ts` |
| Structured data (JSON-LD) | `src/lib/seo.ts` |
| Theme tokens, light/dark | `src/styles/global.css` |
| Mode dial | `src/components/ModeDial.astro` |
| Focus-pull intro + hero pool | `src/components/HeroIntro.astro` |
| Justified gallery / lightbox / photo page | `src/components/Gallery.astro`, `Lightbox.astro`, `PhotoView.astro` |
| Pages | `src/pages/` — `/`, `/<category>/`, `/<category>/<album or film>/`, `/<category>/<album>/<photo>/`, `/<category>/p/<photo>/`, `/journal/`, `/about/` |
| Studio schemas | `studio/schemaTypes/` |
| Starting categories | `studio/seed/categories.ndjson` |

## Further improvements (under development)

- **Lightroom export upload** — publish photos straight from Lightroom Classic (publish service / export preset) into Sanity, as an alternative to uploading through Sanity Studio.
