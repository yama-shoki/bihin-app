import type { ApprovalHistoryKind } from "@/db/types";

export const APPROVAL_HISTORY_KIND_LABELS: Record<ApprovalHistoryKind, string> =
  {
    created: "申請",
    approved: "承認",
    rejected: "却下",
  };
