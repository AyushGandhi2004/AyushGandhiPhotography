# Setup checklist — what you need to do

The code is done. It runs today with **demo content**; these steps connect it to your own Sanity, put it on the internet, and wire up "publish → site updates". Do them in order. Everything here is on free plans.

Time: about 1–1.5 hours for steps 1–9, then however long you want to spend adding photos.

---

## 0. Before you start

- [ ] **Node.js 22.22 or newer** on your Mac (`node -v`). You have 22.23.3 — fine.
- [ ] Accounts (all free; signing in with GitHub is easiest):
  - [ ] **GitHub** — you already have one.
  - [ ] **Vercel** — https://vercel.com/signup (Hobby plan).
  - [ ] **Sanity** — https://www.sanity.io/login (Free plan).

## 1. Look at it locally (optional, 2 minutes)

```bash
cd ~/Documents/Projects/AyushGandhiPhotography
npm install
npm run dev
```

Open http://localhost:4321. Everything in `[brackets]` is placeholder demo content. The footer says "DEMO CONTENT" until Sanity is connected.

## 2. Create the Sanity project

1. [ ] Go to https://www.sanity.io/manage → **Create new project**.
   - Name: `Ayush Gandhi Photography`
   - Plan: **Free**
   - Create the default dataset: name **`production`**, visibility **Public** (the site reads it without a password; nothing private goes in it).
2. [ ] Copy the **Project ID** (shown at the top of the project page, looks like `a1b2c3d4`).
3. [ ] In the project, open **API → CORS origins → Add CORS origin**:
   - `http://localhost:3333` → tick **Allow credentials** → Save. (Lets the Studio run on your Mac.)

## 3. Put the Project ID in two files

```bash
cp .env.example .env
cp studio/.env.example studio/.env
```

- [ ] In **`.env`** set `PUBLIC_SANITY_PROJECT_ID=<your id>` and keep `PUBLIC_SANITY_DATASET=production`.
- [ ] In **`studio/.env`** set `SANITY_STUDIO_PROJECT_ID=<your id>`, and `SANITY_STUDIO_HOST=` to the Studio address you want (e.g. `ayushgandhi` → `ayushgandhi.sanity.studio`; letters, numbers and dashes).

`.env` files are git-ignored — they never get committed.

## 4. Install the Studio and create the five starting categories

```bash
cd studio
npm install
npx sanity login          # opens the browser; log in with the same account
npm run seed              # creates Wildlife, Street, Astrophotography, Concert, Filmmaking + empty Settings/About
npm run dev               # Studio at http://localhost:3333
```

- [ ] Open http://localhost:3333 and check you see **Site settings & home, Categories, Albums, Films, Journal, Species, About**.

## 5. Deploy the Studio (your admin panel on the web)

```bash
cd studio
npm run deploy
```

- [ ] It prints your Studio URL, e.g. **https://ayushgandhi.sanity.studio**. Bookmark it — this is where you'll add photos from now on, from laptop or phone.
- [ ] It may also print an **appId**. Optional: paste it into `studio/sanity.cli.ts` as `deployment: { appId: '…', autoUpdates: true }` to silence the "No appId configured" warning.

## 6. Put the code on GitHub

Create an **empty** repository at https://github.com/new (e.g. `ayush-gandhi-photography`; private or public — both work with Vercel Hobby; don't add a README there). Then:

```bash
cd ~/Documents/Projects/AyushGandhiPhotography
git init -b main
git add .
git commit -m "Photography site: Astro + Sanity"
git remote add origin https://github.com/<your-username>/ayush-gandhi-photography.git
git push -u origin main
```

- [ ] Check on GitHub that **no `.env` file** was pushed (only `.env.example`).

## 7. Deploy the site on Vercel

1. [ ] https://vercel.com/new → **Import** the repository.
2. [ ] Framework preset: **Astro** (auto-detected). Root directory: **leave as the repo root** (not `studio`). Build command / output: leave defaults.
3. [ ] **Environment Variables** — add all three before the first deploy:

   | Name | Value |
   |---|---|
   | `PUBLIC_SANITY_PROJECT_ID` | your project ID |
   | `PUBLIC_SANITY_DATASET` | `production` |
   | `SITE_URL` | `https://<your-project>.vercel.app` for now (no trailing slash) |

4. [ ] **Deploy**. When it finishes, open the `*.vercel.app` URL. The footer should no longer say "DEMO CONTENT" (pages will be mostly empty until you add content).
5. [ ] If you change `SITE_URL` later, redeploy (Deployments → ⋯ → Redeploy).

## 8. Make "Publish" rebuild the site automatically

**8a. Create a deploy hook in Vercel**

- [ ] Vercel → your project → **Settings → Git → Deploy Hooks**.
- [ ] Name: `Sanity publish`, Branch: `main` → **Create Hook**. Copy the URL (keep it private — anyone with it can trigger builds).

**8b. Create a webhook in Sanity**

