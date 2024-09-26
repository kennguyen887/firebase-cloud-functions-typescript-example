import { z } from 'zod';

// Define the Page schema using Zod
const pageSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
  author: z.string().min(1, { message: 'Author is required' }),
  createdAt: z.date().optional(), // Optional date field
});

// Type inference for the Page schema
export type Page = z.infer<typeof pageSchema>;

// Export the schema for use in other modules
export default pageSchema;