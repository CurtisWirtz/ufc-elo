import { z } from 'zod';

export const searchSchema = z.object({
  searchQuery: z.string()
    .min(1, { message: "Search term cannot be empty." })
    .max(250, { message: "Search term too long (max 250 characters)." })
    .regex(/^[a-zA-Z0-9\s-'\.,!&]*$/, {
      message: "Only letters, numbers, spaces, hyphens, apostrophes, and common punctuation are allowed."
    })
    .trim(),
});

export type SearchFormInputs = z.infer<typeof searchSchema>;