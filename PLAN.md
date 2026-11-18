# Ayush Gandhi Photography — Plan

Status (2026-11-18): **built** — Astro site + Sanity Studio in this repo, running on demo content. Next: the setup checklist in [SETUP.md](SETUP.md).
Mockups: https://claude.ai/artifact/A2qL4pnDKimBSx2MApru24

## Goals

- Show the creative side; minimal like the portfolio, but more visual effects are allowed here.
- Fast and SEO-first: real HTML on first load, photos optimized per device.
- Add photos without touching code or deploying by hand.
- Free tiers only.

## Categories

Starts with Wildlife (main), Street, Astrophotography, Concert, Filmmaking. **Categories are managed in Sanity** — Ayush can add, rename, reorder or delete them (up to 8); the dial, home tiles, footer and sitemap follow automatically.
Every category can hold **optional albums** (Wildlife → trips/locations, Concert → shows, Astro → trips…); photos can also sit directly in a category. Filmmaking items are YouTube/Vimeo embeds.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Astro** (static output) | Same as the portfolio; HTML-first, near-zero JS, JS only on interactive islands (intro, lightbox, effects) |
| Content + admin | **Sanity** (free plan), Studio hosted free at `*.sanity.studio` | Drag-and-drop uploads from laptop or phone; auto EXIF, blur placeholder (LQIP) and color palette extraction |
| Images | **Sanity image CDN** | On-the-fly resize, AVIF/WebP, responsive `srcset`; keeps us off Vercel's image-optimization quota |
| Video | YouTube/Vimeo, click-to-load facade | Poster image only until clicked, no player JS on page load |
| Hosting | **Vercel Hobby**, separate repo/project | Custom subdomain (e.g. `photos.<portfolio-domain>`) via one CNAME, free |
| Updates | Sanity publish webhook → **Vercel deploy hook** | Site rebuilds itself in ~1 min after publishing; pages stay fully static |

```
 You ──upload──▶ Sanity Studio ──publish webhook──▶ Vercel deploy hook
                     │                                    │
                     ▼                                    ▼
            Sanity image CDN ◀──── <img srcset> ──── Static Astro site (Vercel CDN)
```

## Content model (Sanity)

Agreed 2026-11-18 — full detail in [CONTENT-MODEL.md](CONTENT-MODEL.md). In short: photos are dropped in bulk into albums (or directly into a category); species come from a managed list; locations are optional text shown only when filled; the home hero is a rotating pool of 3–6 photos with a Studio hotspot marking where the focus brackets lock; camera GPS is never published.

## Pages

- `/` — intro → home
- `/<category>/` and `/<category>/<album>/` — galleries
- `/<category>/.../<photo>/` — a page per photo (image SEO, shareable); the lightbox opens over the gallery and updates the URL
- `/journal/`, `/journal/<slug>/`
- `/about/`

## Theme and brand (Field HUD)

- **Themes:** follows the visitor's system setting (dark if unknown); a sun/moon button in the header switches light/dark and the choice is remembered (light = the portfolio's Sage Paper colors). Photo viewer pages stay dark.
- **Mode dial:** a camera-style dial at the top right of the nav on every page, with AUTO plus one position per category (two-letter dial codes, e.g. WL · ST · AS · CO · FM), spaced evenly and built from the CMS — up to 8 categories. It shows the current category; AUTO is lit on Home, Journal and About. Picking a position goes to that category page. The dial's positions are real `<a>` links (crawlable, keyboard reachable, ← → to turn); the categories are also listed in the footer.
- **Decided:** dark tokens `#141813` canvas, `#1C211B` surface, `#E7ECDF` text, `#C9DBBE` sage; light tokens `#EEF1E8` canvas, `#1E211C` ink, `#3F5A33` sage ink.
- **Accent:** one sage accent everywhere (no per-mode tints); the dial changes position, not color.
- **Fonts:** Inter Tight (display, 800/700) + Inter (text, 400/500) + JetBrains Mono (readouts, labels, dial), self-hosted — same family as the portfolio.
- **Logo:** "AG" monogram inside sage focus brackets + "Ayush Gandhi" in Inter 500. The bracketed AG alone is the favicon.
- **Content rule:** nothing about Ayush's developer career on this site — no job, no developer portfolio link. About covers photography only.

## Home page

1. Intro animation — plays on the first visit of each session, can be skipped, overlays already-rendered content so it never delays content or SEO.
2. Category tiles — hovering a tile plays a short preview of its photos.
3. Featured frame + story — chosen in Studio.
4. Field stats counter — species / trips / places, computed at build time.
5. Gear & about strip — photography bio only, links to /about.

## Features

- EXIF and gear details in the lightbox.
- Photo stories / journal.
- Light protection: web-size images only, right-click/drag disabled on images, copyright in metadata. No watermark.

## SEO and performance checklist

- Static HTML, unique title/description/canonical per page, Open Graph images.
- JSON-LD: `ImageGallery`, `ImageObject` (with creator/copyright), `BreadcrumbList`, `Article` for stories, `Person`.
- Sitemap + image sitemap, robots.txt.
- Alt text required in the CMS.
- LCP image preloaded with `fetchpriority="high"`; everything below the fold lazy-loaded; blur-up placeholders; fixed aspect ratios (no layout shift).
- Self-hosted fonts; JS budget per page kept small, effects respect `prefers-reduced-motion`.

## Intro and inner pages (decided 2026-11-18)

- **Intro: Focus pull (~3.5s).** The home hero photo starts blurred and dark; focus brackets hunt and lock on the subject (AF-C · LOCKED), the photo pulls into focus, the exposure readout and headline rise in, then the nav fades in. The intro becomes the hero — no overlay to remove, so the real page (and its LCP image) is there from the first frame. Plays once per session, Skip button, silent by default with a sound toggle (shutter click), honours prefers-reduced-motion (skipped).
- **Gallery layout: justified rows** — equal-height rows, every photo uncropped.
- **Photo view: full-screen + HUD toggle** — near-black, photo fills the screen; Info button / i key shows viewfinder brackets and a frosted panel (title, story, location, EXIF); ← → / swipe to browse, Esc to close. Each photo also has its own URL/page for SEO.
- **Pages (approved as mocked):** category (Wildlife: trips + all frames), album (trip hero, meta, species filter, gallery, linked story, prev/next), journal index (category filters), story (reading column, inline photos with EXIF captions, linked album), film (click-to-load player), about (photography only, "What I shoot" by dial code, gear, socials).

## Open items

- Visual direction: first round of 8 mockups done; Viewfinder and Sage Paper (dark) liked, film strip scroll rejected. Second round explores directions close to those two.
- Intro animation concept (decided alongside the mockups).
- Domain: the portfolio domain isn't bought yet; use `*.vercel.app` until then.
