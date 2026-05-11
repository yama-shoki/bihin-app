import "server-only";
import { count, eq } from "drizzle-orm";
import { requireRole } from "@/app/lib/auth";
import { db } from "@/db";
import { purchaseRequests } from "@/db/schema/purchase-requests";

export async function countPendingPurchaseRequests(): Promise<number> {
  await requireRole("admin");

  const [row] = await db
    .select({ value: count() })
    .from(purchaseRequests)
    .where(eq(purchaseRequests.status, "pending"));

  return row?.value ?? 0;
}