- [ ] https://www.sanity.io/manage → your project → **API → Webhooks → Create webhook**:

  | Setting | Value |
  |---|---|
  | Name | `Rebuild site` |
  | URL | the Vercel deploy hook URL |
  | Dataset | `production` |
  | Trigger on | **Create**, **Update**, **Delete** |
  | Filter | `_type in ["siteSettings","about","category","album","film","story","species"]` |
  | Projection | leave empty |
  | Status | Enabled |
  | HTTP method | POST |
  | Drafts | **off** (only publishing should rebuild) |

- [ ] Test: change anything in the Studio and **Publish** → within a few seconds a new deployment appears in Vercel → about a minute later the site shows it.

## 9. Fill in your content (in the Studio)

Prepare photos first — **export from Lightroom** like this:

- [ ] JPEG, sRGB, long edge **3000–4000 px**, quality ~85. (The site makes all smaller sizes itself.)
- [ ] Metadata: **"All Except Camera Raw Info"**, tick **Remove Location Info**. This keeps shutter/aperture/ISO/lens (shown on the site) and strips GPS from the file itself. The site never shows GPS anyway, but this keeps it out of the stored original too.
- [ ] Fill in Lightroom's copyright field once (e.g. "© Ayush Gandhi") — it travels with every export.

Then, in the Studio:

1. [ ] **Categories** — for each: write the **Intro** (2 lines; good for Google), optionally a **Home page tile** image. Dial code / order / kind / main are already set; change them whenever you like (max 8 categories, one main).
2. [ ] **Species** — add the species you've photographed (or add them on the fly from a photo).
3. [ ] **Albums** — *Albums → By category → Wildlife → +*:
   - Title, location (optional), dates, a short description.
   - **Drag all the trip's photos onto "Photos" at once.**
   - Open each photo: **Alt text is required** (one short sentence of what's in it); add species; title/caption optional. Mark one as **Use as album cover** if not the first.
   - **Publish.**
4. [ ] **Site settings & home**:
   - **Hero pool**: add 3–6 of your strongest landscape-orientation photos. On each, click the **crop/hotspot** icon and tap the subject — the intro's focus brackets lock there. Optionally link each to its album.
   - **Featured frame**: one photo + title + 2–3 lines of story + link.
   - **Tagline** (the big hero line; text after the first comma goes on line two in sage), **SEO description** (≤160 characters), **Instagram** and **YouTube** URLs.
   - **Publish.**
5. [ ] **About**: portrait (+ hotspot), **Short bio** (2 lines for the home page), **Bio** (photography only), Based in (optional), **Gear** list, editing software (optional). **Publish.**
6. [ ] **Films** (Filmmaking): title, YouTube/Vimeo link, description, year/length/role/format, poster (optional), tick **Featured** on one. **Publish.**
7. [ ] **Journal** (whenever you have a story): title, cover, standfirst, body (paragraphs, photos, photo pairs, pull quotes, videos), category, related album. **Publish.** Then link the album back to the story (*Related journal story*) if you like.

Tips: keep album **locations** spelled consistently ("Tadoba, Maharashtra" every time) — the home page *places* counter counts distinct locations. Changing a category's or album's **web address** later breaks old links.

## 10. Domain (when you buy one)

The photo site lives on a subdomain of your portfolio domain, e.g. `photos.<yourdomain>`.

- [ ] Vercel → photography project → **Settings → Domains → Add** → `photos.<yourdomain>`.
- [ ] If the domain's DNS is on Vercel: nothing else. Otherwise, at your registrar add **CNAME** `photos` → `cname.vercel-dns.com`.
- [ ] Update **`SITE_URL`** in Vercel to `https://photos.<yourdomain>` → Redeploy.
- [ ] In the **portfolio** repo set `photographyUrl` in `src/config/site.ts` to the new address (the portfolio links to the photo site; the photo site intentionally does not link back).

## 11. Google and Bing

- [ ] **Google Search Console** (https://search.google.com/search-console) → Add property → your domain (verify with the DNS TXT record it gives you) → **Sitemaps** → submit `sitemap-index.xml` and `image-sitemap.xml`.
- [ ] **Bing Webmaster Tools** → import the site from Search Console.
- [ ] After a few days, check *Pages* and *Enhancements* in Search Console for errors.

## 12. Things to keep in mind

- **Vercel Hobby is for non-commercial use.** A personal portfolio is fine. If you start selling prints or licensing, move to Vercel Pro or Cloudflare Pages.
- **Free-plan limits**: Sanity's usage page (manage → Usage) shows storage, bandwidth and API requests. A personal photo site is normally well within them; glance at it every few months.
- **Webhook not firing?** Sanity → Webhooks → your webhook → *Attempts log* shows each call. You can always redeploy manually in Vercel.
- **Local preview with real content**: with `.env` filled, `npm run dev` shows your Sanity content on your Mac.

## Optional polish (later)

- [ ] PNG icons for older devices: `public/apple-touch-icon.png` (180×180) and `public/favicon-32.png`, then add `<link>` tags in `src/layouts/Base.astro`.
- [ ] A dedicated social share image in Site settings (1200×630 crop is made automatically).
- [ ] Lightroom export straight into Sanity (README → Further improvements).
