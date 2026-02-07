import { defineCollection, z } from 'astro:content';

const editions = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    edition: z.number(),
    description: z.string(),
    sections: z.array(z.string()),
  }),
});

export const collections = { editions };
