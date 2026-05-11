import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./helpers";

export const parentCategories = sqliteTable("parent_categories", {
  id,
  name: text().notNull().unique(),
  ...timestamps,
});

export const childCategories = sqliteTable(
  "child_categories",
  {
    id,
    parentCategoryId: text()
      .notNull()
      .references(() => parentCategories.id, { onDelete: "restrict" }),
    name: text().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("child_categories_parent_name_unq").on(
      table.parentCategoryId,
      table.name,
    ),
    index("child_categories_parent_idx").on(table.parentCategoryId),
  ],
);
