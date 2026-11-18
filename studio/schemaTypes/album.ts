import { defineField, defineType } from 'sanity';
import { RESERVED_ALBUM_SLUGS } from './rules';

export const album = defineType({
  name: 'album',
  title: 'Album',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'yoursite.com/<category>/<this>/',
      options: { source: 'title', maxLength: 60 },
      validation: (r) =>
        r.required().custom((v) => (v?.current && RESERVED_ALBUM_SLUGS.includes(v.current) ? `"${v.current}" is reserved — pick another.` : true)),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      options: { filter: 'kind != "films"', disableNew: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Optional, e.g. "Tadoba, Maharashtra". Shown only if filled. Keep spelling consistent — the places counter counts different locations.',
    }),
    defineField({ name: 'dateStart', title: 'Start date', type: 'date', description: 'Albums are listed newest first.' }),
    defineField({ name: 'dateEnd', title: 'End date', type: 'date' }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'A short paragraph about the trip or show. Also used by search engines.',
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [{ type: 'photo' }],
      options: { layout: 'grid' },
      description: 'Drag all the photos in at once. Drag to reorder. The first photo is the cover unless one is marked “Use as album cover”.',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'story',
      title: 'Related journal story',
      type: 'reference',
      to: [{ type: 'story' }],
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'dateStart', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', category: 'category.title', date: 'dateStart', media: 'photos.0', count: 'photos.length' },
    prepare: ({ title, category, date, media }) => ({
      title,
      subtitle: [category, date].filter(Boolean).join(' · '),
      media,
    }),
  },
});
