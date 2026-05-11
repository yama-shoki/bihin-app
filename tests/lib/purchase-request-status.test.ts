import { describe, expect, it } from "vitest";
import { canTransitionPurchaseRequestStatus } from "@/app/lib/purchase-request-status";
import { PURCHASE_REQUEST_STATUSES } from "@/db/schema/purchase-requests";

const ALLOWED = new Set<string>(["pending->approved", "pending->rejected"]);

describe("canTransitionPurchaseRequestStatus", () => {
  for (const current of PURCHASE_REQUEST_STATUSES) {
    for (const next of PURCHASE_REQUEST_STATUSES) {
      const key = `${current}->${next}`;
      const expected = ALLOWED.has(key);

      it(`${key} -> ${expected}`, () => {
        expect(canTransitionPurchaseRequestStatus(current, next)).toBe(
          expected,
        );
      });
    }
  }
});
