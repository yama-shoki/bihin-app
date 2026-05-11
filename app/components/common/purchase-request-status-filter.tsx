"use client";

import { Badge, Button, Group } from "@mantine/core";
import {
  PURCHASE_REQUEST_STATUS_BADGE_COLORS,
  PURCHASE_REQUEST_STATUS_LABELS,
  type PurchaseRequestStatusFilterValue,
} from "@/app/constants/purchase-request-status";
import { PURCHASE_REQUEST_STATUSES } from "@/db/constants/purchase-request-status";

type Props = {
  value: PurchaseRequestStatusFilterValue;
  onChange: (value: PurchaseRequestStatusFilterValue) => void;
  counts: Record<PurchaseRequestStatusFilterValue, number>;
};

const ALL_FILTER_COLOR = "gray";

export function PurchaseRequestStatusFilter({
  value,
  onChange,
  counts,
}: Props) {
  return (
    <Group gap="xs" wrap="wrap">
      <FilterButton
        active={value === "all"}
        color={ALL_FILTER_COLOR}
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
  const borderColor = active
    ? `var(--mantine-color-${color}-6)`
    : `var(--mantine-color-${color}-1)`;
  const backgroundColor = active
    ? `var(--mantine-color-${color}-2)`
    : `var(--mantine-color-${color}-0)`;
  const textColor = `var(--mantine-color-${color}-8)`;

  return (
    <Button
      onClick={onClick}
      radius="md"
      size="sm"
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
        fontWeight: active ? 700 : 600,
      }}
      variant="default"
    >
      {label}
      {showCount && (
        <Badge color={color} ml={6} size="xs" variant="filled">
          {count}
        </Badge>
      )}
    </Button>
  );
}
