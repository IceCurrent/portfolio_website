import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    dateRange: z.string(),
    summary: z.string(),
    heroImageAlt: z.string(),
    github: z.string().url(),
    tags: z.array(z.string()),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  projects,
  blog,
};
