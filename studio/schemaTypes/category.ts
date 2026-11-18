import { defineField, defineType } from 'sanity';
import { countOthers, MAX_CATEGORIES, RESERVED_CATEGORY_SLUGS } from './rules';

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fieldsets: [{ name: 'seo', title: 'Search engines (optional)', options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'yoursite.com/<this>/ — changing it later breaks old links to this category.',
      options: { source: 'title', maxLength: 40 },
      validation: (r) =>
        r.required().custom((v) => (v?.current && RESERVED_CATEGORY_SLUGS.includes(v.current) ? `"${v.current}" is used by the site — pick another.` : true)),
    }),
    defineField({
      name: 'code',
      title: 'Dial code',
      type: 'string',
      description: 'Two capital letters shown on the mode dial, e.g. WL. Must be unique.',
      validation: (r) =>
        r
          .required()
          .regex(/^[A-Z]{2}$/, { name: 'two capital letters' })
          .custom(async (v, ctx) => {
            if (!v) return true;
            const clash = await countOthers(ctx, '_type == "category" && code == $code', { code: v });
            return clash > 0 ? `Another category already uses ${v}.` : true;
          }),
    }),
    defineField({
      name: 'order',
      title: 'Dial order',
      type: 'number',
      description: 'Position on the dial (clockwise after AUTO) and on the home page. 1 = first.',
      initialValue: 9,
      validation: (r) => r.required().integer().min(1),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Photos (albums and photos)', value: 'photos' },
          { title: 'Films (YouTube / Vimeo)', value: 'films' },
        ],
        layout: 'radio',
      },
      initialValue: 'photos',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'main',
      title: 'Main category',
      type: 'boolean',
      description: 'Gets the “main” badge and drives the trips counter. Only one category can be main.',
      initialValue: false,
      validation: (r) =>
        r.custom(async (v, ctx) => {
          if (!v) return true;
          const others = await countOthers(ctx, '_type == "category" && main == true');
          return others > 0 ? 'Another category is already main — turn it off there first.' : true;
        }),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      description: 'Two lines shown under the title. Also used by search engines.',
    }),
    defineField({
      name: 'cover',
      title: 'Home page tile',
      type: 'image',
      description: 'Optional. Falls back to the newest album’s cover.',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'loose',
      title: 'Photos without an album',
      type: 'array',
      of: [{ type: 'photo' }],
      options: { layout: 'grid' },
      description: 'Drag photos here that do not belong to any album.',
      hidden: ({ document }) => document?.kind === 'films',
    }),
    defineField({ name: 'seoTitle', title: 'SEO title', type: 'string', fieldset: 'seo' }),
    defineField({ name: 'seoDescription', title: 'SEO description', type: 'text', rows: 2, fieldset: 'seo', validation: (r) => r.max(160) }),
  ],
  validation: (r) =>
    r.custom(async (_doc, ctx) => {
      const others = await countOthers(ctx, '_type == "category"');
      return others >= MAX_CATEGORIES ? `The mode dial fits ${MAX_CATEGORIES} categories. Delete one before adding another.` : true;
    }),
  orderings: [{ title: 'Dial order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', code: 'code', order: 'order', kind: 'kind', main: 'main', media: 'cover' },
    prepare: ({ title, code, order, kind, main, media }) => ({
      title,
      subtitle: [`${order ?? '?'} · ${code ?? '??'}`, kind === 'films' ? 'Films' : 'Photos', main ? 'Main' : null].filter(Boolean).join(' · '),
      media,
    }),
  },
});
