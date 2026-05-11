"use client";

import { Button, Group, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { PurchaseRequest } from "@/db/types";
import { ApprovePurchaseRequestModal } from "./approve-purchase-request-modal";
import { RejectPurchaseRequestModal } from "./reject-purchase-request-modal";

type Props = {
  purchaseRequestId: PurchaseRequest["id"];
  title: string;
  amountYen: number;
};

export function AdminPurchaseRequestActions({
  purchaseRequestId,
  title,
  amountYen,
}: Props) {
  const [
    approveModalOpened,
    { open: openApproveModal, close: closeApproveModal },
  ] = useDisclosure(false);
  const [
    rejectModalOpened,
    { open: openRejectModal, close: closeRejectModal },
  ] = useDisclosure(false);

  return (
    <>
      <Group gap="sm">
        <Tooltip label="この申請を却下します" position="top" withArrow>
          <Button
            color="red"
            leftSection={<IconX size={16} />}
            onClick={openRejectModal}
            variant="light"
          >
            却下する
          </Button>
        </Tooltip>
        <Tooltip label="この申請を承認します" position="top" withArrow>
          <Button
            color="blue"
            leftSection={<IconCheck size={16} />}
            onClick={openApproveModal}
          >
            承認する
          </Button>
        </Tooltip>
      </Group>
      <ApprovePurchaseRequestModal
        amountYen={amountYen}
        onClose={closeApproveModal}
        opened={approveModalOpened}
        purchaseRequestId={purchaseRequestId}
        title={title}
      />
      <RejectPurchaseRequestModal
        amountYen={amountYen}
        onClose={closeRejectModal}
        opened={rejectModalOpened}
        purchaseRequestId={purchaseRequestId}
        title={title}
      />
    </>
  );
}
