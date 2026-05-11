import { type MantineColor, Stack, Text, Timeline } from "@mantine/core";
import { APPROVAL_HISTORY_KIND_LABELS } from "@/app/constants/approval-history-kind";
import { formatDateTime } from "@/app/lib/format";
import type { ApprovalHistory, PurchaseRequestStatus, User } from "@/db/types";

const KIND_BULLET_COLORS = {
  created: "gray",
  approved: "blue",
  rejected: "red",
} satisfies Record<ApprovalHistory["kind"], MantineColor>;

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
          color={KIND_BULLET_COLORS[history.kind]}
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
        <Timeline.Item color="yellow" title="承認待ち" />
      ) : null}
    </Timeline>
  );
}
