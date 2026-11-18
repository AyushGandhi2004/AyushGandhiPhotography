import { defineField, defineType } from 'sanity';

export const film = defineType({
  name: 'film',
  title: 'Film',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      options: { filter: 'kind == "films"', disableNew: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'url',
      title: 'Video link',
      type: 'url',
      description: 'The YouTube or Vimeo address. The player only loads when someone presses play.',
      validation: (r) => r.required().uri({ scheme: ['https', 'http'] }),
    }),
    defineField({
      name: 'poster',
      title: 'Poster',
      type: 'image',
      description: 'Optional. Falls back to YouTube’s thumbnail.',
      options: { hotspot: true },
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'year', title: 'Year', type: 'string' }),
    defineField({ name: 'length', title: 'Length', type: 'string', description: 'e.g. 3:42' }),
    defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. Shot and edited' }),
    defineField({ name: 'format', title: 'Format', type: 'string', description: 'e.g. 4K · 24p' }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Shown large at the top of the films page.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', year: 'year', featured: 'featured', media: 'poster' },
    prepare: ({ title, year, featured, media }) => ({ title, subtitle: [year, featured ? 'Featured' : null].filter(Boolean).join(' · '), media }),
  },
});
