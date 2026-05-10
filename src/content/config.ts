import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),       // ISO YYYY-MM-DD
    updatedAt: z.string().optional(),
    author: z.string().default('Polyák Csaba'),
    tags: z.array(z.string()).default([]),
    relatedTools: z.array(z.string()).default([]),
    readingMinutes: z.number().default(5),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
