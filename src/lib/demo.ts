/**
 * Placeholder content used until a Sanity project is connected
 * (PUBLIC_SANITY_PROJECT_ID empty). Text in [brackets] is meant to be replaced in Studio.
 */
import type { PortableTextBlock } from '@portabletext/types';
import { photoHref } from './sanity';
import type { Album, Category, Content, Film, Photo, Story } from './types';

const TONES = {
  wild: 'radial-gradient(120% 90% at 68% 42%,#8a6a3a 0%,#3e3a24 38%,#1b1f14 72%,#0d0f0a 100%)',
  wild2: 'radial-gradient(90% 80% at 35% 55%,#6f7a44 0%,#2e3a1e 45%,#121810 100%)',
  wild3: 'radial-gradient(100% 90% at 50% 30%,#a08560 0%,#4a3d2a 45%,#161410 100%)',
  street: 'radial-gradient(35% 30% at 22% 28%,rgba(230,150,60,.55),transparent 70%),linear-gradient(160deg,#5b5f66 0%,#2b2d31 55%,#141518 100%)',
  astro:
    'radial-gradient(1.5px 1.5px at 18% 22%,#fff,transparent),radial-gradient(1px 1px at 42% 12%,#fff,transparent),radial-gradient(1.5px 1.5px at 64% 30%,#fff,transparent),radial-gradient(1px 1px at 80% 18%,#fff,transparent),radial-gradient(60% 40% at 55% 35%,rgba(120,110,200,.35),transparent 70%),linear-gradient(180deg,#05081a,#16224a 70%,#2a2a3a)',
  concert: 'radial-gradient(60% 50% at 45% 0%,rgba(214,60,160,.8),transparent 70%),radial-gradient(50% 60% at 82% 28%,rgba(60,90,230,.7),transparent 70%),#0b0710',
  film: 'linear-gradient(135deg,#1f4a52 0%,#13262b 50%,#a2643a 130%)',
  portrait: 'linear-gradient(160deg,#3A4436,#1C211B)',
};

const RATIOS = [1.5, 0.67, 1.5, 1.78, 0.8, 1.5, 1.33, 0.67, 1.5, 2.2, 0.75, 1.5, 1.33, 0.8];
const BASE = 2400;

let seq = 0;
function photo(tone: string, ratio: number, categorySlug: string, album?: { slug: string; title: string }, extra: Partial<Photo> = {}): Photo {
  const key = `demo${(seq++).toString(36).padStart(4, '0')}`;
  const slug = `${album ? album.slug : categorySlug}-${key.slice(-4)}`;
  const ctx = { categorySlug, albumSlug: album?.slug, albumTitle: album?.title };
  return {
    key,
    slug,
    href: photoHref(slug, ctx),
    image: { width: Math.round(BASE * Math.min(ratio, 1.8)), height: Math.round((BASE * Math.min(ratio, 1.8)) / ratio), tone, hotspot: { x: 0.62, y: 0.38 } },
    alt: '[Alt text: describe what is in the photo]',
    caption: '[The story behind this frame, a line or two. Written in Studio.]',
    species: categorySlug === 'wildlife' ? [{ id: 'demo-species', name: '[Species]' }] : [],
    location: album ? '[Location]' : undefined,
    exif: { camera: '[Camera]', lens: '[Lens]', shutter: '1/— s', aperture: 'f/—', iso: '—', focal: '— mm' },
    categorySlug,
    albumSlug: album?.slug,
    albumTitle: album?.title,
    ...extra,
  };
}

function album(categorySlug: string, n: number, tones: string[], count: number, date: string): Album {
  const slug = `${categorySlug}-album-${n}`;
  const title = `[${categorySlug === 'wildlife' ? 'Trip / location' : 'Album'} ${n}]`;
  const list = Array.from({ length: count }, (_, i) => photo(tones[i % tones.length], RATIOS[(i + n) % RATIOS.length], categorySlug, { slug, title }));
  return {
    id: `album-${slug}`,
    slug,
    title,
    href: `/${categorySlug}/${slug}/`,
    category: categorySlug,
    location: '[Park, State]',
    dateStart: date,
    description: '[A short paragraph about this trip — the place, the season, what you went looking for. Written in Studio.]',
    cover: list[0],
    photos: list,
  };
}

const cat = (order: number, slug: string, title: string, code: string, tone: string, kind: 'photos' | 'films' = 'photos', main = false): Category => ({
  id: `cat-${slug}`,
  slug,
  title,
  href: `/${slug}/`,
  code,
  order,
  kind,
  main,
  intro: `[Two lines about your ${title.toLowerCase()} work. Written in Studio — this text also helps search engines.]`,
  cover: { width: 1600, height: 2000, tone },
  loose: [],
});

const para = (key: string, text: string): PortableTextBlock => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
});

