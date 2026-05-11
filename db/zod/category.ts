import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { childCategories, parentCategories } from "../schema/categories";

export const parentCategoryInsertSchema = createInsertSchema(parentCategories, {
  name: (fieldSchema) =>
    fieldSchema
      .trim()
      .min(1, "親カテゴリ名を入力してください")
      .max(50, "親カテゴリ名は50文字以内で入力してください"),
});

export const childCategoryInsertSchema = createInsertSchema(childCategories, {
  name: (fieldSchema) =>
    fieldSchema
      .trim()
      .min(1, "カテゴリ名を入力してください")
      .max(50, "カテゴリ名は50文字以内で入力してください"),
});

export const addChildCategorySchema = childCategoryInsertSchema.pick({
  parentCategoryId: true,
  name: true,
});

export const addParentCategorySchema = parentCategoryInsertSchema.pick({
  name: true,
});

export const updateParentCategorySchema = parentCategoryInsertSchema
  .pick({ name: true })
  .extend({
    parentCategoryId: z.string().min(1),
  });

export const deleteParentCategorySchema = z.object({
  parentCategoryId: z.string().min(1),
});

export const updateChildCategorySchema = childCategoryInsertSchema
  .pick({ name: true })
  .extend({
    childCategoryId: z.string().min(1),
  });

export const deleteChildCategorySchema = z.object({
  childCategoryId: z.string().min(1),
});
