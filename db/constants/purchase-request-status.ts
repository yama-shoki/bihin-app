export const PURCHASE_REQUEST_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;

export type PurchaseRequestStatus = (typeof PURCHASE_REQUEST_STATUSES)[number];
