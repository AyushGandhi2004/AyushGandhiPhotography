import { defineArrayMember, defineField, defineType } from 'sanity';

export const photoPair = defineType({
  name: 'photoPair',
  title: 'Photo pair',
  type: 'object',
  fields: [
    defineField({ name: 'photos', title: 'Photos', type: 'array', of: [{ type: 'photo' }], options: { layout: 'grid' }, validation: (r) => r.length(2) }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
  ],
  preview: { select: { media: 'photos.0', caption: 'caption' }, prepare: ({ media, caption }) => ({ title: 'Photo pair', subtitle: caption, media }) },
});

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'object',
  fields: [defineField({ name: 'url', title: 'YouTube or Vimeo link', type: 'url', validation: (r) => r.required() })],
  preview: { select: { title: 'url' }, prepare: ({ title }) => ({ title: 'Video', subtitle: title }) },
});

export const story = defineType({
  name: 'story',
  title: 'Journal story',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'yoursite.com/journal/<this>/',
      options: { source: 'title', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'category', title: 'Category', type: 'reference', to: [{ type: 'category' }], options: { disableNew: true } }),
    defineField({
      name: 'cover',
      title: 'Cover',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({ name: 'standfirst', title: 'Standfirst', type: 'text', rows: 3, description: 'One or two sentences under the title, also used as the summary.' }),
    defineField({ name: 'publishedAt', title: 'Published on', type: 'datetime', initialValue: () => new Date().toISOString() }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Paragraph', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
            { title: 'Pull quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullets', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL', validation: (r) => r.uri({ allowRelative: true, scheme: ['https', 'http', 'mailto'] }) }],
              },
            ],
          },
        }),
        defineArrayMember({ type: 'photo' }),
        defineArrayMember({ type: 'photoPair' }),
        defineArrayMember({ type: 'video' }),
      ],
    }),
    defineField({ name: 'album', title: 'Related album', type: 'reference', to: [{ type: 'album' }], description: 'Adds a “See all photos from this trip” link.' }),
  ],
  orderings: [{ title: 'Newest first', name: 'published', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', date: 'publishedAt', media: 'cover' }, prepare: ({ title, date, media }) => ({ title, subtitle: date?.slice(0, 10), media }) },
});
