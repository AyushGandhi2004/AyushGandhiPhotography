import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // The Studio's address: https://<studioHost>.sanity.studio
  studioHost: process.env.SANITY_STUDIO_HOST || undefined,
  deployment: { appId: 'gb64x9h8ibrmfx92nuxc39no',autoUpdates: true },
});
