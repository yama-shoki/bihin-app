import { Badge, type BadgeProps } from "@mantine/core";
import {
  PURCHASE_REQUEST_STATUS_BADGE_COLORS,
  PURCHASE_REQUEST_STATUS_ICONS,
  PURCHASE_REQUEST_STATUS_LABELS,
} from "@/app/constants/purchase-request-status";
import type { PurchaseRequestStatus } from "@/db/types";

type Props = Omit<BadgeProps, "color" | "children" | "leftSection"> & {
  status: PurchaseRequestStatus;
};

export function PurchaseRequestStatusBadge({
  status,
  variant = "light",
  ...rest
}: Props) {
  const Icon = PURCHASE_REQUEST_STATUS_ICONS[status];
  return (
    <Badge
      color={PURCHASE_REQUEST_STATUS_BADGE_COLORS[status]}
      leftSection={<Icon size={16} stroke={3} />}
      variant={variant}
      {...rest}
    >
      {PURCHASE_REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}
