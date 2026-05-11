"use client";

import { Stack, Text, Timeline } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import {
  APPROVAL_HISTORY_KIND_COLORS,
  APPROVAL_HISTORY_KIND_ICONS,
  APPROVAL_HISTORY_KIND_LABELS,
} from "@/app/constants/approval-history-kind";
import { formatDateTime } from "@/app/lib/format";
import type { ApprovalHistory, PurchaseRequestStatus, User } from "@/db/types";

type Props = {
  status: PurchaseRequestStatus;
  histories: (Pick<
    ApprovalHistory,
    "id" | "kind" | "occurredAt" | "comment"
  > & {
    actor: Pick<User, "name">;
  })[];
};

export function PurchaseRequestApprovalTimeline({ status, histories }: Props) {
  const active = status === "pending" ? histories.length : histories.length - 1;

  return (
    <Timeline active={active} bulletSize={24} lineWidth={2}>
      {histories.map((history) => (
        <Timeline.Item
          bullet={<HistoryBulletIcon kind={history.kind} />}
          color={APPROVAL_HISTORY_KIND_COLORS[history.kind]}
          key={history.id}
          title={APPROVAL_HISTORY_KIND_LABELS[history.kind]}
        >
          <Stack gap={4}>
            <Text c="dimmed" size="sm">
              {formatDateTime(history.occurredAt)}
            </Text>
            <Text size="sm">{history.actor.name}</Text>
            {history.comment ? (
              <Text c="dimmed" size="sm">
                {history.comment}
              </Text>
            ) : null}
          </Stack>
        </Timeline.Item>
      ))}
      {status === "pending" ? (
        <Timeline.Item
          bullet={<IconClock size={14} stroke={2.4} />}
          color="yellow"
          title="承認待ち"
        />
      ) : null}
    </Timeline>
  );
}

type HistoryBulletIconProps = {
  kind: ApprovalHistory["kind"];
};

function HistoryBulletIcon({ kind }: HistoryBulletIconProps) {
  const Icon = APPROVAL_HISTORY_KIND_ICONS[kind];
  return <Icon size={14} stroke={2.4} />;
}
