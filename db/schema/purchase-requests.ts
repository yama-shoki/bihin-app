import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { PURCHASE_REQUEST_STATUSES } from "../constants/purchase-request-status";
import { childCategories } from "./categories";
import { id, timestamps } from "./helpers";
import { users } from "./users";

export const purchaseRequests = sqliteTable(
  "purchase_requests",
  {
    id,
    // * restrict: ユーザー削除でも申請履歴を残す (業務監査)
    applicantUserId: text()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text().notNull(),
    amountYen: integer().notNull(),
    // * restrict: カテゴリ削除で過去申請の参照を壊さない
    childCategoryId: text()
      .notNull()
      .references(() => childCategories.id, { onDelete: "restrict" }),
    desiredPurchaseDate: integer({ mode: "timestamp_ms" }),
    status: text({ enum: PURCHASE_REQUEST_STATUSES })
      .notNull()
      .default("pending"),
    ...timestamps,
  },
  (table) => [
    index("purchase_requests_applicant_idx").on(table.applicantUserId),
    index("purchase_requests_status_idx").on(table.status),
    index("purchase_requests_created_at_idx").on(table.createdAt),
    index("purchase_requests_child_category_idx").on(table.childCategoryId),
  ],
);
