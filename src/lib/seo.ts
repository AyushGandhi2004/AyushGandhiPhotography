import { imgUrl } from './image';
import type { Film, Photo, Story } from './types';

const abs = (path: string, site?: URL) => new URL(path, site).href;

/** Photography identity only — no job title or employer on this site. */
export function person(site?: URL, sameAs: (string | undefined)[] = []) {
  return {
    '@type': 'Person',
    name: 'Ayush Gandhi',
    url: site?.href,
    sameAs: sameAs.filter(Boolean),
  };
}

export function breadcrumb(items: { name: string; path: string }[], site?: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path, site) })),
  };
}

export function imageObject(p: Photo, site?: URL) {
  const year = p.takenAt ? new Date(p.takenAt).getUTCFullYear() : new Date().getUTCFullYear();
  return {
    '@type': 'ImageObject',
    contentUrl: imgUrl(p.image, 2000),
    url: abs(p.href, site),
    name: p.title ?? p.species[0]?.name,
    caption: p.caption ?? p.alt,
    description: p.alt,
    width: p.image.width,
    height: p.image.height,
    dateCreated: p.takenAt,
    contentLocation: p.location ? { '@type': 'Place', name: p.location } : undefined,
    creator: person(site),
    creditText: 'Ayush Gandhi',
    copyrightNotice: `© ${year} Ayush Gandhi`,
    copyrightHolder: person(site),
  };
}

export function gallery(name: string, path: string, photos: Photo[], site?: URL, description?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name,
    description,
    url: abs(path, site),
    author: person(site),
    image: photos.slice(0, 30).map((p) => imageObject(p, site)),
  };
}

export function article(s: Story, site?: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: s.title,
    description: s.standfirst,
    datePublished: s.publishedAt,
    image: s.cover ? imgUrl(s.cover, 1600) : undefined,
    author: person(site),
    mainEntityOfPage: abs(s.href, site),
  };
}

export function video(f: Film, site?: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: f.title,
    description: f.description ?? f.title,
    thumbnailUrl: f.poster ? imgUrl(f.poster, 1280) : f.provider === 'youtube' && f.videoId ? `https://i.ytimg.com/vi/${f.videoId}/hqdefault.jpg` : undefined,
    embedUrl:
      f.provider === 'youtube' && f.videoId
        ? `https://www.youtube.com/embed/${f.videoId}`
        : f.provider === 'vimeo' && f.videoId
          ? `https://player.vimeo.com/video/${f.videoId}`
          : undefined,
    contentUrl: f.url,
    uploadDate: f.year && /^\d{4}$/.test(f.year) ? `${f.year}-01-01` : undefined,
    url: abs(f.href, site),
    creator: person(site),
  };
}
