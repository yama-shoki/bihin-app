"use client";

import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/app/lib/client-notifications";
import { formatYen } from "@/app/lib/format";
import { approvePurchaseRequest } from "@/app/server/actions/purchase-requests";
import type { PurchaseRequest } from "@/db/types";

type Props = {
  opened: boolean;
  onClose: () => void;
  purchaseRequestId: PurchaseRequest["id"];
  title: string;
  amountYen: number;
};

export function ApprovePurchaseRequestModal({
  opened,
  onClose,
  purchaseRequestId,
  title,
  amountYen,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approvePurchaseRequest({ purchaseRequestId });

      if (result.ok) {
        showSuccessNotification("申請を承認しました");
        onClose();
        router.refresh();
        return;
      }

      if (result.error.kind === "CONFLICT") {
        showErrorNotification("既に他の管理者が処理しました");
        onClose();
        router.refresh();
        return;
      }

      showErrorNotification(result.error.message);
    });
  };

  return (
    <Modal
      centered
      closeOnClickOutside={!isPending}
      closeOnEscape={!isPending}
      onClose={handleClose}
      opened={opened}
      title="申請の承認"
    >
      <Stack gap="md">
        <Text>以下の申請を承認します。</Text>
        <Stack gap={4}>
          <Text fw={600}>{title}</Text>
          <Text c="dimmed" size="sm">
            {formatYen(amountYen)}
          </Text>
        </Stack>
        <Group gap="sm" justify="flex-end">
          <Button disabled={isPending} onClick={handleClose} variant="default">
            キャンセル
          </Button>
          <Button
            color="blue"
            disabled={isPending}
            loading={isPending}
            onClick={handleApprove}
          >
            承認する
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
