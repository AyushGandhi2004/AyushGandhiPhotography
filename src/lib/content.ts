import { useDemo } from './env';
import { demoContent } from './demo';
import { fetchContent } from './sanity';
import type { Album, Category, Content, Photo } from './types';

let cache: Promise<Content> | undefined;

/** One fetch per build; every page reads from the same snapshot. */
export function getContent(): Promise<Content> {
  cache ??= useDemo ? Promise.resolve(demoContent()) : fetchContent();
  return cache;
}

export function albumsOf(c: Content, category: string): Album[] {
  return c.albums.filter((a) => a.category === category);
}

export function filmsOf(c: Content, category: string) {
  return c.films.filter((f) => f.category === category);
}

/** Every photo in a category: albums first (newest album first, in your order), then loose photos. */
export function photosOf(c: Content, category: Category): Photo[] {
  return [...albumsOf(c, category.slug).flatMap((a) => a.photos), ...category.loose];
}

export function allPhotos(c: Content): Photo[] {
  return c.categories.filter((k) => k.kind === 'photos').flatMap((k) => photosOf(c, k));
}

export function mainCategory(c: Content): Category | undefined {
  return c.categories.find((k) => k.main) ?? c.categories[0];
}

export function categoryTitle(c: Content, slug?: string): string | undefined {
  return c.categories.find((k) => k.slug === slug)?.title;
}

export interface Stats {
  species: number;
  trips: number;
  places: number;
  frames: number;
}

export function stats(c: Content): Stats {
  const photos = allPhotos(c);
  const species = new Set(photos.flatMap((p) => p.species.map((s) => s.id)));
  const main = mainCategory(c);
  const places = new Set(c.albums.map((a) => a.location?.trim().toLowerCase()).filter(Boolean));
  return {
    species: species.size,
    trips: main ? albumsOf(c, main.slug).length : 0,
    places: places.size,
    frames: photos.length,
  };
}

export interface DialMode {
  code: string;
  name: string;
  href: string;
}

/** AUTO first, then categories in dial order. */
export function dialModes(c: Content): DialMode[] {
  return [{ code: 'AUTO', name: 'Auto', href: '/' }, ...c.categories.map((k) => ({ code: k.code, name: k.title, href: k.href }))];
}
