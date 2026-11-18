import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes, SINGLETONS } from './schemaTypes';
import { structure } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Ayush Gandhi Photography',
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      // Settings and About exist once; never offer "new" for them.
      ...prev.filter((t) => !SINGLETONS.includes(t.schemaType)),
      {
        id: 'album-in-category',
        title: 'Album in this category',
        schemaType: 'album',
        parameters: [{ name: 'categoryId', type: 'string' }],
        value: (params: { categoryId: string }) => ({ category: { _type: 'reference', _ref: params.categoryId } }),
      },
    ],
  },
  document: {
    actions: (prev, { schemaType }) =>
      SINGLETONS.includes(schemaType) ? prev.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action)) : prev,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global' ? prev.filter((t) => !SINGLETONS.includes(t.templateId) && t.templateId !== 'album-in-category') : prev,
  },
});
