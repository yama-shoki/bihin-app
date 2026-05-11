"use client";

import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/app/lib/client-notifications";
import { formatYen } from "@/app/lib/format";
import { withdrawPurchaseRequest } from "@/app/server/actions/purchase-requests";
import type { PurchaseRequest } from "@/db/types";

type Props = {
  opened: boolean;
  onClose: () => void;
  purchaseRequestId: PurchaseRequest["id"];
  title: PurchaseRequest["title"];
  amountYen: PurchaseRequest["amountYen"];
};

export function WithdrawPurchaseRequestModal({
  opened,
  onClose,
  purchaseRequestId,
  title,
  amountYen,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (isPending) {
      return;
    }
    onClose();
  };

  const handleWithdraw = () => {
    startTransition(async () => {
      const result = await withdrawPurchaseRequest({ purchaseRequestId });

      if (result.ok) {
        showSuccessNotification("申請を取り下げました");
        onClose();
        router.refresh();
        return;
      }

      if (result.error.kind === "CONFLICT") {
        showErrorNotification("既に管理者が処理したため取り下げできません");
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
      title="申請の取り下げ"
    >
      <Stack gap="md">
        <Text>以下の申請を取り下げます。取り下げた申請は再開できません。</Text>
        <Stack gap={4}>
          <Text fw={600}>{title}</Text>
          <Text c="dimmed" size="sm">
            {formatYen(amountYen)}
          </Text>
        </Stack>
        <Group gap="sm" justify="flex-end">
          <Button
            disabled={isPending}
            onClick={handleClose}
            type="button"
            variant="default"
          >
            キャンセル
          </Button>
          <Button
            color="gray"
            disabled={isPending}
            loading={isPending}
            onClick={handleWithdraw}
            type="button"
          >
            取り下げる
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
