"use client";

import { Badge, Button, Group } from "@mantine/core";
import {
  PURCHASE_REQUEST_STATUS_BADGE_COLORS,
  PURCHASE_REQUEST_STATUS_LABELS,
} from "@/app/constants/purchase-request-status";
import { PURCHASE_REQUEST_STATUSES } from "@/db/constants/purchase-request-status";

export type StatusFilterValue =
  | "all"
  | (typeof PURCHASE_REQUEST_STATUSES)[number];

type Props = {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  counts: Record<StatusFilterValue, number>;
};

const ALL_COLOR = "gray";

export function PurchaseRequestStatusFilter({
  value,
  onChange,
  counts,
}: Props) {
  return (
    <Group gap="xs" wrap="wrap">
      <FilterButton
        active={value === "all"}
        color={ALL_COLOR}
        count={counts.all}
        label="全て"
        onClick={() => onChange("all")}
        showCount
      />
      {PURCHASE_REQUEST_STATUSES.map((status) => (
        <FilterButton
          active={value === status}
          color={PURCHASE_REQUEST_STATUS_BADGE_COLORS[status]}
          count={counts[status]}
          key={status}
          label={PURCHASE_REQUEST_STATUS_LABELS[status]}
          onClick={() => onChange(status)}
          showCount={counts[status] > 0}
        />
      ))}
    </Group>
  );
}

type FilterButtonProps = {
  active: boolean;
  color: string;
  count: number;
  label: string;
  onClick: () => void;
  showCount: boolean;
};

function FilterButton({
  active,
  color,
  count,
  label,
  onClick,
  showCount,
}: FilterButtonProps) {
  return (
    <Button
      color={color}
      onClick={onClick}
      size="sm"
      variant={active ? "filled" : "light"}
    >
      {label}
      {showCount && (
        <Badge
          c={active ? color : undefined}
          color={active ? "white" : color}
          ml={6}
          size="xs"
          variant="filled"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}
