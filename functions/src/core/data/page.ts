import { z } from "zod";

export enum PageStatus {
  PUSLISHED = "published",
  PRIVATE = "private",
  ARCHIVE = "archive",
  TRASH = "trash", // Items in Trash are deleted after 7 days.
}


export enum PageType {
  BOARD = "board",
  SHOP = "shop",
  BLOG = "blog",
}
// Define the Page schema using Zod
const pageSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z.string().optional(),
  content: z.string().min(1, { message: "Content is required" }),
  author: z.string().min(1, { message: "Author is required" }),
  status: z.enum(Object.values(PageStatus) as [PageStatus, ...PageStatus[]]).default(PageStatus.PRIVATE), // Enum for role
  type: z.enum([PageType.BOARD, PageType.SHOP, PageType.BLOG]).default(PageType.BOARD), // Enum for role
  createdAt: z.date().optional(), // Optional date field
});

// Type inference for the Page schema
export type Page = z.infer<typeof pageSchema>;

// Export the schema for use in other modules
export default pageSchema;
