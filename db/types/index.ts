import type { approvalHistories } from "../schema/approval-histories";
import type { childCategories, parentCategories } from "../schema/categories";
import type { purchaseRequests } from "../schema/purchase-requests";
import type { users } from "../schema/users";

export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export type ParentCategoryRow = typeof parentCategories.$inferSelect;
export type ParentCategoryInsert = typeof parentCategories.$inferInsert;

export type ChildCategoryRow = typeof childCategories.$inferSelect;
export type ChildCategoryInsert = typeof childCategories.$inferInsert;

export type PurchaseRequestRow = typeof purchaseRequests.$inferSelect;
export type PurchaseRequestInsert = typeof purchaseRequests.$inferInsert;

export type ApprovalHistoryRow = typeof approvalHistories.$inferSelect;
export type ApprovalHistoryInsert = typeof approvalHistories.$inferInsert;

export type { ApprovalHistoryKind } from "../schema/approval-histories";
export type { PurchaseRequestStatus } from "../schema/purchase-requests";
export type { UserRole } from "../schema/users";
