import type { PurchaseRequestStatus } from "@/db/types";

export function canTransitionPurchaseRequestStatus(
  current: PurchaseRequestStatus,
  next: PurchaseRequestStatus,
): boolean {
  return current === "pending" && (next === "approved" || next === "rejected");
}
