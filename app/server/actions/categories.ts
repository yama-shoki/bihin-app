"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/app/lib/auth";
import { ConflictError, NotFoundError } from "@/app/lib/errors";
import type { ActionResult } from "@/app/server/lib/action-result";
import { withActionResult } from "@/app/server/lib/with-action-result";
import { db } from "@/db";
import { childCategories, parentCategories } from "@/db/schema/categories";
import type { ChildCategory, ParentCategory } from "@/db/types";
import {
  addChildCategorySchema,
  addParentCategorySchema,
  deleteChildCategorySchema,
  deleteParentCategorySchema,
  updateChildCategorySchema,
  updateParentCategorySchema,
} from "@/db/zod/category";

type ChildCategoryActionResult = ActionResult<{
  childCategoryId: ChildCategory["id"];
}>;

type ParentCategoryActionResult = ActionResult<{
  parentCategoryId: ParentCategory["id"];
}>;

export async function addChildCategory(
  input: unknown,
): Promise<ChildCategoryActionResult> {
  return withActionResult(async () => {
    await requireSession();
    const data = addChildCategorySchema.parse(input);

    try {
      const [created] = await db
        .insert(childCategories)
        .values({
          parentCategoryId: data.parentCategoryId,
          name: data.name,
        })
        .returning({ id: childCategories.id });

      if (!created) {
        throw new Error("カテゴリの作成に失敗しました");
      }

      revalidatePaths();

      return { childCategoryId: created.id };
    } catch (caught) {
      if (isUniqueConstraintViolation(caught)) {
        throw new ConflictError(
          "同じ親カテゴリに同じ名前のカテゴリが既に存在します",
        );
      }
      throw caught;
    }
  });
}

export async function updateChildCategory(
  input: unknown,
): Promise<ChildCategoryActionResult> {
  return withActionResult(async () => {
    await requireRole("admin");
    const data = updateChildCategorySchema.parse(input);

    try {
      const [updated] = await db
        .update(childCategories)
        .set({ name: data.name })
        .where(eq(childCategories.id, data.childCategoryId))
        .returning({ id: childCategories.id });

      if (!updated) {
        throw new NotFoundError("カテゴリが見つかりません");
      }

      revalidatePaths();

      return { childCategoryId: updated.id };
    } catch (caught) {
      if (isUniqueConstraintViolation(caught)) {
        throw new ConflictError(
          "同じ親カテゴリに同じ名前のカテゴリが既に存在します",
        );
      }
      throw caught;
    }
  });
}

export async function deleteChildCategory(
  input: unknown,
): Promise<ChildCategoryActionResult> {
  return withActionResult(async () => {
    await requireRole("admin");
    const data = deleteChildCategorySchema.parse(input);

    try {
      const [deleted] = await db
        .delete(childCategories)
        .where(eq(childCategories.id, data.childCategoryId))
        .returning({ id: childCategories.id });

      if (!deleted) {
        throw new NotFoundError("カテゴリが見つかりません");
      }

      revalidatePaths();

      return { childCategoryId: deleted.id };
    } catch (caught) {
      // child_categories ← purchase_requests.childCategoryId は onDelete: restrict。
      // 申請から参照されているカテゴリは削除できない。
      if (isForeignKeyConstraintViolation(caught)) {
        throw new ConflictError(
          "このカテゴリは申請から参照されているため削除できません",
        );
      }
      throw caught;
    }
  });
}

export async function addParentCategory(
  input: unknown,
): Promise<ParentCategoryActionResult> {
  return withActionResult(async () => {
    await requireRole("admin");
    const data = addParentCategorySchema.parse(input);

    try {
      const [created] = await db
        .insert(parentCategories)
        .values({ name: data.name })
        .returning({ id: parentCategories.id });

      if (!created) {
        throw new Error("親カテゴリの作成に失敗しました");
      }

      revalidatePaths();

      return { parentCategoryId: created.id };
    } catch (caught) {
      if (isUniqueConstraintViolation(caught)) {
        throw new ConflictError("同じ名前の親カテゴリが既に存在します");
      }
      throw caught;
    }
  });
}

export async function updateParentCategory(
  input: unknown,
): Promise<ParentCategoryActionResult> {
  return withActionResult(async () => {
    await requireRole("admin");
    const data = updateParentCategorySchema.parse(input);

    try {
      const [updated] = await db
        .update(parentCategories)
        .set({ name: data.name })
        .where(eq(parentCategories.id, data.parentCategoryId))
        .returning({ id: parentCategories.id });

      if (!updated) {
        throw new NotFoundError("親カテゴリが見つかりません");
      }

      revalidatePaths();

      return { parentCategoryId: updated.id };
    } catch (caught) {
      if (isUniqueConstraintViolation(caught)) {
        throw new ConflictError("同じ名前の親カテゴリが既に存在します");
      }
      throw caught;
    }
  });
}

export async function deleteParentCategory(
  input: unknown,
): Promise<ParentCategoryActionResult> {
  return withActionResult(async () => {
    await requireRole("admin");
    const data = deleteParentCategorySchema.parse(input);

    try {
      const [deleted] = await db
        .delete(parentCategories)
        .where(eq(parentCategories.id, data.parentCategoryId))
        .returning({ id: parentCategories.id });

      if (!deleted) {
        throw new NotFoundError("親カテゴリが見つかりません");
      }

      revalidatePaths();

      return { parentCategoryId: deleted.id };
    } catch (caught) {
      // child_categories.parentCategoryId は onDelete: restrict なので、
      // 子カテゴリが残っている親は削除できない。
      if (isForeignKeyConstraintViolation(caught)) {
        throw new ConflictError(
          "子カテゴリが残っているため削除できません。先に子カテゴリを削除してください",
        );
      }
      throw caught;
    }
  });
}

function revalidatePaths(): void {
  revalidatePath("/admin/requests");
  revalidatePath("/requests/new");
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Error && /UNIQUE constraint failed/i.test(error.message)
  );
}

function isForeignKeyConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Error &&
    /FOREIGN KEY constraint failed/i.test(error.message)
  );
}
