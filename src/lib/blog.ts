import { getCollection } from 'astro:content';

// Drafts show in dev, in preview deploys, or with SHOW_DRAFTS=1. Never on the live site.
const showDrafts = import.meta.env.DEV || process.env.VERCEL_ENV === 'preview' || process.env.SHOW_DRAFTS === '1';

export async function posts() {
  const all = await getCollection('blog', ({ data }) => showDrafts || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const day = (date: Date) => date.toISOString().slice(0, 10);
