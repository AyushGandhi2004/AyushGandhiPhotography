export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string | undefined;
export const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string | undefined) || 'production';
export const readToken = import.meta.env.SANITY_API_READ_TOKEN as string | undefined;
export const apiVersion = '2025-10-01';

/** With no project ID the site builds from built-in demo content. */
export const useDemo = !projectId;
