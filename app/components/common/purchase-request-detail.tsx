import {
  Badge,
  Box,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { PurchaseRequestApprovalTimeline } from "@/app/components/common/purchase-request-approval-timeline";
import { PurchaseRequestStatusBadge } from "@/app/components/common/purchase-request-status-badge";
import { formatDate, formatYen } from "@/app/lib/format";
import type {
  ApprovalHistoryItem,
  PurchaseRequestListItem,
} from "@/app/server/data/purchase-requests";

type Props = {
  request: PurchaseRequestListItem;
  histories: ApprovalHistoryItem[];
  /** 申請内容カード footer に差し込む操作スロット (承認/却下、編集/取り下げ等)。 */
  actions?: ReactNode;
};

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack gap={4}>
      <Text c="dimmed" fw={500} size="xs" tt="uppercase">
        {label}
      </Text>
      <Box>
        {typeof value === "string" ? <Text size="sm">{value}</Text> : value}
      </Box>
    </Stack>
  );
}

function DesiredPurchaseDateValue({
  date,
  isPending,
}: {
  date: Date | null;
  isPending: boolean;
}) {
  if (!date) {
    return <Text size="sm">—</Text>;
  }

  const isOverdue = isPending && dayjs(date).isBefore(dayjs(), "day");

  if (!isOverdue) {
    return <Text size="sm">{formatDate(date)}</Text>;
  }

  return (
    <Group gap={6} wrap="nowrap">
      <Text c="red" fw={600} size="sm">
        {formatDate(date)}
      </Text>
      <Badge
        color="red"
        leftSection={<IconAlertTriangle size={12} />}
        size="sm"
        variant="light"
      >
        期限超過
      </Badge>
    </Group>
  );
}

export function PurchaseRequestDetail({ request, histories, actions }: Props) {
  const isPending = request.status === "pending";

  return (
    <Stack gap="lg">
      <Card padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group align="flex-start" justify="space-between" wrap="nowrap">
            <Stack gap={4}>
              <Text c="dimmed" fw={500} size="xs" tt="uppercase">
                申請タイトル
              </Text>
              <Title order={2}>{request.title}</Title>
            </Stack>
            <PurchaseRequestStatusBadge size="lg" status={request.status} />
          </Group>
          <Divider />
          <Group align="baseline" gap="xs">
            <Text c="dimmed" fw={500} size="xs" tt="uppercase">
              金額
            </Text>
            <Text fw={700} size="xl">
              {formatYen(request.amountYen)}
            </Text>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <MetaItem
              label="申請者"
              value={
                <Stack gap={0}>
                  <Text component="span" fw={600} size="sm">
                    {request.applicant.name}
                  </Text>
                  <Text c="dimmed" component="span" size="xs">
                    {request.applicant.department}
                  </Text>
                </Stack>
              }
            />
            <MetaItem
              label="カテゴリ"
              value={`${request.parentCategory.name} / ${request.childCategory.name}`}
            />
            <MetaItem
              label="希望購入日"
              value={
                <DesiredPurchaseDateValue
                  date={request.desiredPurchaseDate}
                  isPending={isPending}
                />
              }
            />
          </SimpleGrid>
          {actions ? (
            <>
              <Divider />
              <Group justify="flex-end">{actions}</Group>
            </>
          ) : null}
        </Stack>
      </Card>

      <Card padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Stack gap={2}>
            <Title order={4}>承認履歴</Title>
            <Text c="dimmed" size="sm">
              申請から現在までの状態遷移を時系列で表示しています
            </Text>
          </Stack>
          <Divider />
          <PurchaseRequestApprovalTimeline
            histories={histories}
            status={request.status}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
