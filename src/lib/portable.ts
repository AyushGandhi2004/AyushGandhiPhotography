import { escapeHTML, toHTML, uriLooksSafe } from '@portabletext/to-html';
import type { PortableTextBlock } from '@portabletext/types';
import { imgUrl, objectPosition, srcset } from './image';
import type { Photo } from './types';

function figureImg(p: Photo, sizes: string): string {
  const src = imgUrl(p.image, 1600);
  const alt = escapeHTML(p.alt);
  const ratio = `${p.image.width} / ${p.image.height}`;
  if (!src) return `<div class="pt-img" role="img" aria-label="${alt}" style="aspect-ratio:${ratio};background:${p.image.tone ?? 'var(--surface)'};background-size:cover"></div>`;
  const bg = p.image.lqip ? `background-image:url(${p.image.lqip});background-size:cover;` : '';
  return `<img class="pt-img" src="${src}" srcset="${srcset(p.image) ?? ''}" sizes="${sizes}" width="${p.image.width}" height="${p.image.height}" alt="${alt}" loading="lazy" decoding="async" draggable="false" style="object-position:${objectPosition(p.image)};${bg}">`;
}

function exifLine(p: Photo): string {
  const e = p.exif;
  return [e.shutter, e.aperture, e.iso && `ISO ${e.iso}`, e.lens].filter(Boolean).join(' · ');
}

function caption(text: string | undefined, p?: Photo): string {
  const bits = [text ?? p?.caption, p && exifLine(p)].filter(Boolean).map((t) => escapeHTML(String(t)));
  return bits.length ? `<figcaption class="mono">${bits.join(' · ')}</figcaption>` : '';
}

function videoEmbed(url?: string): string {
  if (!url || !uriLooksSafe(url)) return '';
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` : vm ? `https://player.vimeo.com/video/${vm[1]}?dnt=1` : undefined;
  if (!src) return `<p><a href="${escapeHTML(url)}" target="_blank" rel="noopener">Watch the video ↗</a></p>`;
  return `<figure class="pt-video"><iframe src="${src}" title="Video" loading="lazy" allow="fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe></figure>`;
}

/** Story body → HTML. Photos get responsive images and an EXIF caption. */
export function renderBody(blocks: PortableTextBlock[]): string {
  return toHTML(blocks, {
    components: {
      types: {
        photo: ({ value }) => (value.photo ? `<figure class="pt-photo protect">${figureImg(value.photo, '(max-width: 960px) 100vw, 1120px')}${caption(undefined, value.photo)}</figure>` : ''),
        photoPair: ({ value }) => {
          const ps: Photo[] = value.photos ?? [];
          if (!ps.length) return '';
          return `<figure class="pt-pair protect">${ps.map((p) => figureImg(p, '(max-width: 760px) 100vw, 560px')).join('')}${caption(value.caption)}</figure>`;
        },
        video: ({ value }) => videoEmbed(value.url),
      },
      marks: {
        link: ({ children, value }) => {
          const href = value?.href ?? '';
          if (!uriLooksSafe(href)) return children;
          const external = /^https?:/.test(href);
          return `<a href="${escapeHTML(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${children}</a>`;
        },
      },
    },
  });
}
