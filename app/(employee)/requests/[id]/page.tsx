import { Anchor, Group, Stack, Text, Title } from "@mantine/core";
import type { Route } from "next";
import Link from "next/link";
import { PurchaseRequestStatusBadge } from "@/app/components/common/purchase-request-status-badge";
import { formatDate, formatYen } from "@/app/lib/format";
import {
  getPurchaseRequestById,
  listApprovalHistoriesForPurchaseRequest,
} from "@/app/server/data/purchase-requests";
import type { PurchaseRequest } from "@/db/types";

type Props = {
  params: Promise<{ id: PurchaseRequest["id"] }>;
};

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params;
  const [request, _histories] = await Promise.all([
    getPurchaseRequestById(id),
    listApprovalHistoriesForPurchaseRequest(id),
  ]);

  return (
    <Stack gap="lg">
      <Link href={"/requests" as Route} style={{ width: "fit-content" }}>
        <Anchor component="span" size="sm">
          ← 申請一覧に戻る
        </Anchor>
      </Link>
      <Group align="center" justify="space-between">
        <Title order={2}>{request.title}</Title>
        <PurchaseRequestStatusBadge status={request.status} />
      </Group>
      <Stack gap="xs">
        <Text>
          金額:{" "}
          <Text component="span" fw={600}>
            {formatYen(request.amountYen)}
          </Text>
        </Text>
        <Text>
          カテゴリ: {request.parentCategory.name} / {request.childCategory.name}
        </Text>
        <Text>申請日: {formatDate(request.createdAt)}</Text>
      </Stack>
      <Text c="dimmed" size="sm">
        詳細画面は Slice 4 で本格実装予定 (タイムライン / 操作ボタン等)
      </Text>
    </Stack>
  );
}
