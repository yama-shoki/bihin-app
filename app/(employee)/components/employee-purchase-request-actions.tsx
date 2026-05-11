"use client";

import { Button, Group, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowBackUp, IconPencil } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import type { PurchaseRequest } from "@/db/types";
import { WithdrawPurchaseRequestModal } from "./withdraw-purchase-request-modal";

type Props = {
  purchaseRequestId: PurchaseRequest["id"];
  title: PurchaseRequest["title"];
  amountYen: PurchaseRequest["amountYen"];
};

export function EmployeePurchaseRequestActions({
  purchaseRequestId,
  title,
  amountYen,
}: Props) {
  const [
    withdrawModalOpened,
    { open: openWithdrawModal, close: closeWithdrawModal },
  ] = useDisclosure(false);

  return (
    <>
      <Group gap="sm">
        <Tooltip label="この申請を取り下げます" position="top" withArrow>
          <Button
            color="gray"
            leftSection={<IconArrowBackUp size={16} />}
            onClick={openWithdrawModal}
            variant="light"
          >
            取り下げる
          </Button>
        </Tooltip>
        <Tooltip
          label="タイトル・金額・カテゴリを修正します"
          position="top"
          withArrow
        >
          <Button
            component={Link}
            href={`/requests/${purchaseRequestId}/edit` as Route}
            leftSection={<IconPencil size={16} />}
          >
            編集する
          </Button>
        </Tooltip>
      </Group>
      <WithdrawPurchaseRequestModal
        amountYen={amountYen}
        onClose={closeWithdrawModal}
        opened={withdrawModalOpened}
        purchaseRequestId={purchaseRequestId}
        title={title}
      />
    </>
  );
}
