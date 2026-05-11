import { asc, desc, eq, type SQL } from "drizzle-orm";
import { forbidden, notFound } from "next/navigation";
import { cache } from "react";
import {
  canViewPurchaseRequest,
  requireRole,
  requireSession,
} from "@/app/lib/auth";
import { db } from "@/db";
import { approvalHistories } from "@/db/schema/approval-histories";
import { childCategories, parentCategories } from "@/db/schema/categories";
import { purchaseRequests } from "@/db/schema/purchase-requests";
import { users } from "@/db/schema/users";
import type {
  ApprovalHistory,
  ChildCategory,
  ParentCategory,
  PurchaseRequest,
  User,
} from "@/db/types";
import "server-only";

export type PurchaseRequestListItem = Pick<
  PurchaseRequest,
  "id" | "title" | "amountYen" | "desiredPurchaseDate" | "status" | "createdAt"
> & {
  applicant: Pick<User, "id" | "name" | "department">;
  parentCategory: Pick<ParentCategory, "id" | "name">;
  childCategory: Pick<ChildCategory, "id" | "name">;
};

export type ApprovalHistoryItem = Pick<
  ApprovalHistory,
  "id" | "kind" | "occurredAt" | "comment"
> & {
  actor: Pick<User, "id" | "name">;
};

export async function getMyPurchaseRequests(): Promise<
  PurchaseRequestListItem[]
> {
  const { user } = await requireSession();
  return queryPurchaseRequestList(
    eq(purchaseRequests.applicantUserId, user.id),
  );
}

export async function getAllPurchaseRequests(): Promise<
  PurchaseRequestListItem[]
> {
  await requireRole("admin");
  return queryPurchaseRequestList();
}

export const getPurchaseRequestById = cache(
  async (id: PurchaseRequest["id"]): Promise<PurchaseRequestListItem> => {
    const { user } = await requireSession();
    const [row] = await queryPurchaseRequestList(eq(purchaseRequests.id, id));

    if (!row) {
      notFound();
    }
    if (!canViewPurchaseRequest(user, row.applicant.id)) {
      forbidden();
    }

    return row;
  },
);

export async function listApprovalHistoriesForPurchaseRequest(
  purchaseRequestId: PurchaseRequest["id"],
): Promise<ApprovalHistoryItem[]> {
  // 履歴の可視性は親リソースの可視性に従う。
  await getPurchaseRequestById(purchaseRequestId);

  const rows = await db
    .select({
      id: approvalHistories.id,
      kind: approvalHistories.kind,
      occurredAt: approvalHistories.occurredAt,
      comment: approvalHistories.comment,
      actorId: users.id,
      actorName: users.name,
    })
    .from(approvalHistories)
    .innerJoin(users, eq(approvalHistories.actorUserId, users.id))
    .where(eq(approvalHistories.purchaseRequestId, purchaseRequestId))
    .orderBy(asc(approvalHistories.occurredAt));

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    occurredAt: row.occurredAt,
    comment: row.comment,
    actor: { id: row.actorId, name: row.actorName },
  }));
}

async function queryPurchaseRequestList(
  whereCondition?: SQL,
): Promise<PurchaseRequestListItem[]> {
  const query = db
    .select({
      id: purchaseRequests.id,
      title: purchaseRequests.title,
      amountYen: purchaseRequests.amountYen,
      desiredPurchaseDate: purchaseRequests.desiredPurchaseDate,
      status: purchaseRequests.status,
      createdAt: purchaseRequests.createdAt,
      applicantId: users.id,
      applicantName: users.name,
      applicantDepartment: users.department,
      childCategoryId: childCategories.id,
      childCategoryName: childCategories.name,
      parentCategoryId: parentCategories.id,
      parentCategoryName: parentCategories.name,
    })
    .from(purchaseRequests)
    .innerJoin(users, eq(purchaseRequests.applicantUserId, users.id))
    .innerJoin(
      childCategories,
      eq(purchaseRequests.childCategoryId, childCategories.id),
    )
    .innerJoin(
      parentCategories,
      eq(childCategories.parentCategoryId, parentCategories.id),
    )
    .$dynamic();

  if (whereCondition) {
    query.where(whereCondition);
  }

  const rows = await query.orderBy(desc(purchaseRequests.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    amountYen: row.amountYen,
    desiredPurchaseDate: row.desiredPurchaseDate,
    status: row.status,
    createdAt: row.createdAt,
    applicant: {
      id: row.applicantId,
      name: row.applicantName,
      department: row.applicantDepartment,
    },
    parentCategory: {
      id: row.parentCategoryId,
      name: row.parentCategoryName,
    },
    childCategory: {
      id: row.childCategoryId,
      name: row.childCategoryName,
    },
  }));
}
