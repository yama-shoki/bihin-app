import "server-only";
import { asc } from "drizzle-orm";
import { requireSession } from "@/app/lib/auth";
import { db } from "@/db";
import { childCategories, parentCategories } from "@/db/schema/categories";
import type { ChildCategoryRow, ParentCategoryRow } from "@/db/types";

export type CategoryGroup = {
  parent: ParentCategoryRow;
  children: ChildCategoryRow[];
};

export async function listCategories(): Promise<CategoryGroup[]> {
  await requireSession();

  const parents = await db
    .select()
    .from(parentCategories)
    .orderBy(asc(parentCategories.name));

  const children = await db
    .select()
    .from(childCategories)
    .orderBy(asc(childCategories.name));

  return parents.map((parent) => ({
    parent,
    children: children.filter((child) => child.parentCategoryId === parent.id),
  }));
}
