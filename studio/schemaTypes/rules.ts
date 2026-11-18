import type { SlugValidationContext, ValidationContext } from 'sanity';

export const API_VERSION = '2025-10-01';
export const MAX_CATEGORIES = 8;

/** URLs the site already uses at the top level or inside a category. */
export const RESERVED_CATEGORY_SLUGS = ['journal', 'about', 'api', 'studio', 'p', '404', 'robots-txt', 'sitemap-index-xml', 'image-sitemap-xml'];
export const RESERVED_ALBUM_SLUGS = ['p'];

export const publishedId = (id = '') => id.replace(/^drafts\./, '');

export function client(ctx: ValidationContext | SlugValidationContext) {
  return ctx.getClient({ apiVersion: API_VERSION });
}

/** Count other published documents matching a filter, excluding the one being edited. */
export async function countOthers(ctx: ValidationContext, filter: string, params: Record<string, unknown> = {}) {
  const id = publishedId(ctx.document?._id);
  return client(ctx).fetch<number>(`count(*[${filter} && !(_id in path("drafts.**")) && _id != $id])`, { ...params, id });
}
