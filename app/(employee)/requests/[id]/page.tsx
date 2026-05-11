import { Anchor, Stack } from "@mantine/core";
import type { Route } from "next";
import Link from "next/link";
import { EmployeePurchaseRequestDetail } from "@/app/(employee)/components/employee-purchase-request-detail";
import { FadeIn } from "@/app/components/common/fade-in";
import { dispatchPageError } from "@/app/lib/errors";
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

  try {
    const [request, histories] = await Promise.all([
      getPurchaseRequestById(id),
      listApprovalHistoriesForPurchaseRequest(id),
    ]);

    return (
      <FadeIn>
        <Stack gap="lg">
          <Link href={"/requests" as Route} style={{ width: "fit-content" }}>
            <Anchor component="span" size="sm">
              ← 申請一覧に戻る
            </Anchor>
          </Link>
          <EmployeePurchaseRequestDetail
            histories={histories}
            request={request}
          />
        </Stack>
      </FadeIn>
    );
  } catch (error) {
    dispatchPageError(error);
  }
}
