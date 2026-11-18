import { defineField, defineType } from 'sanity';

/**
 * One photograph. It is an image with extra fields, so dragging many files onto an
 * album creates one photo each. Camera GPS ("location" metadata) is deliberately not
 * extracted; shutter, aperture, ISO, lens and date come from EXIF automatically.
 */
export const photo = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'image',
  options: {
    hotspot: true,
    metadata: ['exif', 'lqip', 'palette', 'blurhash'],
  },
  fieldsets: [{ name: 'gear', title: 'Gear override (only if the camera data is missing)', options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'What is in the photo, in a short sentence. Read by screen readers and search engines.',
      validation: (r) => r.required().max(180),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional. Falls back to the species, then the album name.',
    }),
    defineField({
      name: 'caption',
      title: 'Caption / story',
      type: 'text',
      rows: 3,
      description: 'Optional. Shown in the photo viewer’s Info panel.',
    }),
    defineField({
      name: 'species',
      title: 'Species',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'species' }] }],
      description: 'Pick from your list, or create a new species from here.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Optional. Replaces the album’s location for this photo. Leave empty to hide.',
    }),
    defineField({
      name: 'takenAt',
      title: 'Taken on',
      type: 'datetime',
      description: 'Leave empty to use the date from the camera.',
    }),
    defineField({
      name: 'isCover',
      title: 'Use as album cover',
      type: 'boolean',
      hidden: ({ document }) => document?._type !== 'album',
    }),
    defineField({ name: 'cameraOverride', title: 'Camera', type: 'string', fieldset: 'gear' }),
    defineField({ name: 'lensOverride', title: 'Lens', type: 'string', fieldset: 'gear' }),
  ],
  preview: {
    select: { title: 'title', alt: 'alt', species: 'species.0.name', media: 'asset', cover: 'isCover' },
    prepare: ({ title, alt, species, media, cover }) => ({
      title: title || species || alt || 'Untitled photo',
      subtitle: [cover ? 'Cover' : null, alt ? null : 'Needs alt text'].filter(Boolean).join(' · ') || undefined,
      media,
    }),
  },
});
