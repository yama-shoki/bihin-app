"use client";

import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/app/lib/client-notifications";
import { formatYen } from "@/app/lib/format";
import { rejectPurchaseRequest } from "@/app/server/actions/purchase-requests";
import type { PurchaseRequest } from "@/db/types";

type FormValues = {
  comment: string;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  purchaseRequestId: PurchaseRequest["id"];
  title: PurchaseRequest["title"];
  amountYen: PurchaseRequest["amountYen"];
};

export function RejectPurchaseRequestModal({
  opened,
  onClose,
  purchaseRequestId,
  title,
  amountYen,
}: Props) {
  const router = useRouter();
  const form = useForm<FormValues>({
    initialValues: { comment: "" },
    validate: {
      comment: (value) =>
        value.trim().length === 0 ? "却下理由を入力してください" : null,
    },
  });

  const handleClose = () => {
    if (form.submitting) {
      return;
    }
    form.reset();
    onClose();
  };

  // * async ハンドラを返すと Mantine form が Promise を watch して form.submitting を自動で true/false 制御する。
  const handleReject = async (values: FormValues) => {
    const result = await rejectPurchaseRequest({
      purchaseRequestId,
      comment: values.comment.trim(),
    });

    if (result.ok) {
      showSuccessNotification("申請を却下しました");
      form.reset();
      onClose();
      router.refresh();
      return;
    }

    if (result.error.kind === "CONFLICT") {
      showErrorNotification("既に他の管理者が処理しました");
      form.reset();
      onClose();
      router.refresh();
      return;
    }

    showErrorNotification(result.error.message);
  };

  return (
    <Modal
      centered
      closeOnClickOutside={!form.submitting}
      closeOnEscape={!form.submitting}
      onClose={handleClose}
      opened={opened}
      title="申請の却下"
    >
      <form onSubmit={form.onSubmit(handleReject)}>
        <Stack gap="md">
          <Text>以下の申請を却下します。</Text>
          <Stack gap={4}>
            <Text fw={600}>{title}</Text>
            <Text c="dimmed" size="sm">
              {formatYen(amountYen)}
            </Text>
          </Stack>
          <Textarea
            autosize
            disabled={form.submitting}
            label="却下理由"
            minRows={3}
            withAsterisk
            {...form.getInputProps("comment")}
          />
          <Group gap="sm" justify="flex-end">
            <Button
              disabled={form.submitting}
              onClick={handleClose}
              type="button"
              variant="default"
            >
              キャンセル
            </Button>
            <Button
              color="red"
              disabled={form.submitting}
              loading={form.submitting}
              type="submit"
            >
              却下する
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
