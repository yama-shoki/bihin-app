import "server-only";
import { count, eq } from "drizzle-orm";
import { cache } from "react";
import { requireRole } from "@/app/lib/auth";
import { db } from "@/db";
import { purchaseRequests } from "@/db/schema/purchase-requests";

export const countPendingPurchaseRequests = cache(async (): Promise<number> => {
  await requireRole("admin");

  const [row] = await db
    .select({ value: count() })
    .from(purchaseRequests)
    .where(eq(purchaseRequests.status, "pending"));

  return row?.value ?? 0;
});
