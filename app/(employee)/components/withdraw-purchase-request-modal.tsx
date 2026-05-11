"use client";

import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  title: string;
  amountYen: number;
};

export function WithdrawPurchaseRequestModal({
  opened,
  onClose,
  purchaseRequestId,
  title,
  amountYen,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) {
      return;
    }
    onClose();
  };

  const handleWithdraw = async () => {
    setSubmitting(true);
    const result = await withdrawPurchaseRequest({ purchaseRequestId });
    setSubmitting(false);

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
  };

  return (
    <Modal
      centered
      closeOnClickOutside={!submitting}
      closeOnEscape={!submitting}
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
            disabled={submitting}
            onClick={handleClose}
            type="button"
            variant="default"
          >
            キャンセル
          </Button>
          <Button
            color="gray"
            disabled={submitting}
            loading={submitting}
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
