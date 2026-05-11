"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  canEditPurchaseRequest,
  canReviewPurchaseRequest,
  canWithdrawPurchaseRequest,
  requireSession,
} from "@/app/lib/auth";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/app/lib/errors";
import type { ActionResult } from "@/app/server/lib/action-result";
import { withActionResult } from "@/app/server/lib/with-action-result";
import { db } from "@/db";
import { approvalHistories } from "@/db/schema/approval-histories";
import { childCategories } from "@/db/schema/categories";
import { purchaseRequests } from "@/db/schema/purchase-requests";
import type { PurchaseRequest } from "@/db/types";
import {
  approvePurchaseRequestSchema,
  createPurchaseRequestSchema,
  rejectPurchaseRequestSchema,
  updatePurchaseRequestSchema,
  withdrawPurchaseRequestSchema,
} from "@/db/zod/purchase-request";

type CreateResult = ActionResult<{
  purchaseRequestId: PurchaseRequest["id"];
}>;
type ReviewResult = ActionResult<{
  purchaseRequestId: PurchaseRequest["id"];
}>;

export async function createPurchaseRequest(
  input: unknown,
): Promise<CreateResult> {
  return withActionResult(async () => {
    const { user } = await requireSession();
    const data = createPurchaseRequestSchema.parse(input);

    const [child] = await db
      .select({ id: childCategories.id })
      .from(childCategories)
      .where(eq(childCategories.id, data.childCategoryId));
    if (!child) {
      throw new ValidationError("カテゴリが存在しません", {
        fieldErrors: {
          childCategoryId: ["選択されたカテゴリが存在しません"],
        },
      });
    }

    const created = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(purchaseRequests)
        .values({
          applicantUserId: user.id,
          title: data.title,
          amountYen: data.amountYen,
          childCategoryId: data.childCategoryId,
          desiredPurchaseDate: data.desiredPurchaseDate ?? null,
        })
        .returning({ id: purchaseRequests.id });

      if (!row) {
        throw new Error("申請の作成に失敗しました");
      }

      await tx.insert(approvalHistories).values({
        purchaseRequestId: row.id,
        actorUserId: user.id,
        kind: "created",
        occurredAt: new Date(),
        comment: null,
      });

      return row;
    });

    revalidatePath("/requests");
    revalidatePath("/admin/requests");

    return { purchaseRequestId: created.id };
  });
}

export async function approvePurchaseRequest(
  input: unknown,
): Promise<ReviewResult> {
  return withActionResult(async () => {
    const { user } = await requireSession();
    if (!canReviewPurchaseRequest(user)) {
      throw new ForbiddenError("承認操作の権限がありません");
    }

    const data = approvePurchaseRequestSchema.parse(input);

    const reviewed = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(purchaseRequests)
        .set({ status: "approved" })
        .where(
          and(
            eq(purchaseRequests.id, data.purchaseRequestId),
            eq(purchaseRequests.status, "pending"),
          ),
        )
        .returning({ id: purchaseRequests.id });

      if (!row) {
        throw new ConflictError("既に処理済か、申請が存在しません");
      }

      await tx.insert(approvalHistories).values({
        purchaseRequestId: row.id,
        actorUserId: user.id,
        kind: "approved",
        occurredAt: new Date(),
        comment: null,
      });

      return row;
    });

    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${reviewed.id}`);
    revalidatePath("/requests");
    revalidatePath(`/requests/${reviewed.id}`);

    return { purchaseRequestId: reviewed.id };
  });
}

export async function updatePurchaseRequest(
  input: unknown,
): Promise<CreateResult> {
  return withActionResult(async () => {
    const { user } = await requireSession();
    const data = updatePurchaseRequestSchema.parse(input);

    const [existing] = await db
      .select({
        applicantUserId: purchaseRequests.applicantUserId,
        status: purchaseRequests.status,
      })
      .from(purchaseRequests)
      .where(eq(purchaseRequests.id, data.purchaseRequestId));

    if (!existing) {
      throw new NotFoundError("申請が見つかりません");
    }
    if (!canEditPurchaseRequest(user, existing.applicantUserId)) {
      throw new ForbiddenError("この申請を編集する権限がありません");
    }
    if (existing.status !== "pending") {
      throw new ConflictError(
        "既に処理済の申請は編集できません。一覧を再読込してください",
      );
    }

    const [child] = await db
      .select({ id: childCategories.id })
      .from(childCategories)
      .where(eq(childCategories.id, data.childCategoryId));
    if (!child) {
      throw new ValidationError("カテゴリが存在しません", {
        fieldErrors: {
          childCategoryId: ["選択されたカテゴリが存在しません"],
        },
      });
    }

    const [updated] = await db
      .update(purchaseRequests)
      .set({
        title: data.title,
        amountYen: data.amountYen,
        childCategoryId: data.childCategoryId,
        desiredPurchaseDate: data.desiredPurchaseDate ?? null,
      })
      .where(
        and(
          eq(purchaseRequests.id, data.purchaseRequestId),
          eq(purchaseRequests.status, "pending"),
        ),
      )
      .returning({ id: purchaseRequests.id });

    if (!updated) {
      throw new ConflictError(
        "既に処理済の申請は編集できません。一覧を再読込してください",
      );
    }

    revalidatePath("/requests");
    revalidatePath(`/requests/${updated.id}`);
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${updated.id}`);

    return { purchaseRequestId: updated.id };
  });
}

