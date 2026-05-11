import { Anchor, Stack } from "@mantine/core";
import type { Route } from "next";
import Link from "next/link";
import { AdminPurchaseRequestDetail } from "@/app/(admin)/components/admin-purchase-request-detail";
import { FadeIn } from "@/app/components/common/fade-in";
import {
  getPurchaseRequestById,
  listApprovalHistoriesForPurchaseRequest,
} from "@/app/server/data/purchase-requests";
import type { PurchaseRequest } from "@/db/types";

type Props = {
  params: Promise<{ id: PurchaseRequest["id"] }>;
};

export default async function AdminRequestDetailPage({ params }: Props) {
  const { id } = await params;
  const [request, histories] = await Promise.all([
    getPurchaseRequestById(id),
    listApprovalHistoriesForPurchaseRequest(id),
  ]);

  return (
    <FadeIn>
      <Stack gap="lg">
        <Link
          href={"/admin/requests" as Route}
          style={{ width: "fit-content" }}
        >
          <Anchor component="span" size="sm">
            ← 全申請に戻る
          </Anchor>
        </Link>
        <AdminPurchaseRequestDetail histories={histories} request={request} />
      </Stack>
    </FadeIn>
  );
}
