import type { PurchaseRequestStatus } from "@/db/types";

export function canTransitionPurchaseRequestStatus(
  current: PurchaseRequestStatus,
  next: PurchaseRequestStatus,
): boolean {
  if (current !== "pending") {
    return false;
  }
  return next === "approved" || next === "rejected" || next === "withdrawn";
}