export function demoContent(): Content {
  seq = 0;
  const W = [TONES.wild, TONES.wild2, TONES.wild3];
  const categories = [
    cat(1, 'wildlife', 'Wildlife', 'WL', TONES.wild, 'photos', true),
    cat(2, 'street', 'Street', 'ST', TONES.street),
    cat(3, 'astrophotography', 'Astrophotography', 'AS', TONES.astro),
    cat(4, 'concert', 'Concert', 'CO', TONES.concert),
    cat(5, 'filmmaking', 'Filmmaking', 'FM', TONES.film, 'films'),
  ];
  categories[1].loose = Array.from({ length: 6 }, (_, i) => photo(TONES.street, RATIOS[i + 2], 'street'));

  const albums: Album[] = [
    album('wildlife', 1, W, 14, '2026-03-12'),
    album('wildlife', 2, W.slice().reverse(), 10, '2025-12-02'),
    album('wildlife', 3, W, 8, '2025-05-20'),
    album('street', 1, [TONES.street], 9, '2025-10-04'),
    album('astrophotography', 1, [TONES.astro], 7, '2025-08-14'),
    album('concert', 1, [TONES.concert], 8, '2025-11-23'),
  ];
  albums[0].storyId = 'story-1';

  const films: Film[] = [1, 2, 3, 4].map((n) => ({
    id: `film-${n}`,
    slug: `film-${n}`,
    title: `[Film title ${n}]`,
    href: `/filmmaking/film-${n}/`,
    category: 'filmmaking',
    provider: 'other',
    poster: { width: 1920, height: 1080, tone: n % 2 ? TONES.film : TONES.wild2 },
    description: '[What the film is about, in a couple of lines.]',
    year: '[Year]',
    length: '[mm:ss]',
    role: '[Shot / edited]',
    format: '[4K · 24p]',
    featured: n === 1,
  }));

  const body: PortableTextBlock[] = [
    para('p1', '[Opening paragraph. Body text is written in Studio as rich text, with photos dropped in between paragraphs.]'),
    para('p2', '[Second paragraph. Set the scene: the place, the weather, the early start.]'),
    { _type: 'photoPair', _key: 'pp', caption: '[Caption for the pair]', photos: [photo(TONES.wild2, 0.8, 'wildlife'), photo(TONES.wild3, 0.8, 'wildlife')] } as unknown as PortableTextBlock,
    para('p3', '[Third paragraph. The wait, the moment, what went right or wrong.]'),
    { _type: 'block', _key: 'q', style: 'blockquote', markDefs: [], children: [{ _type: 'span', _key: 'qs', text: '[A pull quote from the story.]', marks: [] }] },
    para('p4', '[Closing paragraph. What you took away, and what you would do next time.]'),
  ];
  const stories: Story[] = [1, 2, 3].map((n) => ({
    id: `story-${n}`,
    slug: `story-${n}`,
    title: `[Story title ${n}]`,
    href: `/journal/story-${n}/`,
    cover: { width: 2400, height: 1600, tone: [TONES.wild, TONES.astro, TONES.street][n - 1] },
    standfirst: '[One or two sentence summary of the story. Written in Studio.]',
    publishedAt: `2026-0${4 - n}-10`,
    readMins: 4,
    category: ['wildlife', 'astrophotography', 'street'][n - 1],
    body,
    albumId: n === 1 ? albums[0].id : undefined,
  }));

  const heroPhotos = [photo(TONES.wild, 1.6, 'wildlife', undefined, { species: [{ id: 'd', name: '[Species]' }], location: '[Location]' })];

  return {
    demo: true,
    settings: {
      title: 'Ayush Gandhi Photography',
      tagline: 'Patience, then focus.',
      description: 'Wildlife, street, astro and concert photography and short films by Ayush Gandhi.',
      hero: heroPhotos.map((p) => ({ photo: p, href: albums[0].href })),
      featured: { photo: photo(TONES.wild3, 1.5, 'wildlife'), title: '[Photo title]', story: '[Two or three lines on the story behind this frame. Written in Studio.]', href: albums[0].href },
      instagram: undefined,
      youtube: undefined,
    },
    about: {
      portrait: { width: 1600, height: 2000, tone: TONES.portrait },
      intro: '[A few lines about you as a photographer. Written in Studio.]',
      bio: [
        para('b1', '[Your photography story — how you started, why wildlife became your main style, what draws you to the street, the stage and the night sky.]'),
        para('b2', '[A second short paragraph. Written in Studio.]'),
      ],
      basedIn: undefined,
      gear: [
        { kind: 'Body', name: '[Camera body]' },
        { kind: 'Tele', name: '[Telephoto lens]' },
        { kind: 'Wide', name: '[Wide lens]' },
        { kind: 'Misc', name: '[Tripod / other]' },
      ],
      software: undefined,
    },
    categories,
    albums,
    films,
    stories,
  };
}
