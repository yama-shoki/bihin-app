export const APPROVAL_HISTORY_KINDS = [
  "created",
  "approved",
  "rejected",
  "withdrawn",
] as const;

export type ApprovalHistoryKind = (typeof APPROVAL_HISTORY_KINDS)[number];
