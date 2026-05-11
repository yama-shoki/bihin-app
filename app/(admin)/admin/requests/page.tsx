import { Stack, Title } from "@mantine/core";
import { FadeIn } from "@/app/components/common/fade-in";
import { listCategories } from "@/app/server/data/categories";
import { getAllPurchaseRequests } from "@/app/server/data/purchase-requests";
import { AdminRequestsView } from "../../components/admin-requests-view";

export default async function AdminRequestsPage() {
  const [requests, categories] = await Promise.all([
    getAllPurchaseRequests(),
    listCategories(),
  ]);

  return (
    <FadeIn>
      <Stack gap="md">
        <Title order={2}>全申請</Title>
        <AdminRequestsView categories={categories} requests={requests} />
      </Stack>
    </FadeIn>
  );
}
