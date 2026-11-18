/** Tells search engines which image belongs to which photo page. */
import type { APIRoute } from 'astro';
import { allPhotos, getContent } from '../lib/content';
import { imgUrl } from '../lib/image';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const content = await getContent();
  const entries = allPhotos(content)
    .map((p) => ({ loc: new URL(p.href, site).href, img: imgUrl(p.image, 2000) }))
    .filter((e) => e.img)
    .map((e) => `  <url><loc>${esc(e.loc)}</loc><image:image><image:loc>${esc(e.img!)}</image:loc></image:image></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
