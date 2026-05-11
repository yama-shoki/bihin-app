import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";
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

export type AddChildCategoryInput = z.infer<typeof addChildCategorySchema>;
