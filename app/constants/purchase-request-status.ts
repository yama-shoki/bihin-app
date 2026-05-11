import type { MantineColor } from "@mantine/core";
import type { ApprovalHistoryKind } from "@/db/schema/approval-histories";
import type { PurchaseRequestStatus } from "@/db/schema/purchase-requests";

export const PURCHASE_REQUEST_STATUS_LABELS: Record<
  PurchaseRequestStatus,
  string
> = {
  pending: "申請中",
  approved: "承認済み",
  rejected: "却下",
};

export const PURCHASE_REQUEST_STATUS_BADGE_COLORS: Record<
  PurchaseRequestStatus,
  MantineColor
> = {
  pending: "yellow",
  approved: "blue",
  rejected: "red",
};

export const APPROVAL_HISTORY_KIND_LABELS: Record<ApprovalHistoryKind, string> =
  {
    created: "申請",
    approved: "承認",
    rejected: "却下",
  };
