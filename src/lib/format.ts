import type { PortableTextBlock } from '@portabletext/types';

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'photo';
}

export function formatShutter(t?: number): string | undefined {
  if (!t) return undefined;
  if (t >= 1) return `${Number(t.toFixed(1))} s`;
  return `1/${Math.round(1 / t)} s`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatMonth(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatRange(start?: string, end?: string): string | undefined {
  const a = formatDate(start);
  const b = formatDate(end);
  if (a && b && a !== b) return `${a} – ${b}`;
  return a ?? b;
}

/** EXIF dates look like "2024:03:18 06:42:10"; turn that into ISO. */
export function exifDateToIso(s?: string): string | undefined {
  if (!s) return undefined;
  const m = s.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : undefined;
}

export function plainText(blocks: PortableTextBlock[] = []): string {
  return blocks
    .map((b) => (b._type === 'block' && Array.isArray(b.children) ? b.children.map((c) => ('text' in c ? c.text : '')).join('') : ''))
    .filter(Boolean)
    .join('\n\n');
}

export function readingMinutes(blocks: PortableTextBlock[] = []): number {
  const words = plainText(blocks).split(/\s+/).filter(Boolean).length;
  const images = blocks.filter((b) => b._type === 'photo' || b._type === 'photoPair').length;
  return Math.max(1, Math.round(words / 220 + images * 0.15));
}

export function truncate(s: string | undefined, n = 155): string | undefined {
  if (!s) return undefined;
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
}
