import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      thumbnail: image().optional(),
      company: z.string(),
      period: z.string(),
      role: z.string(),
      responsibilities: z.array(z.string()).optional(),
      context: z.string().optional(),
      myJob: z.string().optional(),
      tagline: z.string().optional(),
      status: z.enum(['coming-soon', 'published']).optional(),
      order: z.number(),
    }),
});

export const collections = { projects };
