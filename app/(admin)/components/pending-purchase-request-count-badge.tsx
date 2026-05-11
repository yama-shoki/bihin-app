import { Badge } from "@mantine/core";
import { countPendingPurchaseRequests } from "@/app/server/data/purchase-request-counts";

export async function PendingPurchaseRequestCountBadge() {
  const count = await countPendingPurchaseRequests();

  if (count === 0) {
    return null;
  }

  return (
    <Badge color="orange" size="sm" variant="filled">
      {count}
    </Badge>
  );
}
