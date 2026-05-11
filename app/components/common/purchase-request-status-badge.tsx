import { Badge, type BadgeProps } from "@mantine/core";
import {
  PURCHASE_REQUEST_STATUS_BADGE_COLORS,
  PURCHASE_REQUEST_STATUS_LABELS,
} from "@/app/constants/purchase-request-status";
import type { PurchaseRequestStatus } from "@/db/types";

type Props = Omit<BadgeProps, "color" | "children"> & {
  status: PurchaseRequestStatus;
};

export function PurchaseRequestStatusBadge({ status, ...rest }: Props) {
  return (
    <Badge color={PURCHASE_REQUEST_STATUS_BADGE_COLORS[status]} {...rest}>
      {PURCHASE_REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}
