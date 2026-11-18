import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('Site settings & home').id('siteSettings').child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings & home')),
      S.divider(),
      S.listItem()
        .title('Categories')
        .schemaType('category')
        .child(S.documentTypeList('category').title('Categories (dial order)').defaultOrdering([{ field: 'order', direction: 'asc' }])),
      S.listItem()
        .title('Albums')
        .schemaType('album')
        .child(
          S.list()
            .title('Albums')
            .items([
              S.listItem().title('All albums').child(S.documentTypeList('album').title('All albums').defaultOrdering([{ field: 'dateStart', direction: 'desc' }])),
              S.divider(),
              S.listItem()
                .title('By category')
                .child(
                  S.documentTypeList('category')
                    .title('Pick a category')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }])
                    .child((categoryId) =>
                      S.documentList()
                        .title('Albums')
                        .schemaType('album')
                        .filter('_type == "album" && category._ref == $categoryId')
                        .params({ categoryId })
                        .defaultOrdering([{ field: 'dateStart', direction: 'desc' }])
                        .initialValueTemplates([S.initialValueTemplateItem('album-in-category', { categoryId })]),
                    ),
                ),
            ]),
        ),
      S.documentTypeListItem('film').title('Films'),
      S.documentTypeListItem('story').title('Journal'),
      S.documentTypeListItem('species').title('Species'),
      S.divider(),
      S.listItem().title('About').id('about').child(S.document().schemaType('about').documentId('about').title('About')),
    ]);
