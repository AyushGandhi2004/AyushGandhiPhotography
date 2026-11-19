// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

export default defineConfig({
  // Set SITE_URL in Vercel (and .env) to the real domain once you have it.
  site: env.SITE_URL || 'https://ayushgandhiphotography.vercel.app',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'always' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: { domains: ['cdn.sanity.io'] },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter Tight',
      cssVariable: '--font-display',
      weights: ['700 800'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-text',
      weights: ['400 500'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: ['400 500'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['monospace'],
    },
  ],
});
