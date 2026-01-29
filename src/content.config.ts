import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    thumbnail: z.string().optional(),
    company: z.string(),
    period: z.string(),
    role: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { projects };
