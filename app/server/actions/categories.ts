"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/app/lib/auth";
import { ConflictError } from "@/app/lib/errors";
import type { ActionResult } from "@/app/server/lib/action-result";
import { withActionResult } from "@/app/server/lib/with-action-result";
import { db } from "@/db";
import { childCategories } from "@/db/schema/categories";
import type { ChildCategory } from "@/db/types";
import { addChildCategorySchema } from "@/db/zod/category";

type AddResult = ActionResult<{
  childCategoryId: ChildCategory["id"];
}>;

export async function addChildCategory(input: unknown): Promise<AddResult> {
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

      revalidatePath("/requests/new");

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

function isUniqueConstraintViolation(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return /UNIQUE constraint failed/i.test(error.message);
}
