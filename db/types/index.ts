import type { approvalHistories } from "../schema/approval-histories";
import type { childCategories, parentCategories } from "../schema/categories";
import type { purchaseRequests } from "../schema/purchase-requests";
import type { users } from "../schema/users";

export type User = typeof users.$inferSelect;

export type ParentCategory = typeof parentCategories.$inferSelect;

export type ChildCategory = typeof childCategories.$inferSelect;

export type PurchaseRequest = typeof purchaseRequests.$inferSelect;

export type ApprovalHistory = typeof approvalHistories.$inferSelect;
export type ApprovalHistoryInsert = typeof approvalHistories.$inferInsert;

export type { ApprovalHistoryKind } from "../constants/approval-history-kind";
export type { PurchaseRequestStatus } from "../constants/purchase-request-status";
export type { UserRole } from "../constants/user-role";
