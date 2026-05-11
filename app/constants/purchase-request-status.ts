import type { MantineColor } from "@mantine/core";
import {
  type Icon,
  IconArrowBackUp,
  IconCircleCheck,
  IconCircleX,
  IconClock,
} from "@tabler/icons-react";
import { PURCHASE_REQUEST_STATUSES } from "@/db/constants/purchase-request-status";
import type { PurchaseRequestStatus } from "@/db/types";

export const PURCHASE_REQUEST_STATUS_LABELS: Record<
  PurchaseRequestStatus,
  string
> = {
  pending: "申請中",
  approved: "承認済み",
  rejected: "却下",
  withdrawn: "取り下げ",
};

export const PURCHASE_REQUEST_STATUS_BADGE_COLORS: Record<
  PurchaseRequestStatus,
  MantineColor
> = {
  pending: "yellow",
  approved: "blue",
  rejected: "red",
  withdrawn: "gray",
};

export const PURCHASE_REQUEST_STATUS_ICONS: Record<
  PurchaseRequestStatus,
  Icon
> = {
  pending: IconClock,
  approved: IconCircleCheck,
  rejected: IconCircleX,
  withdrawn: IconArrowBackUp,
};

// 一覧画面のステータスタブ。「全て」を先頭に持たせるため、データ層の status 列挙に "all" を加えた拡張集合。
export const PURCHASE_REQUEST_STATUS_FILTER_VALUES = [
  "all",
  ...PURCHASE_REQUEST_STATUSES,
] as const;

export type PurchaseRequestStatusFilterValue =
  (typeof PURCHASE_REQUEST_STATUS_FILTER_VALUES)[number];
