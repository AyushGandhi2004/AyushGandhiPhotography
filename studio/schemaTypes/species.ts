import { defineField, defineType } from 'sanity';

export const species = defineType({
  name: 'species',
  title: 'Species',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Common name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'scientific', title: 'Scientific name', type: 'string', description: 'Optional, e.g. Panthera tigris tigris' }),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'string',
      options: {
        list: ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Insect', 'Other'].map((g) => ({ title: g, value: g.toLowerCase() })),
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
  ],
  orderings: [{ title: 'Name', name: 'name', by: [{ field: 'name', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'scientific' } },
});
