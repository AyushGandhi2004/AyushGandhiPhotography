import type { PortableTextBlock } from '@portabletext/types';

/** Camera settings shown in readouts; every field is optional because EXIF can be missing. */
export interface Exif {
  camera?: string;
  lens?: string;
  shutter?: string;
  aperture?: string;
  iso?: string;
  focal?: string;
}

export interface Img {
  /** Raw Sanity image object (asset ref, crop, hotspot) for the URL builder. */
  sanity?: unknown;
  width: number;
  height: number;
  /** Tiny blurred placeholder (data URL) from Sanity. */
  lqip?: string;
  /** Focus point, 0–1 on each axis. Drives object-position and the hero's focus brackets. */
  hotspot?: { x: number; y: number };
  /** Demo mode only: CSS background used instead of a real image. */
  tone?: string;
}

export interface Species {
  id: string;
  name: string;
  scientific?: string;
}

export interface Photo {
  key: string;
  slug: string;
  href: string;
  image: Img;
  alt: string;
  title?: string;
  caption?: string;
  species: Species[];
  location?: string;
  takenAt?: string;
  exif: Exif;
  categorySlug: string;
  albumSlug?: string;
  albumTitle?: string;
  isCover?: boolean;
}

export interface StoryRef {
  id: string;
  slug: string;
  title: string;
  href: string;
  cover?: Img;
  coverAlt?: string;
  standfirst?: string;
  publishedAt?: string;
  readMins: number;
  category?: string;
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  href: string;
  category: string;
  location?: string;
  dateStart?: string;
  dateEnd?: string;
  description?: string;
  cover?: Photo;
  photos: Photo[];
  storyId?: string;
}

export type CategoryKind = 'photos' | 'films';

export interface Category {
  id: string;
  slug: string;
  title: string;
  href: string;
  code: string;
  order: number;
  kind: CategoryKind;
  main: boolean;
  intro?: string;
  cover?: Img;
  coverAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  loose: Photo[];
}

export interface Film {
  id: string;
  slug: string;
  title: string;
  href: string;
  category: string;
  url?: string;
  provider: 'youtube' | 'vimeo' | 'other';
  videoId?: string;
  poster?: Img;
  description?: string;
  year?: string;
  length?: string;
  role?: string;
  format?: string;
  featured: boolean;
}

export interface Story extends StoryRef {
  body: PortableTextBlock[];
  albumId?: string;
}

export interface Hero {
  photo: Photo;
  href?: string;
}

export interface Settings {
  title: string;
  tagline?: string;
  description?: string;
  ogImage?: Img;
  hero: Hero[];
  featured?: { photo: Photo; title?: string; story?: string; href?: string };
  instagram?: string;
  youtube?: string;
}

export interface GearItem {
  kind: string;
  name: string;
}

export interface About {
  portrait?: Img;
  portraitAlt?: string;
  intro?: string;
  bio: PortableTextBlock[];
  basedIn?: string;
  gear: GearItem[];
  software?: string;
}

export interface Content {
  demo: boolean;
  settings: Settings;
  about: About;
  categories: Category[];
  albums: Album[];
  films: Film[];
  stories: Story[];
}