export async function withdrawPurchaseRequest(
  input: unknown,
): Promise<ReviewResult> {
  return withActionResult(async () => {
    const { user } = await requireSession();
    const data = withdrawPurchaseRequestSchema.parse(input);

    const [existing] = await db
      .select({ applicantUserId: purchaseRequests.applicantUserId })
      .from(purchaseRequests)
      .where(eq(purchaseRequests.id, data.purchaseRequestId));

    if (!existing) {
      throw new NotFoundError("申請が見つかりません");
    }
    if (!canWithdrawPurchaseRequest(user, existing.applicantUserId)) {
      throw new ForbiddenError("この申請を取り下げる権限がありません");
    }

    const withdrawn = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(purchaseRequests)
        .set({ status: "withdrawn" })
        .where(
          and(
            eq(purchaseRequests.id, data.purchaseRequestId),
            eq(purchaseRequests.status, "pending"),
          ),
        )
        .returning({ id: purchaseRequests.id });

      if (!row) {
        throw new ConflictError("既に処理済の申請は取り下げられません");
      }

      await tx.insert(approvalHistories).values({
        purchaseRequestId: row.id,
        actorUserId: user.id,
        kind: "withdrawn",
        occurredAt: new Date(),
        comment: null,
      });

      return row;
    });

    revalidatePath("/requests");
    revalidatePath(`/requests/${withdrawn.id}`);
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${withdrawn.id}`);

    return { purchaseRequestId: withdrawn.id };
  });
}

export async function rejectPurchaseRequest(
  input: unknown,
): Promise<ReviewResult> {
  return withActionResult(async () => {
    const { user } = await requireSession();
    if (!canReviewPurchaseRequest(user)) {
      throw new ForbiddenError("却下操作の権限がありません");
    }

    const data = rejectPurchaseRequestSchema.parse(input);

    const reviewed = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(purchaseRequests)
        .set({ status: "rejected" })
        .where(
          and(
            eq(purchaseRequests.id, data.purchaseRequestId),
            eq(purchaseRequests.status, "pending"),
          ),
        )
        .returning({ id: purchaseRequests.id });

      if (!row) {
        throw new ConflictError("既に処理済か、申請が存在しません");
      }

      await tx.insert(approvalHistories).values({
        purchaseRequestId: row.id,
        actorUserId: user.id,
        kind: "rejected",
        occurredAt: new Date(),
        comment: data.comment,
      });

      return row;
    });

    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${reviewed.id}`);
    revalidatePath("/requests");
    revalidatePath(`/requests/${reviewed.id}`);

    return { purchaseRequestId: reviewed.id };
  });
}
