import { createClient } from '@sanity/client';
import type { PortableTextBlock } from '@portabletext/types';
import { apiVersion, dataset, projectId, readToken } from './env';
import { exifDateToIso, formatShutter, readingMinutes, slugify } from './format';
import type { About, Album, Category, Content, Exif, Film, Hero, Img, Photo, Settings, Story } from './types';

/* GROQ projections. `photo` is an image type with extra fields, so asset/crop/hotspot sit on it directly. */
const IMG = `crop, hotspot, asset->{_id, metadata{lqip, dimensions{width, height}}}`;
const PHOTO = `_key, alt, title, caption, location, takenAt, cameraOverride, lensOverride, isCover,
  crop, hotspot, asset->{_id, metadata{lqip, dimensions{width, height}, exif}},
  species[]->{_id, name, scientific}`;
const LINK = `link->{_type, "slug": slug.current, "category": category->slug.current}`;

const QUERY = `{
  "settings": *[_id == "siteSettings"][0]{
    title, tagline, description, ogImage{${IMG}},
    hero[]{...photo{${PHOTO}}, ${LINK}},
    featured{title, story, photo{${PHOTO}}, ${LINK}},
    instagram, youtube
  },
  "about": *[_id == "about"][0]{ portrait{${IMG}, alt}, intro, bio, basedIn, gear[]{kind, name}, software },
  "categories": *[_type == "category"] | order(order asc, title asc){
    _id, title, "slug": slug.current, code, order, kind, main, intro,
    cover{${IMG}, alt}, seoTitle, seoDescription, loose[]{${PHOTO}}
  },
  "albums": *[_type == "album" && defined(category)] | order(dateStart desc){
    _id, title, "slug": slug.current, "category": category->slug.current, location, dateStart, dateEnd,
    description, photos[]{${PHOTO}}, "storyId": story._ref
  },
  "films": *[_type == "film" && defined(category)] | order(featured desc, year desc){
    _id, title, "slug": slug.current, "category": category->slug.current, url, poster{${IMG}},
    description, year, length, role, format, featured
  },
  "stories": *[_type == "story"] | order(publishedAt desc){
    _id, title, "slug": slug.current, "category": category->slug.current, cover{${IMG}, alt}, standfirst, publishedAt,
    "albumId": album._ref,
    body[]{
      ...,
      _type == "photo" => {${PHOTO}},
      _type == "photoPair" => {photos[]{${PHOTO}}}
    }
  }
}`;

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any;

function mapImg(raw: Raw): Img | undefined {
  const dims = raw?.asset?.metadata?.dimensions;
  if (!raw?.asset?._id || !dims) return undefined;
  const c = raw.crop ?? { left: 0, right: 0, top: 0, bottom: 0 };
  const cw = Math.max(0.01, 1 - (c.left ?? 0) - (c.right ?? 0));
  const ch = Math.max(0.01, 1 - (c.top ?? 0) - (c.bottom ?? 0));
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return {
    sanity: { asset: { _id: raw.asset._id }, crop: raw.crop, hotspot: raw.hotspot },
    width: Math.round(dims.width * cw),
    height: Math.round(dims.height * ch),
    lqip: raw.asset.metadata.lqip,
    hotspot: raw.hotspot ? { x: clamp((raw.hotspot.x - (c.left ?? 0)) / cw), y: clamp((raw.hotspot.y - (c.top ?? 0)) / ch) } : undefined,
  };
}

function mapExif(raw: Raw): Exif {
  const e = raw?.asset?.metadata?.exif ?? {};
  const camera = raw?.cameraOverride || [e.Make, e.Model].filter(Boolean).join(' ').trim() || undefined;
  return {
    camera,
    lens: raw?.lensOverride || e.LensModel || undefined,
    shutter: formatShutter(e.ExposureTime),
    aperture: e.FNumber ? `f/${Number(e.FNumber.toFixed(1))}` : undefined,
    iso: e.ISO ?? e.ISOSpeedRatings ? String(e.ISO ?? e.ISOSpeedRatings) : undefined,
    focal: e.FocalLength ? `${Math.round(e.FocalLength)} mm` : undefined,
  };
}

