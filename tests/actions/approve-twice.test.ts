import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { approvalHistories } from "@/db/schema/approval-histories";
import { childCategories, parentCategories } from "@/db/schema/categories";
import { purchaseRequests } from "@/db/schema/purchase-requests";
import { users } from "@/db/schema/users";

const testClient = createClient({ url: "file::memory:?cache=shared" });
const testDb = drizzle(testClient, { casing: "snake_case" });

let approvePurchaseRequest: typeof import("@/app/server/actions/purchase-requests").approvePurchaseRequest;

const ADMIN_ID = "admin-1";
const EMP_ID = "emp-1";
const PARENT_ID = "parent-1";
const CHILD_ID = "child-1";
const REQ_ID = "req-1";

beforeAll(async () => {
  vi.doMock("@/db", () => ({ db: testDb }));
  vi.doMock("server-only", () => ({}));
  vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
  vi.doMock("@/app/lib/auth", () => ({
    requireSession: vi.fn(async () => ({
      user: {
        id: ADMIN_ID,
        name: "テスト管理者",
        department: "総務部",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
    canReviewPurchaseRequest: () => true,
  }));

  const actions = await import("@/app/server/actions/purchase-requests");
  approvePurchaseRequest = actions.approvePurchaseRequest;

  await migrate(testDb, { migrationsFolder: "./db/migrations" });
});

beforeEach(async () => {
  await testDb.delete(approvalHistories);
  await testDb.delete(purchaseRequests);
  await testDb.delete(childCategories);
  await testDb.delete(parentCategories);
  await testDb.delete(users);

  await testDb.insert(users).values([
    {
      id: ADMIN_ID,
      name: "テスト管理者",
      department: "総務部",
      role: "admin",
    },
    {
      id: EMP_ID,
      name: "テスト社員",
      department: "開発部",
      role: "employee",
    },
  ]);

  await testDb
    .insert(parentCategories)
    .values({ id: PARENT_ID, name: "PC周辺機器" });
  await testDb.insert(childCategories).values({
    id: CHILD_ID,
    parentCategoryId: PARENT_ID,
    name: "モニター",
  });

  await testDb.insert(purchaseRequests).values({
    id: REQ_ID,
    applicantUserId: EMP_ID,
    title: "27インチモニター",
    amountYen: 50000,
    childCategoryId: CHILD_ID,
    status: "pending",
  });
});

describe("approvePurchaseRequest 二重承認", () => {
  it("1 回目の承認は成功する", async () => {
    const result = await approvePurchaseRequest({ purchaseRequestId: REQ_ID });
    expect(result.ok).toBe(true);
  });

  it("同じ申請に 2 回承認すると 2 回目は CONFLICT で失敗する", async () => {
    const first = await approvePurchaseRequest({ purchaseRequestId: REQ_ID });
    expect(first.ok).toBe(true);

    const second = await approvePurchaseRequest({ purchaseRequestId: REQ_ID });
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.error.kind).toBe("CONFLICT");
    }
  });
});
