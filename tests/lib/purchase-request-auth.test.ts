import { describe, expect, it, vi } from "vitest";
import {
  canReviewPurchaseRequest,
  canViewPurchaseRequest,
} from "@/app/lib/auth";
import type { User, UserRole } from "@/db/types";

vi.mock("server-only", () => ({}));

function user(id: User["id"], role: UserRole): User {
  return {
    id,
    name: "テスト",
    department: "テスト部",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("canViewPurchaseRequest", () => {
  const owner = user("u1", "employee");
  const otherEmp = user("u2", "employee");
  const admin = user("admin", "admin");

  it("本人 → 閲覧可", () => {
    expect(canViewPurchaseRequest(owner, owner.id)).toBe(true);
  });

  it("他者 (employee) → 閲覧不可", () => {
    expect(canViewPurchaseRequest(otherEmp, owner.id)).toBe(false);
  });

  it("admin → 他者の申請でも閲覧可", () => {
    expect(canViewPurchaseRequest(admin, owner.id)).toBe(true);
  });

  it("admin → 本人 (admin) の申請も閲覧可", () => {
    expect(canViewPurchaseRequest(admin, admin.id)).toBe(true);
  });
});

describe("canReviewPurchaseRequest", () => {
  it("admin → 承認操作可", () => {
    expect(canReviewPurchaseRequest(user("a", "admin"))).toBe(true);
  });

  it("employee → 承認操作不可", () => {
    expect(canReviewPurchaseRequest(user("e", "employee"))).toBe(false);
  });
});
