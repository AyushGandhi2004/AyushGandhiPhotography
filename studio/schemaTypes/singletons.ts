import { defineField, defineType } from 'sanity';

export const heroSlide = defineType({
  name: 'heroSlide',
  title: 'Hero photo',
  type: 'object',
  fields: [
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'photo',
      description: 'Click the crop icon and tap the subject: the intro’s focus brackets lock onto that spot.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'link',
      title: 'Links to',
      type: 'reference',
      to: [{ type: 'album' }, { type: 'category' }],
      description: 'Optional. Where “View →” goes.',
    }),
  ],
  preview: { select: { media: 'photo', title: 'photo.title', alt: 'photo.alt' }, prepare: ({ media, title, alt }) => ({ title: title || alt || 'Hero photo', media }) },
});

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'home', title: 'Home page', default: true },
    { name: 'site', title: 'Site & SEO' },
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero pool',
      type: 'array',
      group: 'home',
      of: [{ type: 'heroSlide' }],
      description: '3–6 photos. One is shown per visit, and the intro pulls it into focus.',
      validation: (r) => r.min(1).max(8),
    }),
    defineField({
      name: 'featured',
      title: 'Featured frame',
      type: 'object',
      group: 'home',
      fields: [
        defineField({ name: 'photo', title: 'Photo', type: 'photo' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'story', title: 'Story', type: 'text', rows: 3, description: 'Two or three lines on the story behind this frame.' }),
        defineField({ name: 'link', title: 'Links to', type: 'reference', to: [{ type: 'album' }, { type: 'category' }] }),
      ],
    }),
    defineField({ name: 'title', title: 'Site title', type: 'string', group: 'site', initialValue: 'Ayush Gandhi Photography', validation: (r) => r.required() }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'site',
      description: 'The big hero line. Text after the first comma goes on a second line in sage.',
      initialValue: 'Patience, then focus.',
    }),
    defineField({ name: 'description', title: 'SEO description', type: 'text', rows: 3, group: 'site', validation: (r) => r.max(160) }),
    defineField({ name: 'ogImage', title: 'Social share image', type: 'image', group: 'site', description: 'Optional. Falls back to the first hero photo.', options: { hotspot: true } }),
    defineField({ name: 'instagram', title: 'Instagram URL', type: 'url', group: 'site' }),
    defineField({ name: 'youtube', title: 'YouTube URL', type: 'url', group: 'site' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', initialValue: 'Portrait of Ayush Gandhi' })],
    }),
    defineField({ name: 'intro', title: 'Short bio', type: 'text', rows: 3, description: 'Two lines for the home page “Behind the lens” strip.' }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }], lists: [] }],
      description: 'Photography only — how you started, what you shoot and why.',
    }),
    defineField({ name: 'basedIn', title: 'Based in', type: 'string', description: 'Optional. Shown only if filled.' }),
    defineField({
      name: 'gear',
      title: 'Gear',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'gearItem',
          fields: [
            defineField({ name: 'kind', title: 'Kind', type: 'string', options: { list: ['Body', 'Tele', 'Wide', 'Macro', 'Misc'] }, initialValue: 'Body' }),
            defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'name', subtitle: 'kind' } },
        },
      ],
    }),
    defineField({ name: 'software', title: 'Editing software', type: 'string', description: 'Optional, e.g. Lightroom Classic' }),
  ],
  preview: { prepare: () => ({ title: 'About' }) },
});
