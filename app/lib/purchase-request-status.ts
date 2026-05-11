import type { PurchaseRequestStatus } from "@/db/schema/purchase-requests";

export function canTransitionPurchaseRequestStatus(
  current: PurchaseRequestStatus,
  next: PurchaseRequestStatus,
): boolean {
  return current === "pending" && (next === "approved" || next === "rejected");
}
