import { describe, expect, it } from "vitest";
import {
  createPurchaseRequestSchema,
  rejectPurchaseRequestSchema,
} from "@/db/zod/purchase-request";

describe("createPurchaseRequestSchema", () => {
  const validInput = {
    title: "モニター購入",
    amountYen: 50000,
    childCategoryId: "cat-1",
    desiredPurchaseDate: new Date(),
  };

  it("有効な入力を受け入れる", () => {
    const result = createPurchaseRequestSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("desiredPurchaseDate が null でも受け入れる", () => {
    const result = createPurchaseRequestSchema.safeParse({
      ...validInput,
      desiredPurchaseDate: null,
    });
    expect(result.success).toBe(true);
  });

  it("金額が 0 円は拒否する", () => {
    const result = createPurchaseRequestSchema.safeParse({
      ...validInput,
      amountYen: 0,
    });
    expect(result.success).toBe(false);
  });

  it("金額が負の数は拒否する", () => {
    const result = createPurchaseRequestSchema.safeParse({
      ...validInput,
      amountYen: -100,
    });
    expect(result.success).toBe(false);
  });

  it("タイトルが空文字は拒否する", () => {
    const result = createPurchaseRequestSchema.safeParse({
      ...validInput,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("タイトルが 101 文字は拒否する", () => {
    const result = createPurchaseRequestSchema.safeParse({
      ...validInput,
      title: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe("rejectPurchaseRequestSchema", () => {
  it("有効な入力を受け入れる", () => {
    const result = rejectPurchaseRequestSchema.safeParse({
      purchaseRequestId: "req-1",
      comment: "予算超過のため",
    });
    expect(result.success).toBe(true);
  });

  it("comment が空文字は拒否する", () => {
    const result = rejectPurchaseRequestSchema.safeParse({
      purchaseRequestId: "req-1",
      comment: "",
    });
    expect(result.success).toBe(false);
  });

  it("comment が空白のみは拒否する", () => {
    const result = rejectPurchaseRequestSchema.safeParse({
      purchaseRequestId: "req-1",
      comment: "   ",
    });
    expect(result.success).toBe(false);
  });
});
