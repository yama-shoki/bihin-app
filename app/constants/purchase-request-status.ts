import type { MantineColor } from "@mantine/core";
import type { PurchaseRequestStatus } from "@/db/types";

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