interface PhotoCtx {
  categorySlug: string;
  albumSlug?: string;
  albumTitle?: string;
}

export function photoHref(slug: string, ctx: PhotoCtx): string {
  return ctx.albumSlug ? `/${ctx.categorySlug}/${ctx.albumSlug}/${slug}/` : `/${ctx.categorySlug}/p/${slug}/`;
}

function mapPhoto(raw: Raw, ctx: PhotoCtx): Photo | undefined {
  const image = mapImg(raw);
  if (!image) return undefined;
  const species = (raw.species ?? []).filter(Boolean).map((s: Raw) => ({ id: s._id, name: s.name, scientific: s.scientific }));
  const key: string = raw._key ?? Math.random().toString(36).slice(2, 8);
  const slug = `${slugify(raw.title || species[0]?.name || ctx.albumTitle || 'photo')}-${key.slice(-5).toLowerCase()}`;
  return {
    key,
    slug,
    href: photoHref(slug, ctx),
    image,
    alt: raw.alt || raw.title || species[0]?.name || 'Photograph by Ayush Gandhi',
    title: raw.title || undefined,
    caption: raw.caption || undefined,
    species,
    location: raw.location || undefined,
    takenAt: raw.takenAt || exifDateToIso(raw.asset?.metadata?.exif?.DateTimeOriginal),
    exif: mapExif(raw),
    categorySlug: ctx.categorySlug,
    albumSlug: ctx.albumSlug,
    albumTitle: ctx.albumTitle,
    isCover: Boolean(raw.isCover),
  };
}

function photos(list: Raw[] | undefined, ctx: PhotoCtx): Photo[] {
  return (list ?? []).map((p) => mapPhoto(p, ctx)).filter((p): p is Photo => Boolean(p));
}

function linkHref(link: Raw): string | undefined {
  if (!link?.slug) return undefined;
  if (link._type === 'category') return `/${link.slug}/`;
  if (link._type === 'album' && link.category) return `/${link.category}/${link.slug}/`;
  return undefined;
}

function parseVideo(url?: string): Pick<Film, 'provider' | 'videoId'> {
  if (!url) return { provider: 'other' };
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
  if (yt) return { provider: 'youtube', videoId: yt[1] };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { provider: 'vimeo', videoId: vm[1] };
  return { provider: 'other' };
}

function mapBody(body: Raw[] | undefined, categorySlug: string): PortableTextBlock[] {
  const ctx = { categorySlug };
  return (body ?? []).map((b) => {
    if (b._type === 'photo') return { _type: 'photo', _key: b._key, photo: mapPhoto(b, ctx) };
    if (b._type === 'photoPair') return { _type: 'photoPair', _key: b._key, caption: b.caption, photos: photos(b.photos, ctx) };
    return b;
  }) as PortableTextBlock[];
}

