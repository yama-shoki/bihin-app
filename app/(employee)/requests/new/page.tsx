import { Anchor, Stack, Title } from "@mantine/core";
import type { Route } from "next";
import Link from "next/link";
import { FadeIn } from "@/app/components/common/fade-in";
import { listCategories } from "@/app/server/data/categories";
import { PurchaseRequestForm } from "../../components/purchase-request-form";

export default async function NewRequestPage() {
  const categories = await listCategories();

  return (
    <FadeIn>
      <Stack gap="lg">
        <Link href={"/requests" as Route} style={{ width: "fit-content" }}>
          <Anchor component="span" size="sm">
            ← 申請一覧に戻る
          </Anchor>
        </Link>
        <Title order={2}>新規申請</Title>
        <PurchaseRequestForm categories={categories} mode="create" />
      </Stack>
    </FadeIn>
  );
}
