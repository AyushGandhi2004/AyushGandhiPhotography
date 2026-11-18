import { createImageUrlBuilder } from '@sanity/image-url';
import { projectId, dataset } from './env';
import type { Img } from './types';

const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null;

const WIDTHS = [480, 800, 1200, 1600, 2000, 2560];

/**
 * Every URL goes through the image pipeline (resized, re-encoded, auto format),
 * so the original upload and its camera metadata are never served.
 */
export function imgUrl(img: Img, width: number, height?: number): string | undefined {
  if (!builder || !img.sanity) return undefined;
  let b = builder.image(img.sanity as never).width(width).auto('format').quality(76);
  b = height ? b.height(height).fit('crop') : b.fit('max');
  return b.url();
}

export function srcset(img: Img): string | undefined {
  if (!builder || !img.sanity) return undefined;
  const widths = WIDTHS.filter((w) => w <= img.width);
  if (widths.length === 0) widths.push(img.width);
  return widths.map((w) => `${imgUrl(img, w)} ${w}w`).join(', ');
}

/** 1200×630 crop around the hotspot, for social share previews. */
export function ogUrl(img?: Img): string | undefined {
  return img ? imgUrl(img, 1200, 630) : undefined;
}

export function ratio(img: Img): number {
  return img.width && img.height ? img.width / img.height : 1.5;
}

export function objectPosition(img: Img): string {
  const h = img.hotspot;
  return h ? `${(h.x * 100).toFixed(1)}% ${(h.y * 100).toFixed(1)}%` : '50% 50%';
}
