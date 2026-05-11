import { Button, Group, Stack, Text, Title } from "@mantine/core";
import type { Route } from "next";
import Link from "next/link";
import { FadeIn } from "@/app/components/common/fade-in";
import { listCategories } from "@/app/server/data/categories";
import { getMyPurchaseRequests } from "@/app/server/data/purchase-requests";
import { EmployeeRequestsView } from "../components/employee-requests-view";

const NEW_REQUEST_PATH = "/requests/new" as Route;

export default async function RequestsPage() {
  const [requests, categories] = await Promise.all([
    getMyPurchaseRequests(),
    listCategories(),
  ]);

  return (
    <FadeIn>
      <Stack gap="lg">
        <Group align="center" justify="space-between">
          <Title order={2}>申請一覧</Title>
          <Link href={NEW_REQUEST_PATH}>
            <Button component="span">新規申請</Button>
          </Link>
        </Group>

        {requests.length === 0 ? (
          <Stack align="center" gap="md" py="xl">
            <Text c="dimmed">申請がありません</Text>
            <Link href={NEW_REQUEST_PATH}>
              <Button component="span">新規申請を作成</Button>
            </Link>
          </Stack>
        ) : (
          <EmployeeRequestsView categories={categories} requests={requests} />
        )}
      </Stack>
    </FadeIn>
  );
}
