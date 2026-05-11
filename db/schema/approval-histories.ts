import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { APPROVAL_HISTORY_KINDS } from "../constants/approval-history-kind";
import { id } from "./helpers";
import { purchaseRequests } from "./purchase-requests";
import { users } from "./users";

// * append-only 設計: 共通 timestamps を持たず occurredAt がイベント発生時刻を担う
export const approvalHistories = sqliteTable(
  "approval_histories",
  {
    id,
    // * cascade: 申請本体が消えたら関連履歴も消す (孤児防止)
    purchaseRequestId: text()
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "cascade" }),
    // * restrict: ユーザー削除でも監査履歴を残す
    actorUserId: text()
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    kind: text({ enum: APPROVAL_HISTORY_KINDS }).notNull(),
    occurredAt: integer({ mode: "timestamp_ms" }).notNull(),
    comment: text(),
  },
  (table) => [
    index("approval_histories_purchase_request_idx").on(
      table.purchaseRequestId,
    ),
    index("approval_histories_occurred_at_idx").on(table.occurredAt),
  ],
);
