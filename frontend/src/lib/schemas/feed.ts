import { z } from 'zod';

export const createFeedRequestBody = z.object({
  content: z
    .string({ message: 'Content is required' }) // handle null or undefined
    .min(1, { message: 'Content is required' }) // handle empty string
    .max(280, { message: 'Content maximum length is 280 characters' }),
});

export const updateFeedRequestBody = z.object({
  content: z
    .string({ message: 'Content is required' }) // handle null or undefined
    .min(1, { message: 'Content is required' }) // handle empty string
    .max(280, { message: 'Content maximum length is 280 characters' }),
});
