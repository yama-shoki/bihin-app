import { Anchor, Stack, Title } from "@mantine/core";
import dayjs from "dayjs";
import type { Route } from "next";
import Link from "next/link";
import { forbidden } from "next/navigation";
import { PurchaseRequestForm } from "@/app/(employee)/components/purchase-request-form";
import { FadeIn } from "@/app/components/common/fade-in";
import { canEditPurchaseRequest, requireRole } from "@/app/lib/auth";
import { listCategories } from "@/app/server/data/categories";
import { getPurchaseRequestById } from "@/app/server/data/purchase-requests";
import type { PurchaseRequest } from "@/db/types";

type Props = {
  params: Promise<{ id: PurchaseRequest["id"] }>;
};

function toIsoDate(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export default async function EditRequestPage({ params }: Props) {
  const { id } = await params;
  const { user } = await requireRole("employee");
  const [request, categories] = await Promise.all([
    getPurchaseRequestById(id),
    listCategories(),
  ]);

  if (
    !canEditPurchaseRequest(user, request.applicant.id) ||
    request.status !== "pending"
  ) {
    forbidden();
  }

  const detailHref = `/requests/${request.id}` as Route;

  return (
    <FadeIn>
      <Stack gap="lg">
        <Link href={detailHref} style={{ width: "fit-content" }}>
          <Anchor component="span" size="sm">
            ← 申請詳細に戻る
          </Anchor>
        </Link>
        <Title order={2}>申請を編集</Title>
        <PurchaseRequestForm
          categories={categories}
          initialValues={{
            title: request.title,
            amountYen: request.amountYen,
            parentCategoryId: request.parentCategory.id,
            childCategoryId: request.childCategory.id,
            // Mantine DateInput は YYYY-MM-DD の string を期待する。
            desiredPurchaseDate: request.desiredPurchaseDate
              ? toIsoDate(request.desiredPurchaseDate)
              : null,
          }}
          mode="edit"
          purchaseRequestId={request.id}
        />
      </Stack>
    </FadeIn>
  );
}
