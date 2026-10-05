import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // One Markdown file per post in src/content/blog/. The file name is the address: /blog/<name>.
  blog: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/blog' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      author: z.string().default('jerpint'),
      // Wolts that helped write it. The human above stays the author; wolts are credited under them.
      wolts: z.array(z.object({ name: z.string(), creature: z.string().optional() })).default([]),
      // A draft is only built in dev and in preview deploys, never on the live site.
      draft: z.boolean().default(false),
    }),
  }),
};
