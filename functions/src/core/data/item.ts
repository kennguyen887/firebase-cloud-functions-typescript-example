import { z } from "zod";

export enum ItemStatus {
  ACTIVE = "active",
  ARCHIVE = "archive",
  TRASH = "trash", // Items in Trash are deleted after 7 days.
}

export enum ItemType {
  NOTE = "note",
  CHECKLIST = "checklist",
  PRODUCT = "product",
  IMAGE = "image",
  FILE = "file",
}
// Define the Page schema using Zod
const itemSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  pinned: z.boolean().optional(),
  sortNumber: z.number().optional(),
  pageId: z.string().min(1, { message: "pageId is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  author: z.string().min(1, { message: "Author is required" }),
  type: z.enum(Object.values(ItemType) as [ItemType, ...ItemType[]]).default(ItemType.NOTE), // Enum for role
  status: z.enum(Object.values(ItemStatus) as [ItemStatus, ...ItemStatus[]]).default(ItemStatus.ACTIVE), // Enum for role
  styles: z.object({ // An object field
    backgroudColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    fontSize: z.number().optional(),
  }),
  tags: z.array(z.string().min(1, { message: "Tag cannot be empty" })).optional(),
  createdAt: z.date().optional(), // Optional date field
});

// Type inference for the Page schema
export type Item = z.infer<typeof itemSchema>;

// Export the schema for use in other modules
export default itemSchema;