export async function fetchContent(): Promise<Content> {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: 'published',
    token: readToken || undefined,
  });
  const raw: Raw = await client.fetch(QUERY);

  const categories: Category[] = (raw.categories ?? [])
    .filter((c: Raw) => c.slug)
    .map((c: Raw, i: number) => ({
      id: c._id,
      slug: c.slug,
      title: c.title,
      href: `/${c.slug}/`,
      code: (c.code || c.title.slice(0, 2)).toUpperCase(),
      order: c.order ?? i + 1,
      kind: c.kind === 'films' ? 'films' : 'photos',
      main: Boolean(c.main),
      intro: c.intro,
      cover: mapImg(c.cover),
      coverAlt: c.cover?.alt,
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
      loose: photos(c.loose, { categorySlug: c.slug }),
    }));

  const albums: Album[] = (raw.albums ?? [])
    .filter((a: Raw) => a.slug && a.category)
    .map((a: Raw) => {
      const list = photos(a.photos, { categorySlug: a.category, albumSlug: a.slug, albumTitle: a.title });
      return {
        id: a._id,
        slug: a.slug,
        title: a.title,
        href: `/${a.category}/${a.slug}/`,
        category: a.category,
        location: a.location,
        dateStart: a.dateStart,
        dateEnd: a.dateEnd,
        description: a.description,
        cover: list.find((p) => p.isCover) ?? list[0],
        photos: list,
        storyId: a.storyId,
      };
    });

  const films: Film[] = (raw.films ?? [])
    .filter((f: Raw) => f.slug && f.category)
    .map((f: Raw) => ({
      id: f._id,
      slug: f.slug,
      title: f.title,
      href: `/${f.category}/${f.slug}/`,
      category: f.category,
      url: f.url,
      ...parseVideo(f.url),
      poster: mapImg(f.poster),
      description: f.description,
      year: f.year,
      length: f.length,
      role: f.role,
      format: f.format,
      featured: Boolean(f.featured),
    }));

  const stories: Story[] = (raw.stories ?? [])
    .filter((s: Raw) => s.slug)
    .map((s: Raw) => {
      const body = mapBody(s.body, s.category ?? 'journal');
      return {
        id: s._id,
        slug: s.slug,
        title: s.title,
        href: `/journal/${s.slug}/`,
        cover: mapImg(s.cover),
        coverAlt: s.cover?.alt,
        standfirst: s.standfirst,
        publishedAt: s.publishedAt,
        readMins: readingMinutes(body),
        category: s.category,
        body,
        albumId: s.albumId,
      };
    });

  // Hero and featured photos are copies picked in Sanity, not pages of their own.
  // Point each one at the page of the same image in an album or category; otherwise at its link.
  const pageByAsset = new Map<string, string>();
  for (const p of [...albums.flatMap((a) => a.photos), ...categories.flatMap((c) => c.loose)]) {
    const id = (p.image.sanity as { asset?: { _id?: string } } | undefined)?.asset?._id;
    if (id && !pageByAsset.has(id)) pageByAsset.set(id, p.href);
  }
  const linkPhoto = (photo: Photo | undefined, fallback: string): Photo | undefined => {
    if (!photo) return undefined;
    const id = (photo.image.sanity as { asset?: { _id?: string } } | undefined)?.asset?._id;
    return { ...photo, href: (id && pageByAsset.get(id)) || fallback };
  };

  const st: Raw = raw.settings ?? {};
  const mainCat = categories.find((c) => c.main) ?? categories[0];
  const heroCtx = { categorySlug: mainCat?.slug ?? 'photos' };
  const hero: Hero[] = (st.hero ?? [])
    .map((h: Raw) => {
      const link = linkHref(h.link);
      const photo = linkPhoto(mapPhoto(h, heroCtx), link ?? mainCat?.href ?? '/');
      return photo ? { photo, href: link } : undefined;
    })
    .filter(Boolean);
  const featuredLink = linkHref(st.featured?.link);
  const featuredPhoto = linkPhoto(st.featured?.photo ? mapPhoto(st.featured.photo, heroCtx) : undefined, featuredLink ?? mainCat?.href ?? '/');
  const settings: Settings = {
    title: st.title || 'Ayush Gandhi Photography',
    tagline: st.tagline,
    description: st.description,
    ogImage: mapImg(st.ogImage),
    hero,
    featured: featuredPhoto
      ? { photo: featuredPhoto, title: st.featured.title, story: st.featured.story, href: featuredLink }
      : undefined,
    instagram: st.instagram,
    youtube: st.youtube,
  };

  const ab: Raw = raw.about ?? {};
  const about: About = {
    portrait: mapImg(ab.portrait),
    portraitAlt: ab.portrait?.alt,
    intro: ab.intro,
    bio: ab.bio ?? [],
    basedIn: ab.basedIn,
    gear: (ab.gear ?? []).filter((g: Raw) => g?.name),
    software: ab.software,
  };

  return { demo: false, settings, about, categories, albums, films, stories };
}
