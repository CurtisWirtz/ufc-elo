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

export const matchSchema1 = z.object({
  searchQuery: z.string()
    .min(1, { message: "Search term cannot be empty." })
    .max(250, { message: "Search term too long (max 250 characters)." })
    .regex(/^[a-zA-Z0-9\s-'\.,!&]*$/, {
      message: "Only letters, numbers, spaces, hyphens, apostrophes, and common punctuation are allowed."
    })
    .trim(),
});
export type MatchFormInput1 = z.infer<typeof matchSchema1>;

export const matchSchema2 = z.object({
  searchQuery: z.string()
    .min(1, { message: "Search term cannot be empty." })
    .max(250, { message: "Search term too long (max 250 characters)." })
    .regex(/^[a-zA-Z0-9\s-'\.,!&]*$/, {
      message: "Only letters, numbers, spaces, hyphens, apostrophes, and common punctuation are allowed."
    })
    .trim(),
});
export type MatchFormInput2 = z.infer<typeof matchSchema2>;